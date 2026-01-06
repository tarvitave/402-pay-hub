import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const postmarkApiKey = Deno.env.get("POSTMARK_API_KEY");
    if (!postmarkApiKey) {
      console.error("POSTMARK_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Sending welcome email to: ${email}`);

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
        To: email,
        Subject: "Welcome to x402 Protocol Newsletter!",
        HtmlBody: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <h1 style="color: #00f0ff; margin-bottom: 24px;">Welcome to x402 Protocol!</h1>
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              ${name ? `Hi ${name},` : 'Hi there,'}<br><br>
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
        TextBody: `Welcome to x402 Protocol Newsletter!\n\n${name ? `Hi ${name},` : 'Hi there,'}\n\nThank you for subscribing! You'll receive weekly insights on micropayments, protocol updates, and the future of web monetization.\n\nBest regards,\nThe x402 Protocol Team`,
        MessageStream: "outbound",
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Postmark API error:", result);
      return new Response(
        JSON.stringify({ error: result.Message || "Failed to send email" }),
        { status: response.status, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Email sent successfully:", result);

    return new Response(
      JSON.stringify({ success: true, messageId: result.MessageID }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-newsletter function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
