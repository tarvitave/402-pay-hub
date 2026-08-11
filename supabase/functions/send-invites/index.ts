import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InviteRequest {
  action: "get-lists" | "create-list" | "delete-list" | "list-invites" | "upload" | "send" | "pause" | "resume" | "pause-list" | "resume-list" | "remove" | "status" | "get-settings" | "update-settings" | "dedupe-all" | "clean-bad-emails" | "check-email-servers" | "suppression-stats";
  listId?: string;
  name?: string;
  description?: string;
  contacts?: Array<{ name?: string; email: string }>;
  inviteId?: string;
  emailsPerHour?: number;
  emailSubject?: string;
  emailTemplate?: string;
}

// Limit emails per invocation to avoid WORKER_LIMIT timeout
const EMAILS_PER_INVOCATION = 5;
const BATCH_SIZE = 500;
const PAGE_SIZE = 1000;

// Helper to fetch all emails from a table with pagination
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchSuppressed(supabase: any): Promise<Set<string>> {
  const emails = new Set<string>();
  let offset = 0;
  while (true) {
    const { data, error } = await supabase
      .from("email_suppressions")
      .select("email")
      .range(offset, offset + PAGE_SIZE - 1);
    if (error) {
      console.error("suppression fetch error:", error);
      break;
    }
    if (!data || data.length === 0) break;
    for (const row of data) emails.add(String(row.email).toLowerCase().trim());
    if (data.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }
  return emails;
}

// Helper to fetch all emails from a table with pagination
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchAllEmails(supabase: any, table: string, listId?: string): Promise<Set<string>> {
  const emails = new Set<string>();
  let offset = 0;

  while (true) {
    let query = supabase.from(table).select("email").range(offset, offset + PAGE_SIZE - 1);
    
    // For email_invites, optionally filter by list
    if (table === "email_invites" && listId) {
      query = query.eq("list_id", listId);
    }

    const { data: batch, error } = await query;

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

    const body: InviteRequest = await req.json();
    const { action } = body;

    // Deduplicate emails across ALL mailing lists (keep one row per email)
    if (action === "dedupe-all") {
      const rows: Array<{ id: string; email: string; status: string | null; created_at: string | null }> = [];
      let offset = 0;
      while (true) {
        const { data: batch, error } = await supabase
          .from("email_invites")
          .select("id, email, status, created_at")
          .order("created_at", { ascending: true })
          .range(offset, offset + PAGE_SIZE - 1);
        if (error) {
          console.error("dedupe fetch error:", error);
          return new Response(
            JSON.stringify({ error: "Failed to read invites" }),
            { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }
        if (!batch || batch.length === 0) break;
        rows.push(...batch);
        if (batch.length < PAGE_SIZE) break;
        offset += PAGE_SIZE;
      }

      const rank = (status: string | null) => (status === "sent" ? 3 : status === "pending" ? 2 : 1);
      const keepers = new Map<string, { id: string; status: string | null }>();
      const toDelete: string[] = [];

      for (const row of rows) {
        const key = (row.email || "").toLowerCase().trim();
        if (!key) continue;
        const current = keepers.get(key);
        if (!current) {
          keepers.set(key, { id: row.id, status: row.status });
          continue;
        }
        if (rank(row.status) > rank(current.status)) {
          toDelete.push(current.id);
          keepers.set(key, { id: row.id, status: row.status });
        } else {
          toDelete.push(row.id);
        }
      }

      let removed = 0;
      for (let i = 0; i < toDelete.length; i += BATCH_SIZE) {
        const chunk = toDelete.slice(i, i + BATCH_SIZE);
        const { error } = await supabase.from("email_invites").delete().in("id", chunk);
        if (error) console.error("dedupe delete error:", error);
        else removed += chunk.length;
      }

      console.log(`Dedupe complete: scanned ${rows.length}, unique ${keepers.size}, removed ${removed}`);

      return new Response(
        JSON.stringify({ success: true, scanned: rows.length, unique: keepers.size, removed }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Dry run: list reachable email servers (no changes made)
    if (action === "check-email-servers") {
      const accountToken = Deno.env.get("POSTMARK_ACCOUNT_API_TOKEN");
      if (!accountToken) {
        return new Response(
          JSON.stringify({ usedAccountToken: false, servers: [] }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
      const names: string[] = [];
      let sOffset = 0;
      while (true) {
        const res = await fetch(`https://api.postmarkapp.com/servers?count=50&offset=${sOffset}`, {
          headers: { Accept: "application/json", "X-Postmark-Account-Token": accountToken },
        });
        if (!res.ok) {
          console.error("Postmark servers list failed:", res.status, await res.text());
          return new Response(
            JSON.stringify({ usedAccountToken: true, error: "Account token rejected", status: res.status }),
            { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }
        const json = await res.json();
        const servers = json.Servers || [];
        for (const s of servers) names.push(s.Name);
        if (servers.length < 50) break;
        sOffset += 50;
      }
      return new Response(
        JSON.stringify({ usedAccountToken: true, count: names.length, servers: names }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Pull bad/spam addresses from Postmark (all servers when an account token is set) and remove them
    if (action === "clean-bad-emails") {
      const accountToken = Deno.env.get("POSTMARK_ACCOUNT_API_TOKEN");
      const serverToken = Deno.env.get("POSTMARK_API_KEY");

      const serverTokens: Array<{ name: string; token: string }> = [];

      if (accountToken) {
        let sOffset = 0;
        while (true) {
          const res = await fetch(`https://api.postmarkapp.com/servers?count=50&offset=${sOffset}`, {
            headers: { Accept: "application/json", "X-Postmark-Account-Token": accountToken },
          });
          if (!res.ok) {
            console.error("Postmark servers list failed:", res.status, await res.text());
            break;
          }
          const json = await res.json();
          const servers = json.Servers || [];
          for (const s of servers) {
            const token = (s.ApiTokens && s.ApiTokens[0]) || null;
            if (token) serverTokens.push({ name: s.Name, token });
          }
          if (servers.length < 50) break;
          sOffset += 50;
        }
      }

      if (serverTokens.length === 0 && serverToken) {
        serverTokens.push({ name: "default", token: serverToken });
      }

      if (serverTokens.length === 0) {
        return new Response(
          JSON.stringify({ error: "No Postmark credentials configured" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      const badEmails = new Set<string>();
      const perServer: Array<{ server: string; found: number }> = [];

      for (const { name, token } of serverTokens) {
        const before = badEmails.size;
        const headers = { Accept: "application/json", "X-Postmark-Server-Token": token };

        // Hard bounces / spam complaints / inactive recipients
        let bOffset = 0;
        while (bOffset < 5000) {
          const res = await fetch(
            `https://api.postmarkapp.com/bounces?count=500&offset=${bOffset}&inactive=true`,
            { headers }
          );
          if (!res.ok) {
            console.error(`Bounces failed for ${name}:`, res.status, await res.text());
            break;
          }
          const json = await res.json();
          const bounces = json.Bounces || [];
          for (const b of bounces) {
            if (b.Email) badEmails.add(String(b.Email).toLowerCase().trim());
          }
          if (bounces.length < 500) break;
          bOffset += 500;
        }

        // Suppression lists per message stream
        for (const stream of ["outbound", "broadcast"]) {
          const res = await fetch(
            `https://api.postmarkapp.com/message-streams/${stream}/suppressions/dump`,
            { headers }
          );
          if (!res.ok) {
            console.error(`Suppressions failed for ${name}/${stream}:`, res.status);
            continue;
          }
          const json = await res.json();
          for (const s of json.Suppressions || []) {
            if (s.EmailAddress) badEmails.add(String(s.EmailAddress).toLowerCase().trim());
          }
        }

        perServer.push({ server: name, found: badEmails.size - before });
      }

      console.log(`Collected ${badEmails.size} bad addresses from ${serverTokens.length} server(s)`);

      // Remove them from mailing lists (and unsubscribe any matching subscribers)
      const all = Array.from(badEmails);
      let removedInvites = 0;
      let unsubscribed = 0;
      let suppressedStored = 0;

      for (let i = 0; i < all.length; i += BATCH_SIZE) {
        const chunk = all.slice(i, i + BATCH_SIZE);

        // Remember them permanently in the suppression table
        const { data: stored, error: supError } = await supabase
          .from("email_suppressions")
          .upsert(
            chunk.map((email) => ({
              email,
              reason: "bounce",
              source: "postmark",
              last_seen_at: new Date().toISOString(),
            })),
            { onConflict: "email" }
          )
          .select("id");
        if (supError) console.error("suppression upsert error:", supError);
        else suppressedStored += stored?.length || 0;

        const { data: deleted, error } = await supabase
          .from("email_invites")
          .delete()
          .in("email", chunk)
          .select("id");
        if (error) console.error("bad-email delete error:", error);
        else removedInvites += deleted?.length || 0;

        const { data: unsub, error: unsubError } = await supabase
          .from("subscribers")
          .update({ unsubscribed_at: new Date().toISOString() })
          .in("email", chunk)
          .is("unsubscribed_at", null)
          .select("id");
        if (unsubError) console.error("bad-email unsubscribe error:", unsubError);
        else unsubscribed += unsub?.length || 0;
      }

      return new Response(
        JSON.stringify({
          success: true,
          servers: serverTokens.length,
          usedAccountToken: !!accountToken,
          badEmails: all.length,
          removedInvites,
          unsubscribed,
          suppressedStored,
          perServer,
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get all mailing lists with stats
    if (action === "get-lists") {
      const { data: lists, error } = await supabase
        .from("mailing_lists")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching lists:", error);
        return new Response(
          JSON.stringify({ error: "Failed to fetch lists" }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Get stats for each list
      const listsWithStats = await Promise.all((lists || []).map(async (list) => {
        const { count: pending } = await supabase
          .from("email_invites")
          .select("*", { count: "exact", head: true })
          .eq("list_id", list.id)
          .eq("status", "pending");

        const { count: sent } = await supabase
          .from("email_invites")
          .select("*", { count: "exact", head: true })
          .eq("list_id", list.id)
          .eq("status", "sent");

        const { count: failed } = await supabase
          .from("email_invites")
          .select("*", { count: "exact", head: true })
          .eq("list_id", list.id)
          .eq("status", "failed");

        return {
          ...list,
          stats: { pending: pending || 0, sent: sent || 0, failed: failed || 0 },
        };
      }));

      return new Response(
        JSON.stringify(listsWithStats),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create a new mailing list
    if (action === "create-list") {
      const { name, description } = body;
      if (!name) {
        return new Response(
          JSON.stringify({ error: "List name is required" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      const { data, error } = await supabase
        .from("mailing_lists")
        .insert({ name, description })
        .select()
        .single();

      if (error) {
        console.error("Error creating list:", error);
        return new Response(
          JSON.stringify({ error: "Failed to create list" }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      return new Response(
        JSON.stringify(data),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Delete a mailing list and its invites
    if (action === "delete-list") {
      const { listId } = body;
      if (!listId) {
        return new Response(
          JSON.stringify({ error: "List ID is required" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Delete invites first (cascade should handle this, but be explicit)
      await supabase.from("email_invites").delete().eq("list_id", listId);

      const { error } = await supabase
        .from("mailing_lists")
        .delete()
        .eq("id", listId);

      if (error) {
        console.error("Error deleting list:", error);
        return new Response(
          JSON.stringify({ error: "Failed to delete list" }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get invites for a specific list
    if (action === "list-invites") {
      const { listId } = body;
      
      let query = supabase
        .from("email_invites")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);

      if (listId) {
        query = query.eq("list_id", listId);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching invites:", error);
        return new Response(
          JSON.stringify({ error: "Failed to fetch invites" }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      return new Response(
        JSON.stringify(data || []),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Upload contacts to a list
    if (action === "upload") {
      const { contacts, listId } = body;
      
      if (!contacts || contacts.length === 0) {
        return new Response(
          JSON.stringify({ error: "No contacts provided" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      console.log(`Starting upload of ${contacts.length} contacts to list ${listId || "default"}`);

      // Fetch ALL existing emails globally (handles 45k+ records)
      console.log("Fetching existing subscribers...");
      const existingSubscribers = await fetchAllEmails(supabase, "subscribers");
      console.log(`Found ${existingSubscribers.size} existing subscribers`);

      console.log("Fetching existing invites...");
      const existingInvites = await fetchAllEmails(supabase, "email_invites");
      console.log(`Found ${existingInvites.size} existing invites`);

      const suppressed = await fetchSuppressed(supabase);
      console.log(`Loaded ${suppressed.size} suppressed addresses`);

      // Filter out duplicates and invalid emails
      const validContacts: Array<{ email: string; name: string | null; status: string; list_id: string | null }> = [];
      let skippedInvalid = 0;
      let skippedDuplicate = 0;
      let skippedSuppressed = 0;

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

        if (suppressed.has(email)) {
          skippedSuppressed++;
          continue;
        }

        validContacts.push({
          email,
          name: contact.name?.trim() || null,
          status: "pending",
          list_id: listId || null,
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
          .from("email_invites")
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
            existingInvites: existingInvites.size,
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Send invites for a list
    if (action === "send") {
      const { listId } = body;
      const postmarkApiKey = Deno.env.get("POSTMARK_API_KEY");
      
      if (!postmarkApiKey) {
        return new Response(
          JSON.stringify({ error: "POSTMARK_API_KEY not configured" }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // If a listId is provided, check if the list is paused
      if (listId) {
        const { data: list, error: listError } = await supabase
          .from("mailing_lists")
          .select("paused")
          .eq("id", listId)
          .single();

        if (listError) {
          console.error("Error fetching list:", listError);
          return new Response(
            JSON.stringify({ error: "Failed to fetch list" }),
            { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }

        if (list?.paused) {
          return new Response(
            JSON.stringify({ success: false, sent: 0, message: "This mailing list is paused" }),
            { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }
      }

      // Get settings from invite_settings table
      const { data: settings } = await supabase
        .from("invite_settings")
        .select("*")
        .limit(1)
        .maybeSingle();

      const emailSubject = settings?.email_subject || "Join our Newsletter!";
      const emailTemplate = settings?.email_template || "Hi {{name}},\n\nYou've been invited to subscribe to our newsletter.\n\nClick here to subscribe: {{subscribe_url}}";

      // Get pending contacts - limit to EMAILS_PER_INVOCATION
      // IMPORTANT: Only query contacts from the specified list, and ensure we exclude paused lists
      let query = supabase
        .from("email_invites")
        .select("*, mailing_lists!inner(paused)")
        .eq("status", "pending")
        .eq("mailing_lists.paused", false)
        .limit(EMAILS_PER_INVOCATION);

      if (listId) {
        query = query.eq("list_id", listId);
      }

      const { data: pendingContacts, error: contactsError } = await query;

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

      for (const contact of pendingContacts) {
        const personalizedTemplate = emailTemplate
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
              Accept: "application/json",
              "Content-Type": "application/json",
              "X-Postmark-Server-Token": postmarkApiKey,
            },
            body: JSON.stringify({
              From: "newsletter@x402info.com",
              To: contact.email,
              Subject: emailSubject,
              HtmlBody: htmlBody,
              TextBody: personalizedTemplate,
              MessageStream: "broadcast",
            }),
          });

          if (response.ok) {
            await supabase
              .from("email_invites")
              .update({ status: "sent", sent_at: new Date().toISOString() })
              .eq("id", contact.id);
            sent++;
            console.log(`Sent to ${contact.email} (${sent}/${pendingContacts.length})`);
          } else {
            const errorResult = await response.json();
            console.error("Postmark error for", contact.email, errorResult);
            await supabase
              .from("email_invites")
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

    // Remove a single invite
    if (action === "remove") {
      const { inviteId } = body;
      if (!inviteId) {
        return new Response(
          JSON.stringify({ error: "Invite ID is required" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      const { error } = await supabase
        .from("email_invites")
        .delete()
        .eq("id", inviteId);

      if (error) {
        console.error("Error removing invite:", error);
        return new Response(
          JSON.stringify({ error: "Failed to remove invite" }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get global invite status
    if (action === "status") {
      const { count: totalPending } = await supabase
        .from("email_invites")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      const { count: totalSent } = await supabase
        .from("email_invites")
        .select("*", { count: "exact", head: true })
        .eq("status", "sent");

      const { count: totalFailed } = await supabase
        .from("email_invites")
        .select("*", { count: "exact", head: true })
        .eq("status", "failed");

      const { count: totalSubscribers } = await supabase
        .from("subscribers")
        .select("*", { count: "exact", head: true });

      return new Response(
        JSON.stringify({
          pending: totalPending || 0,
          sent: totalSent || 0,
          failed: totalFailed || 0,
          subscribers: totalSubscribers || 0,
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get settings
    if (action === "get-settings") {
      const { data, error } = await supabase
        .from("invite_settings")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Error fetching settings:", error);
        return new Response(
          JSON.stringify({ error: "Failed to fetch settings" }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      return new Response(
        JSON.stringify(data || {
          emails_per_hour: 50,
          email_subject: "Join the x402 Protocol Newsletter!",
          email_template: "Hi {{name}},\n\nYou have been invited to join our newsletter.\n\nClick here to subscribe: {{subscribe_url}}\n\nBest regards,\nThe Team",
          paused: false,
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Pause sending for a specific list
    if (action === "pause-list") {
      const { listId } = body;
      if (!listId) {
        return new Response(
          JSON.stringify({ error: "List ID is required" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      const { error } = await supabase
        .from("mailing_lists")
        .update({ paused: true, updated_at: new Date().toISOString() })
        .eq("id", listId);

      if (error) {
        console.error("Error pausing list:", error);
        return new Response(
          JSON.stringify({ error: "Failed to pause list" }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, paused: true }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Resume sending for a specific list
    if (action === "resume-list") {
      const { listId } = body;
      if (!listId) {
        return new Response(
          JSON.stringify({ error: "List ID is required" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      const { error } = await supabase
        .from("mailing_lists")
        .update({ paused: false, updated_at: new Date().toISOString() })
        .eq("id", listId);

      if (error) {
        console.error("Error resuming list:", error);
        return new Response(
          JSON.stringify({ error: "Failed to resume list" }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, paused: false }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Global pause sending (legacy - kept for compatibility)
    if (action === "pause") {
      const { data: existing } = await supabase
        .from("invite_settings")
        .select("id")
        .limit(1)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("invite_settings")
          .update({ paused: true, updated_at: new Date().toISOString() })
          .eq("id", existing.id);
      } else {
        await supabase
          .from("invite_settings")
          .insert({ paused: true });
      }

      return new Response(
        JSON.stringify({ success: true, paused: true }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Global resume sending (legacy - kept for compatibility)
    if (action === "resume") {
      const { data: existing } = await supabase
        .from("invite_settings")
        .select("id")
        .limit(1)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("invite_settings")
          .update({ paused: false, updated_at: new Date().toISOString() })
          .eq("id", existing.id);
      } else {
        await supabase
          .from("invite_settings")
          .insert({ paused: false });
      }

      return new Response(
        JSON.stringify({ success: true, paused: false }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Update settings
    if (action === "update-settings") {
      const { emailsPerHour, emailSubject, emailTemplate } = body;

      const { data: existing } = await supabase
        .from("invite_settings")
        .select("id")
        .limit(1)
        .maybeSingle();

      const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (emailsPerHour !== undefined) updateData.emails_per_hour = emailsPerHour;
      if (emailSubject !== undefined) updateData.email_subject = emailSubject;
      if (emailTemplate !== undefined) updateData.email_template = emailTemplate;

      if (existing) {
        const { error } = await supabase
          .from("invite_settings")
          .update(updateData)
          .eq("id", existing.id);

        if (error) {
          console.error("Error updating settings:", error);
          return new Response(
            JSON.stringify({ error: "Failed to update settings" }),
            { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }
      } else {
        const { error } = await supabase
          .from("invite_settings")
          .insert(updateData);

        if (error) {
          console.error("Error creating settings:", error);
          return new Response(
            JSON.stringify({ error: "Failed to create settings" }),
            { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }
      }

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    console.error("Error in send-invites function:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
