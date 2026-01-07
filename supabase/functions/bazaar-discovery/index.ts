import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { limit = 20, offset = 0, type = "http" } = await req.json().catch(() => ({}));

    // Fetch from Coinbase x402 Bazaar discovery API
    const response = await fetch(
      `https://api.cdp.coinbase.com/platform/v2/x402/discovery/resources?type=${type}&limit=${limit}&offset=${offset}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      console.error("Bazaar API error:", response.status, response.statusText);
      // Return empty array if API fails
      return new Response(
        JSON.stringify({ 
          resources: [], 
          total: 0, 
          hasMore: false,
          error: "Unable to fetch from discovery API" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();

    return new Response(
      JSON.stringify({
        resources: data.resources || data.data || [],
        total: data.total || (data.resources || data.data || []).length,
        hasMore: data.hasMore || data.has_more || false,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in bazaar-discovery:", errorMessage);
    return new Response(
      JSON.stringify({ 
        resources: [], 
        total: 0, 
        hasMore: false,
        error: errorMessage 
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
