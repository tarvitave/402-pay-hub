import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Postmark checks the URL when a webhook is saved; answer anything without an event with 200
    const payload = await req.json().catch(() => null);
    if (!payload?.RecordType) {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    console.log("Received Postmark webhook:", JSON.stringify(payload));

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Determine event type from Postmark payload
    const recordType = payload.RecordType;
    let eventData: Record<string, any> = {
      message_id: payload.MessageID,
      recipient: payload.Recipient || payload.Email,
      raw_payload: payload,
    };

    switch (recordType) {
      case "Delivery":
        eventData.event_type = "delivered";
        eventData.delivered_at = payload.DeliveredAt;
        break;
      case "Bounce":
        eventData.event_type = "bounced";
        eventData.bounced_at = payload.BouncedAt;
        eventData.bounce_type = payload.Type;
        eventData.bounce_description = payload.Description;
        break;
      case "Open":
        eventData.event_type = "opened";
        eventData.opened_at = payload.ReceivedAt;
        eventData.user_agent = payload.UserAgent;
        break;
      case "Click":
        eventData.event_type = "clicked";
        eventData.clicked_at = payload.ReceivedAt;
        eventData.link_clicked = payload.OriginalLink;
        eventData.user_agent = payload.UserAgent;
        break;
      case "SpamComplaint":
        eventData.event_type = "spam_complaint";
        break;
      case "SubscriptionChange":
        eventData.event_type = "unsubscribed";
        break;
      default:
        eventData.event_type = recordType?.toLowerCase() || "unknown";
    }

    // Insert event into database
    const { error } = await supabase.from("email_events").insert(eventData);

    if (error) {
      console.error("Error inserting email event:", error);
      return new Response(
        JSON.stringify({ error: "Failed to store event" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Stored ${eventData.event_type} event for ${eventData.recipient}`);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in postmark-webhook function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
