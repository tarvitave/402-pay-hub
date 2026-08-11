import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NewsletterRequest {
  email: string;
  name?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name }: NewsletterRequest = await req.json();

    // Input validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const normalizedEmail = typeof email === "string" ? email.toLowerCase().trim() : "";
    if (!normalizedEmail || normalizedEmail.length > 320 || !emailRegex.test(normalizedEmail)) {
      return new Response(
        JSON.stringify({ error: "Invalid email address" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    const safeName = typeof name === "string"
      ? name.trim().slice(0, 100).replace(/[<>"'&]/g, "")
      : "";

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Basic rate limiting: max 3 subscription attempts per email per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count: recentCount } = await supabase
      .from("subscribers")
      .select("id", { count: "exact", head: true })
      .eq("email", normalizedEmail)
      .gte("subscribed_at", oneHourAgo);
    if ((recentCount ?? 0) > 3) {
      return new Response(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate against the suppression list (bounces / spam complaints)
    const { data: suppressed } = await supabase
      .from("email_suppressions")
      .select("id")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (suppressed) {
      console.log("Blocked suppressed address");
      return new Response(
        JSON.stringify({ error: "This email address can't receive our emails. Please use another address." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if email already exists
    const { data: existingSubscriber, error: checkError } = await supabase
      .from("subscribers")
      .select("id")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (checkError) {
      console.error("Error checking subscriber:", checkError);
      return new Response(
        JSON.stringify({ error: "Unable to process subscription. Please try again later." }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (existingSubscriber) {
      console.log("Duplicate subscription attempt");
      return new Response(
        JSON.stringify({ alreadySubscribed: true, message: "You're already subscribed!" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Add subscriber to database
    const { error: insertError } = await supabase
      .from("subscribers")
      .insert({ email: normalizedEmail, confirmed: true });

    if (insertError) {
      console.error("Error inserting subscriber:", insertError);
      return new Response(
        JSON.stringify({ error: "Unable to process subscription. Please try again later." }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const postmarkApiKey = Deno.env.get("POSTMARK_API_KEY");
    if (!postmarkApiKey) {
      console.error("POSTMARK_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Unable to process subscription. Please try again later." }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Sending welcome email");

    // Send welcome email via Postmark
    const response = await fetch("https://api.postmarkapp.com/email", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "X-Postmark-Server-Token": postmarkApiKey,
      },
      body: JSON.stringify({
        From: "newsletter@x402info.com", // Update this to your verified sender
        To: normalizedEmail,
        Subject: "Welcome to x402 Protocol Newsletter!",
        HtmlBody: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <h1 style="color: #00f0ff; margin-bottom: 24px;">Welcome to x402 Protocol!</h1>
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              ${safeName ? `Hi ${safeName},` : 'Hi there,'}<br><br>
              Thank you for subscribing to the x402 Protocol newsletter! You're now part of a community of developers and builders shaping the future of web monetization.
            </p>
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              Here's what you can expect:
            </p>
            <ul style="color: #333; font-size: 16px; line-height: 1.8;">
              <li>Weekly insights on micropayments and the HTTP 402 protocol</li>
              <li>Protocol updates and implementation guides</li>
              <li>Industry news and use case examples</li>
              <li>Early access to new tools and resources</li>
            </ul>
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              Stay tuned for your first update!
            </p>
            <p style="color: #666; font-size: 14px; margin-top: 40px;">
              Best regards,<br>
              The x402 Protocol Team
            </p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 40px 0 20px;">
            <p style="color: #999; font-size: 12px;">
              You received this email because you subscribed at x402info.com. 
              <a href="#" style="color: #00f0ff;">Unsubscribe</a>
            </p>
          </div>
        `,
        TextBody: `Welcome to x402 Protocol Newsletter!\n\n${safeName ? `Hi ${safeName},` : 'Hi there,'}\n\nThank you for subscribing! You'll receive weekly insights on micropayments, protocol updates, and the future of web monetization.\n\nBest regards,\nThe x402 Protocol Team`,
        MessageStream: "broadcast",
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Postmark API error:", result);
      return new Response(
        JSON.stringify({ error: "Unable to send confirmation email. Please try again later." }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Email sent successfully");

    return new Response(
      JSON.stringify({ success: true, messageId: result.MessageID }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-newsletter function:", error?.message ?? error);
    return new Response(
      JSON.stringify({ error: "Unable to process subscription. Please try again later." }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
