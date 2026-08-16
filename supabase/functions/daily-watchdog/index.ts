import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const REPORT_TO = "colin@tarvit.com";
const FROM = "newsletter@x402info.com";

type Row = Record<string, unknown>;

async function fetchAll(
  supabase: ReturnType<typeof createClient>,
  table: string,
  columns: string,
  sinceISO: string,
  timeColumn = "created_at",
): Promise<Row[]> {
  const all: Row[] = [];
  const pageSize = 1000;
  let offset = 0;
  while (true) {
    const { data, error } = await supabase
      .from(table)
      .select(columns)
      .gte(timeColumn, sinceISO)
      .order(timeColumn, { ascending: true })
      .range(offset, offset + pageSize - 1);
    if (error) {
      console.error(`Error reading ${table}:`, error.message);
      break;
    }
    if (!data || data.length === 0) break;
    all.push(...(data as Row[]));
    if (data.length < pageSize) break;
    offset += pageSize;
  }
  return all;
}

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const fmtDuration = (seconds: number) => {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}m ${s}s`;
};

function table(headers: string[], rows: (string | number)[][]) {
  if (rows.length === 0) return `<p style="color:#666;margin:0 0 16px">None in this period.</p>`;
  return `<table style="border-collapse:collapse;width:100%;margin:0 0 22px;font-size:14px">
    <thead><tr>${headers
      .map(
        (h) =>
          `<th style="text-align:left;padding:8px 10px;background:#f4f6f8;border-bottom:2px solid #e2e6ea">${esc(h)}</th>`,
      )
      .join("")}</tr></thead>
    <tbody>${rows
      .map(
        (r) =>
          `<tr>${r
            .map(
              (c) =>
                `<td style="padding:8px 10px;border-bottom:1px solid #eef1f4;vertical-align:top">${esc(String(c))}</td>`,
            )
            .join("")}</tr>`,
      )
      .join("")}</tbody>
  </table>`;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    let hours = 24;
    let dryRun = false;
    try {
      const body = await req.json();
      if (body && typeof body === "object") {
        if (Number.isFinite(Number(body.hours))) {
          hours = Math.min(Math.max(Number(body.hours), 1), 168);
        }
        dryRun = body.dry_run === true;
      }
    } catch {
      // no body — use defaults
    }

    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    const sinceISO = since.toISOString();
    const now = new Date();

    const [views, errors, actions, subscribers, submissions, emailEvents] = await Promise.all([
      fetchAll(supabase, "page_views", "page_path, visitor_id, duration_seconds, referrer, created_at", sinceISO),
      fetchAll(supabase, "client_errors", "page_path, error_type, message, created_at", sinceISO),
      fetchAll(supabase, "user_actions", "page_path, action, label, visitor_id, created_at", sinceISO),
      fetchAll(supabase, "subscribers", "email, subscribed_at, confirmed", sinceISO, "subscribed_at"),
      fetchAll(supabase, "ecosystem_submissions", "project_name, category, url, created_at", sinceISO),
      fetchAll(supabase, "email_events", "event_type, recipient, created_at", sinceISO),
    ]);

    // --- Traffic ---
    const visitors = new Set(views.map((v) => String(v.visitor_id)));
    const pageStats = new Map<
      string,
      { views: number; visitors: Set<string>; totalTime: number; timed: number }
    >();
    for (const v of views) {
      const path = String(v.page_path || "/");
      const stat = pageStats.get(path) ?? {
        views: 0,
        visitors: new Set<string>(),
        totalTime: 0,
        timed: 0,
      };
      stat.views++;
      stat.visitors.add(String(v.visitor_id));
      const d = Number(v.duration_seconds);
      if (Number.isFinite(d) && d > 0) {
        stat.totalTime += d;
        stat.timed++;
      }
      pageStats.set(path, stat);
    }

    const popular = [...pageStats.entries()]
      .sort((a, b) => b[1].views - a[1].views)
      .slice(0, 15)
      .map(([path, s]) => [
        path,
        s.views,
        s.visitors.size,
        s.timed ? fmtDuration(s.totalTime / s.timed) : "—",
      ]);

    const stickiest = [...pageStats.entries()]
      .filter(([, s]) => s.timed > 0)
      .sort((a, b) => b[1].totalTime / b[1].timed - a[1].totalTime / a[1].timed)
      .slice(0, 10)
      .map(([path, s]) => [path, fmtDuration(s.totalTime / s.timed), fmtDuration(s.totalTime), s.timed]);

    // --- Referrers ---
    const refCounts = new Map<string, number>();
    for (const v of views) {
      const raw = String(v.referrer || "").trim();
      if (!raw) continue;
      let host = raw;
      try {
        host = new URL(raw).hostname;
      } catch { /* keep raw */ }
      if (host.includes("x402info")) continue;
      refCounts.set(host, (refCounts.get(host) ?? 0) + 1);
    }
    const referrers = [...refCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([host, count]) => [host, count]);

    // --- Errors ---
    const IGNORED_ERRORS = [
      /Object Not Found Matching Id/i,
      /ResizeObserver loop/i,
      /^Script error\.?$/i,
    ];
    const errCounts = new Map<string, { count: number; pages: Set<string>; type: string }>();
    for (const e of errors) {
      const key = String(e.message || "").slice(0, 200);
      if (!key || IGNORED_ERRORS.some((p) => p.test(key))) continue;
      const entry = errCounts.get(key) ?? { count: 0, pages: new Set<string>(), type: String(e.error_type || "error") };
      entry.count++;
      entry.pages.add(String(e.page_path || "—"));
      errCounts.set(key, entry);
    }
    const errorRows = [...errCounts.entries()]
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 15)
      .map(([msg, e]) => [e.type, msg, e.count, [...e.pages].slice(0, 3).join(", ")]);

    // --- Actions ---
    const actionCounts = new Map<string, { count: number; visitors: Set<string>; labels: Set<string> }>();
    for (const a of actions) {
      const key = String(a.action);
      const entry = actionCounts.get(key) ?? { count: 0, visitors: new Set<string>(), labels: new Set<string>() };
      entry.count++;
      entry.visitors.add(String(a.visitor_id));
      if (a.label) entry.labels.add(String(a.label));
      actionCounts.set(key, entry);
    }
    const actionRows = [...actionCounts.entries()]
      .sort((a, b) => b[1].count - a[1].count)
      .map(([name, a]) => [name, a.count, a.visitors.size, [...a.labels].slice(0, 4).join(", ") || "—"]);

    // --- Email delivery health ---
    const eventCounts = new Map<string, number>();
    for (const e of emailEvents) {
      const t = String(e.event_type || "").toLowerCase();
      eventCounts.set(t, (eventCounts.get(t) ?? 0) + 1);
    }
    const emailRows = [...eventCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([type, count]) => [type, count]);

    const newSubRows = subscribers
      .slice(-25)
      .reverse()
      .map((s) => [
        String(s.email),
        s.confirmed ? "confirmed" : "pending",
        new Date(String(s.subscribed_at)).toISOString().replace("T", " ").slice(0, 16) + " UTC",
      ]);

    const submissionRows = submissions.map((s) => [
      String(s.project_name),
      String(s.category),
      String(s.url),
      new Date(String(s.created_at)).toISOString().replace("T", " ").slice(0, 16) + " UTC",
    ]);

    const timedViews = views.filter((v) => Number(v.duration_seconds) > 0);
    const avgTime = timedViews.length
      ? timedViews.reduce((sum, v) => sum + Number(v.duration_seconds), 0) / timedViews.length
      : 0;

    const summaryCards: [string, string][] = [
      ["Page views", String(views.length)],
      ["Unique visitors", String(visitors.size)],
      ["Avg. time on page", timedViews.length ? fmtDuration(avgTime) : "—"],
      ["New subscribers", String(subscribers.length)],
      ["Errors logged", String(errors.length)],
      ["Actions taken", String(actions.length)],
    ];

    const dateLabel = now.toUTCString().slice(0, 16);

    const html = `<!doctype html><html><body style="margin:0;padding:24px;background:#f7f9fb;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#1a2027">
  <div style="max-width:760px;margin:0 auto;background:#fff;border-radius:12px;padding:28px;border:1px solid #e6eaee">
    <p style="margin:0;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#0891b2;font-weight:700">x402info production watchdog</p>
    <h1 style="margin:6px 0 4px;font-size:24px">Daily report — ${esc(dateLabel)}</h1>
    <p style="margin:0 0 22px;color:#667">Covering the last ${hours} hours (since ${esc(sinceISO.replace("T", " ").slice(0, 16))} UTC)</p>

    <table style="width:100%;border-collapse:separate;border-spacing:8px;margin:0 0 22px">
      <tr>${summaryCards
        .slice(0, 3)
        .map(
          ([label, value]) =>
            `<td style="background:#f4f9fb;border:1px solid #e2eef2;border-radius:10px;padding:12px;text-align:center"><div style="font-size:22px;font-weight:700">${esc(value)}</div><div style="font-size:12px;color:#667">${esc(label)}</div></td>`,
        )
        .join("")}</tr>
      <tr>${summaryCards
        .slice(3)
        .map(
          ([label, value]) =>
            `<td style="background:#f4f9fb;border:1px solid #e2eef2;border-radius:10px;padding:12px;text-align:center"><div style="font-size:22px;font-weight:700">${esc(value)}</div><div style="font-size:12px;color:#667">${esc(label)}</div></td>`,
        )
        .join("")}</tr>
    </table>

    <h2 style="font-size:17px;margin:22px 0 10px">Most popular pages</h2>
    ${table(["Page", "Views", "Visitors", "Avg. time"], popular)}

    <h2 style="font-size:17px;margin:22px 0 10px">Pages people spent the most time on</h2>
    ${table(["Page", "Avg. time", "Total time", "Timed visits"], stickiest)}

    <h2 style="font-size:17px;margin:22px 0 10px">Actions & configuration changes</h2>
    ${table(["Action", "Times", "Visitors", "Details"], actionRows)}

    <h2 style="font-size:17px;margin:22px 0 10px">Errors & issues encountered</h2>
    ${table(["Type", "Message", "Count", "Pages"], errorRows)}

    <h2 style="font-size:17px;margin:22px 0 10px">New subscribers</h2>
    ${table(["Email", "Status", "When"], newSubRows)}

    <h2 style="font-size:17px;margin:22px 0 10px">Project submissions</h2>
    ${table(["Project", "Category", "URL", "When"], submissionRows)}

    <h2 style="font-size:17px;margin:22px 0 10px">Email delivery events</h2>
    ${table(["Event", "Count"], emailRows)}

    <h2 style="font-size:17px;margin:22px 0 10px">Top referrers</h2>
    ${table(["Source", "Views"], referrers)}

    <p style="margin:26px 0 0;font-size:12px;color:#889">Automated report from the x402info production watchdog. Sent daily at 08:00 UTC.</p>
  </div>
</body></html>`;

    const textLines = [
      `x402info production watchdog — last ${hours}h`,
      ...summaryCards.map(([l, v]) => `${l}: ${v}`),
      "",
      "Top pages:",
      ...popular.map((r) => `  ${r[0]} — ${r[1]} views, ${r[2]} visitors, avg ${r[3]}`),
      "",
      "Errors:",
      ...(errorRows.length ? errorRows.map((r) => `  [${r[0]}] ${r[1]} (${r[2]}x)`) : ["  none"]),
    ];

    if (dryRun) {
      return new Response(JSON.stringify({ dry_run: true, html, summary: summaryCards }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const postmarkApiKey = Deno.env.get("POSTMARK_API_KEY");
    if (!postmarkApiKey) {
      console.error("POSTMARK_API_KEY not configured");
      return new Response(JSON.stringify({ error: "Email sending is not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const res = await fetch("https://api.postmarkapp.com/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Postmark-Server-Token": postmarkApiKey,
      },
      body: JSON.stringify({
        From: FROM,
        To: REPORT_TO,
        Subject: `x402info daily report — ${dateLabel} (${views.length} views, ${errors.length} errors)`,
        HtmlBody: html,
        TextBody: textLines.join("\n"),
        MessageStream: "outbound",
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      console.error("Postmark error:", res.status, detail);
      return new Response(JSON.stringify({ error: "Failed to send report email" }), {
        status: 502,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log(`Watchdog report sent to ${REPORT_TO}: ${views.length} views, ${errors.length} errors`);

    return new Response(
      JSON.stringify({ success: true, sent_to: REPORT_TO, hours, pageviews: views.length, errors: errors.length }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  } catch (error: unknown) {
    console.error("Error in daily-watchdog function:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
