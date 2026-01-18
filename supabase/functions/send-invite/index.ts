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

// Limit emails per invocation to avoid WORKER_LIMIT timeout (cron runs every 6 min → ~50/hour)
const EMAILS_PER_INVOCATION = 5;
const BATCH_SIZE = 500;
const PAGE_SIZE = 1000;

// Helper to fetch all emails from a table with pagination
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchAllEmails(supabase: any, table: string): Promise<Set<string>> {
  const emails = new Set<string>();
  let offset = 0;

  while (true) {
    const { data: batch, error } = await supabase
      .from(table)
      .select("email")
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) {
      console.error(`Error fetching ${table} at offset ${offset}:`, error);
      break;
    }

    if (!batch || batch.length === 0) break;

    batch.forEach((r: { email: string }) => emails.add(r.email.toLowerCase()));
    console.log(`Fetched ${batch.length} from ${table}, total so far: ${emails.size}`);

    if (batch.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }

  return emails;
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

    // Upload contacts from CSV - with batch processing and global duplicate checking
    if (action === "upload") {
      if (!contacts || contacts.length === 0) {
        return new Response(
          JSON.stringify({ error: "No contacts provided" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      console.log(`Starting upload of ${contacts.length} contacts`);

      // Fetch ALL existing emails globally (handles 45k+ records)
      console.log("Fetching existing subscribers...");
      const existingSubscribers = await fetchAllEmails(supabase, "subscribers");
      console.log(`Found ${existingSubscribers.size} existing subscribers`);

      console.log("Fetching existing invite contacts...");
      const existingInvites = await fetchAllEmails(supabase, "invite_contacts");
      console.log(`Found ${existingInvites.size} existing invite contacts`);

      // Filter out duplicates and invalid emails
      const validContacts: Array<{ email: string; name: string | null; status: string }> = [];
      let skippedInvalid = 0;
      let skippedDuplicate = 0;

      for (const contact of contacts) {
        const email = contact.email?.toLowerCase().trim();
        if (!email || !email.includes("@")) {
          skippedInvalid++;
          continue;
        }

        if (existingSubscribers.has(email) || existingInvites.has(email)) {
          skippedDuplicate++;
          continue;
        }

        validContacts.push({
          email,
          name: contact.name?.trim() || null,
          status: "pending"
        });
      }

      console.log(`Filtered: ${validContacts.length} valid, ${skippedInvalid} invalid, ${skippedDuplicate} duplicates`);

      // Batch insert with upsert as safety net
      let totalInserted = 0;
      const totalBatches = Math.ceil(validContacts.length / BATCH_SIZE);

      for (let i = 0; i < validContacts.length; i += BATCH_SIZE) {
        const batch = validContacts.slice(i, i + BATCH_SIZE);
        const batchNum = Math.floor(i / BATCH_SIZE) + 1;

        const { data: insertedData, error: insertError } = await supabase
          .from("invite_contacts")
          .upsert(batch, { onConflict: "email", ignoreDuplicates: true })
          .select();

        if (insertError) {
          console.error(`Batch ${batchNum}/${totalBatches} error:`, insertError);
        } else {
          const insertedCount = insertedData?.length || 0;
          totalInserted += insertedCount;
          console.log(`Batch ${batchNum}/${totalBatches}: inserted ${insertedCount}, total ${totalInserted}/${validContacts.length}`);
        }
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          added: totalInserted, 
          skipped: skippedInvalid + skippedDuplicate,
          details: {
            invalid: skippedInvalid,
            duplicate: skippedDuplicate,
            existingSubscribers: existingSubscribers.size,
            existingInvites: existingInvites.size
          }
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Send invites - limited to EMAILS_PER_INVOCATION to avoid timeout
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

      // Get pending contacts - limit to EMAILS_PER_INVOCATION to avoid WORKER_LIMIT timeout
      const { data: pendingContacts, error: contactsError } = await supabase
        .from("invite_contacts")
        .select("*")
        .eq("status", "pending")
        .limit(EMAILS_PER_INVOCATION);

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

      console.log(`Sending to ${pendingContacts.length} contacts (limit: ${EMAILS_PER_INVOCATION})`);

      const subscribeUrl = "https://x402info.com/#newsletter";
      let sent = 0;
      let failed = 0;

      // Send emails without artificial delays
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
            console.log(`Sent to ${contact.email} (${sent}/${pendingContacts.length})`);
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

      console.log(`Completed: sent ${sent}, failed ${failed}`);

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
