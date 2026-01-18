import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Fetching admin stats...");

    // Fetch subscriber counts
    const { count: totalSubscribers } = await supabase
      .from("subscribers")
      .select("*", { count: "exact", head: true });

    const { count: confirmedSubscribers } = await supabase
      .from("subscribers")
      .select("*", { count: "exact", head: true })
      .eq("confirmed", true);

    const { count: unsubscribedCount } = await supabase
      .from("subscribers")
      .select("*", { count: "exact", head: true })
      .not("unsubscribed_at", "is", null);

    // Fetch email event counts by type
    const { data: eventCounts } = await supabase
      .from("email_events")
      .select("event_type");

    const counts: Record<string, number> = {
      delivered: 0,
      bounced: 0,
      spam: 0,
      opened: 0,
      clicked: 0,
    };

    if (eventCounts) {
      for (const event of eventCounts) {
        const type = event.event_type?.toLowerCase() || "";
        if (type === "delivered" || type === "delivery") counts.delivered++;
        else if (type === "bounced" || type === "bounce") counts.bounced++;
        else if (type === "spam" || type === "spamcomplaint") counts.spam++;
        else if (type === "opened" || type === "open") counts.opened++;
        else if (type === "clicked" || type === "click") counts.clicked++;
      }
    }

    const stats = {
      subscribers: {
        total: totalSubscribers || 0,
        confirmed: confirmedSubscribers || 0,
        unsubscribed: unsubscribedCount || 0,
      },
      emails: {
        delivered: counts.delivered,
        bounced: counts.bounced,
        spam: counts.spam,
        opened: counts.opened,
        clicked: counts.clicked,
        openRate: counts.delivered > 0 ? Math.round((counts.opened / counts.delivered) * 100) : 0,
        clickRate: counts.delivered > 0 ? Math.round((counts.clicked / counts.delivered) * 100) : 0,
      },
    };

    console.log("Stats:", stats);

    return new Response(
      JSON.stringify(stats),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    console.error("Error in admin-stats function:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
