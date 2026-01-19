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

    const apiUrl = `https://api.cdp.coinbase.com/platform/v2/x402/discovery/resources?type=${type}&limit=${limit}&offset=${offset}`;
    console.log("Fetching from:", apiUrl);

    // Fetch from Coinbase x402 Bazaar discovery API
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("Response status:", response.status, response.statusText);
    const rawText = await response.text();
    console.log("Raw response:", rawText.substring(0, 500));

    if (!response.ok) {
      console.error("Bazaar API error:", response.status, response.statusText);
      return new Response(
        JSON.stringify({ 
          resources: [], 
          total: 0, 
          hasMore: false,
          error: `API returned ${response.status}: ${rawText.substring(0, 200)}` 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = JSON.parse(rawText);
    console.log("Parsed data keys:", Object.keys(data));
    
    // API returns 'items' array, each with a 'url' and 'accepts' array
    const items = data.items || [];
    console.log("Items count:", items.length);
    if (items.length > 0) {
      console.log("First item keys:", Object.keys(items[0]));
      console.log("First item resource:", items[0].resource);
    }
    
    // Transform to match frontend Resource interface
    const resources = items.flatMap((item: any) => 
      (item.accepts || []).map((accept: any) => ({
        url: item.resource || item.url || "",
        type: accept.mimeType || "application/json",
        metadata: {
          description: accept.description || "",
          input: accept.inputSchema || accept.input || {},
          output: accept.outputSchema || accept.output || {},
          network: accept.network || "",
          asset: accept.asset || "",
          maxAmount: accept.maxAmountRequired || "",
        }
      }))
    );
    
    console.log("Processed resources count:", resources.length);
    if (resources.length > 0) {
      console.log("First resource url:", resources[0].url);
    }

    return new Response(
      JSON.stringify({
        resources,
        total: data.pagination?.totalCount || resources.length,
        hasMore: data.pagination?.hasMore || false,
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
