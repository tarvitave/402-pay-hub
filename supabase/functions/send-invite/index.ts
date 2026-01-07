import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InviteRequest {
  action: "upload" | "send" | "getSettings" | "updateSettings" | "getContacts";
  contacts?: Array<{ name?: string; email: string }>;
  emailsPerHour?: number;
  emailSubject?: string;
  emailTemplate?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, contacts, emailsPerHour, emailSubject, emailTemplate }: InviteRequest = await req.json();

    // Get settings
    if (action === "getSettings") {
      const { data, error } = await supabase
        .from("invite_settings")
        .select("*")
        .limit(1)
        .single();

      if (error) {
        console.error("Error fetching settings:", error);
        return new Response(
          JSON.stringify({ error: "Failed to fetch settings" }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      return new Response(
        JSON.stringify(data),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Update settings
    if (action === "updateSettings") {
      const { data: existing } = await supabase
        .from("invite_settings")
        .select("id")
        .limit(1)
        .single();

      const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (emailsPerHour !== undefined) updateData.emails_per_hour = emailsPerHour;
      if (emailSubject !== undefined) updateData.email_subject = emailSubject;
      if (emailTemplate !== undefined) updateData.email_template = emailTemplate;

      const { error } = await supabase
        .from("invite_settings")
        .update(updateData)
        .eq("id", existing?.id);

      if (error) {
        console.error("Error updating settings:", error);
        return new Response(
          JSON.stringify({ error: "Failed to update settings" }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get contacts
    if (action === "getContacts") {
      const { data, error } = await supabase
        .from("invite_contacts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching contacts:", error);
        return new Response(
          JSON.stringify({ error: "Failed to fetch contacts" }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      return new Response(
        JSON.stringify(data || []),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Upload contacts from CSV
    if (action === "upload") {
      if (!contacts || contacts.length === 0) {
        return new Response(
          JSON.stringify({ error: "No contacts provided" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      let added = 0;
      let skipped = 0;

      for (const contact of contacts) {
        const email = contact.email.toLowerCase().trim();
        if (!email || !email.includes("@")) {
          skipped++;
          continue;
        }

        // Check if already exists in invite_contacts
        const { data: existingContact } = await supabase
          .from("invite_contacts")
          .select("id")
          .eq("email", email)
          .maybeSingle();

        // Check if already a subscriber
        const { data: existingSubscriber } = await supabase
          .from("subscribers")
          .select("id")
          .eq("email", email)
          .maybeSingle();

        if (existingContact || existingSubscriber) {
          skipped++;
          continue;
        }

        const { error: insertError } = await supabase
          .from("invite_contacts")
          .insert({
            email,
            name: contact.name?.trim() || null,
            status: "pending"
          });

        if (insertError) {
          console.error("Error inserting contact:", insertError);
          skipped++;
        } else {
          added++;
        }
      }

      return new Response(
        JSON.stringify({ success: true, added, skipped }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Send invites
    if (action === "send") {
      const postmarkApiKey = Deno.env.get("POSTMARK_API_KEY");
      if (!postmarkApiKey) {
        return new Response(
          JSON.stringify({ error: "POSTMARK_API_KEY not configured" }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Get settings
      const { data: settings } = await supabase
        .from("invite_settings")
        .select("*")
        .limit(1)
        .single();

      if (!settings) {
        return new Response(
          JSON.stringify({ error: "Settings not found" }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Get pending contacts (limit to emails_per_hour)
      const { data: pendingContacts, error: contactsError } = await supabase
        .from("invite_contacts")
        .select("*")
        .eq("status", "pending")
        .limit(settings.emails_per_hour);

      if (contactsError) {
        console.error("Error fetching pending contacts:", contactsError);
        return new Response(
          JSON.stringify({ error: "Failed to fetch contacts" }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      if (!pendingContacts || pendingContacts.length === 0) {
        return new Response(
          JSON.stringify({ success: true, sent: 0, message: "No pending contacts to send" }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      const subscribeUrl = "https://x402info.com/#newsletter";
      let sent = 0;
      let failed = 0;

      for (const contact of pendingContacts) {
        const personalizedTemplate = settings.email_template
          .replace(/\{\{name\}\}/g, contact.name || "there")
          .replace(/\{\{subscribe_url\}\}/g, subscribeUrl);

        const htmlBody = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <h1 style="color: #00f0ff; margin-bottom: 24px;">x402 Protocol Newsletter</h1>
            ${personalizedTemplate.split('\n').map((line: string) => `<p style="color: #333; font-size: 16px; line-height: 1.6;">${line}</p>`).join('')}
            <a href="${subscribeUrl}" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background-color: #00f0ff; color: #000; text-decoration: none; border-radius: 6px; font-weight: bold;">Subscribe Now</a>
            <hr style="border: none; border-top: 1px solid #eee; margin: 40px 0 20px;">
            <p style="color: #999; font-size: 12px;">
              You received this invitation because someone thought you might be interested in x402 Protocol.
            </p>
          </div>
        `;

        try {
          const response = await fetch("https://api.postmarkapp.com/email", {
            method: "POST",
            headers: {
              "Accept": "application/json",
              "Content-Type": "application/json",
              "X-Postmark-Server-Token": postmarkApiKey,
            },
            body: JSON.stringify({
              From: "newsletter@x402info.com",
              To: contact.email,
              Subject: settings.email_subject,
              HtmlBody: htmlBody,
              TextBody: personalizedTemplate,
              MessageStream: "broadcast",
            }),
          });

          if (response.ok) {
            await supabase
              .from("invite_contacts")
              .update({ status: "sent", invited_at: new Date().toISOString() })
              .eq("id", contact.id);
            sent++;
          } else {
            const errorResult = await response.json();
            console.error("Postmark error for", contact.email, errorResult);
            await supabase
              .from("invite_contacts")
              .update({ status: "failed" })
              .eq("id", contact.id);
            failed++;
          }
        } catch (err) {
          console.error("Error sending to", contact.email, err);
          failed++;
        }
      }

      return new Response(
        JSON.stringify({ success: true, sent, failed }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    console.error("Error in send-invite function:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
