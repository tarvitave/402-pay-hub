import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });

interface EndpointRow {
  id: string;
  url: string;
}

async function probe(url: string) {
  const started = Date.now();
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      headers: { "User-Agent": "x402info-registry-healthcheck/1.0" },
      signal: controller.signal,
    });
    clearTimeout(timer);
    const latency = Date.now() - started;
    const paymentHeader =
      res.headers.get("www-authenticate") ??
      res.headers.get("x-payment") ??
      res.headers.get("x-payment-required") ??
      res.headers.get("payment-required") ??
      null;
    return {
      status_code: res.status,
      ok: res.status < 500,
      is_402: res.status === 402,
      payment_header: paymentHeader?.slice(0, 500) ?? null,
      latency_ms: latency,
      error: null as string | null,
    };
  } catch (err) {
    return {
      status_code: null,
      ok: false,
      is_402: false,
      payment_header: null,
      latency_ms: Date.now() - started,
      error: String((err as Error)?.message ?? err).slice(0, 300),
    };
  }
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const action = String(body.action ?? "list");

    if (action === "list") {
      const { data, error } = await supabase
        .from("x402_endpoints")
        .select("*")
        .eq("approved", true)
        .eq("active", true)
        .order("uptime_24h", { ascending: false, nullsFirst: false })
        .order("name");
      if (error) throw error;
      return json({ endpoints: data ?? [] });
    }

    if (action === "admin-list") {
      const { data, error } = await supabase
        .from("x402_endpoints")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return json({ endpoints: data ?? [] });
    }

    if (action === "set-approval") {
      const id = String(body.id ?? "");
      if (!id) return json({ error: "id required" }, 400);
      const { error } = await supabase
        .from("x402_endpoints")
        .update({ approved: !!body.approved, active: body.active ?? true })
        .eq("id", id);
      if (error) throw error;
      return json({ success: true });
    }

    if (action === "submit") {
      const name = String(body.name ?? "").trim().slice(0, 120);
      const url = String(body.url ?? "").trim().slice(0, 500);
      const description = String(body.description ?? "").trim().slice(0, 600);
      const category = String(body.category ?? "api").trim().slice(0, 40);
      const price = String(body.price ?? "").trim().slice(0, 40) || null;
      const network = String(body.network ?? "").trim().slice(0, 40) || null;
      const docsUrl = String(body.docs_url ?? "").trim().slice(0, 500) || null;
      const email = String(body.email ?? "").toLowerCase().trim().slice(0, 320);

      if (!name || !/^https?:\/\/.+/i.test(url) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return json({ error: "Invalid submission" }, 400);
      }

      const check = await probe(url);
      const { error } = await supabase.from("x402_endpoints").upsert(
        {
          name,
          url,
          description,
          category,
          price,
          network,
          docs_url: docsUrl,
          submitted_by_email: email,
          approved: false,
          supports_402: check.is_402,
          last_status: check.status_code,
          last_latency_ms: check.latency_ms,
          last_checked_at: new Date().toISOString(),
        },
        { onConflict: "url" }
      );
      if (error) throw error;
      return json({ success: true, detected_402: check.is_402, status: check.status_code });
    }

    if (action === "check-all") {
      const { data: endpoints, error } = await supabase
        .from("x402_endpoints")
        .select("id, url")
        .eq("active", true);
      if (error) throw error;

      const rows = (endpoints ?? []) as EndpointRow[];
      let checked = 0;
      for (const ep of rows) {
        const result = await probe(ep.url);
        await supabase.from("endpoint_health_checks").insert({ endpoint_id: ep.id, ...result });

        const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
        const { data: recent } = await supabase
          .from("endpoint_health_checks")
          .select("ok")
          .eq("endpoint_id", ep.id)
          .gte("created_at", since);
        const total = recent?.length ?? 0;
        const up = (recent ?? []).filter((r: { ok: boolean }) => r.ok).length;
        const uptime = total > 0 ? Math.round((up / total) * 1000) / 10 : null;

        await supabase
          .from("x402_endpoints")
          .update({
            last_status: result.status_code,
            last_latency_ms: result.latency_ms,
            last_checked_at: new Date().toISOString(),
            supports_402: result.is_402 ? true : undefined,
            uptime_24h: uptime,
          })
          .eq("id", ep.id);
        checked++;
      }
      return json({ success: true, checked });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (err) {
    console.error("registry error:", (err as Error)?.message ?? err);
    return json({ error: "Registry request failed" }, 500);
  }
});