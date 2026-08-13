import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });

interface Check {
  label: string;
  pass: boolean;
  detail: string;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const url = String(body.url ?? "").trim().slice(0, 600);
    if (!/^https?:\/\/.+/i.test(url)) {
      return json({ error: "Enter a valid http(s) URL" }, 400);
    }

    const started = Date.now();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);

    let res: Response;
    try {
      res = await fetch(url, {
        method: "GET",
        redirect: "follow",
        headers: { "User-Agent": "x402info-validator/1.0", Accept: "application/json, */*" },
        signal: controller.signal,
      });
    } catch (err) {
      clearTimeout(timer);
      return json({
        url,
        reachable: false,
        error: String((err as Error)?.message ?? err).slice(0, 300),
        checks: [],
      });
    }
    clearTimeout(timer);
    const latency = Date.now() - started;

    const raw = await res.text().catch(() => "");
    const text = raw.slice(0, 4000);
    let parsed: Record<string, unknown> | null = null;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = null;
    }

    const headers: Record<string, string> = {};
    res.headers.forEach((v, k) => {
      headers[k] = v.slice(0, 400);
    });

    // x402 v2 can carry the challenge in a base64 `payment-required` header
    // instead of (or as well as) the JSON body.
    let headerChallenge: Record<string, unknown> | null = null;
    const rawChallenge = res.headers.get("payment-required") ?? res.headers.get("x-payment-required");
    if (rawChallenge) {
      try {
        headerChallenge = JSON.parse(atob(rawChallenge));
      } catch {
        try {
          headerChallenge = JSON.parse(rawChallenge);
        } catch {
          headerChallenge = null;
        }
      }
    }

    const challenge: Record<string, unknown> | null =
      (parsed && (parsed.accepts || parsed.x402Version) ? parsed : null) ?? headerChallenge ?? parsed;

    const wwwAuth = headers["www-authenticate"] ?? "";
    const accepts =
      (challenge?.accepts as unknown[] | undefined) ??
      ((challenge?.paymentRequirements as unknown[] | undefined) ?? undefined);
    const firstAccept = (Array.isArray(accepts) ? accepts[0] : undefined) as
      | Record<string, unknown>
      | undefined;

    const checks: Check[] = [
      {
        label: "Returns HTTP 402 Payment Required",
        pass: res.status === 402,
        detail: `Got HTTP ${res.status}`,
      },
      {
        label: "Machine-readable challenge (JSON body or payment-required header)",
        pass: !!challenge,
        detail: headerChallenge
          ? "Challenge decoded from the payment-required header"
          : parsed
          ? "Valid JSON payload returned"
          : "No machine-readable challenge found",
      },
      {
        label: "Declares payment requirements (accepts / paymentRequirements)",
        pass: Array.isArray(accepts) && accepts.length > 0,
        detail: Array.isArray(accepts)
          ? `${accepts.length} payment option(s) advertised`
          : "No accepts[] array found in the body",
      },
      {
        label: "Specifies a network",
        pass: !!firstAccept?.network,
        detail: firstAccept?.network ? String(firstAccept.network) : "network field missing",
      },
      {
        label: "Specifies an amount",
        pass: !!(firstAccept?.maxAmountRequired ?? firstAccept?.amount ?? firstAccept?.price),
        detail: String(
          firstAccept?.maxAmountRequired ?? firstAccept?.amount ?? firstAccept?.price ?? "amount field missing"
        ),
      },
      {
        label: "Specifies a pay-to address",
        pass: !!(firstAccept?.payTo ?? firstAccept?.recipient ?? firstAccept?.address),
        detail: firstAccept?.payTo ? "payTo present" : "payTo / recipient field missing",
      },
      {
        label: "x402 version declared",
        pass: !!(challenge?.x402Version ?? challenge?.version),
        detail: String(challenge?.x402Version ?? challenge?.version ?? "x402Version missing"),
      },
      {
        label: "CORS enabled for browser clients",
        pass: !!headers["access-control-allow-origin"],
        detail: headers["access-control-allow-origin"] ?? "No Access-Control-Allow-Origin header",
      },
      {
        label: "WWW-Authenticate hint (optional, L402-style)",
        pass: wwwAuth.length > 0,
        detail: wwwAuth || "Not present (fine for x402)",
      },
    ];

    const required = checks.slice(0, 7);
    const score = Math.round((required.filter((c) => c.pass).length / required.length) * 100);

    return json({
      url,
      reachable: true,
      status: res.status,
      latency_ms: latency,
      score,
      verdict:
        score === 100
          ? "Fully x402-compliant"
          : score >= 70
          ? "Mostly compliant — minor gaps"
          : score >= 30
          ? "Partially compliant"
          : "Not an x402 endpoint",
      checks,
      headers,
      body_preview: text.slice(0, 1500),
    });
  } catch (err) {
    console.error("validate-402 error:", (err as Error)?.message ?? err);
    return json({ error: "Validation failed" }, 500);
  }
});