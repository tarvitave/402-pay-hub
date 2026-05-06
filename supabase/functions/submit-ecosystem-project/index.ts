import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const projectName = String(body.projectName ?? "").trim().slice(0, 120);
    const url = String(body.url ?? "").trim().slice(0, 500);
    const category = String(body.category ?? "").trim().slice(0, 50);
    const description = String(body.description ?? "").trim().slice(0, 1000);
    const contactEmail = String(body.contactEmail ?? "").toLowerCase().trim().slice(0, 320);

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const urlRe = /^https?:\/\/.+/i;
    if (!projectName || !urlRe.test(url) || !category || description.length < 20 || !emailRe.test(contactEmail)) {
      return new Response(JSON.stringify({ error: "Invalid submission" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { error } = await supabase.from("ecosystem_submissions").insert({
      project_name: projectName,
      url,
      category,
      description,
      contact_email: contactEmail,
    });

    if (error) {
      console.error("Submission insert error:", error.message);
      return new Response(JSON.stringify({ error: "Unable to submit. Please try again later." }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (err: any) {
    console.error("submit-ecosystem-project error:", err?.message ?? err);
    return new Response(JSON.stringify({ error: "Unable to submit. Please try again later." }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);