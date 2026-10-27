 import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
 import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
 import { generateJSON, aiClient } from "../_shared/ai.ts";
 
 const corsHeaders = {
   "Access-Control-Allow-Origin": "*",
   "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
 };
 
 // Pages to analyze
 const PAGES_TO_ANALYZE = [
   { path: "/", name: "Home" },
   { path: "/about", name: "About" },
   { path: "/blog", name: "Blog" },
   { path: "/newsletters", name: "Newsletters" },
   { path: "/resources", name: "Resources" },
   { path: "/marketplace", name: "Marketplace" },
 ];
 
 interface AnalyzeRequest {
   action: "analyze" | "get" | "approve" | "reject" | "clear";
   recommendationId?: string;
   baseUrl?: string;
 }
 
 const handler = async (req: Request): Promise<Response> => {
   if (req.method === "OPTIONS") {
     return new Response(null, { headers: corsHeaders });
   }
 
   try {
     const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
     const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
     
     const supabase = createClient(supabaseUrl, supabaseServiceKey);
     const { action, recommendationId, baseUrl }: AnalyzeRequest = await req.json();
 
     // Get recommendations
     if (action === "get") {
       const { data, error } = await supabase
         .from("seo_recommendations")
         .select("*")
         .order("created_at", { ascending: false });
       
       if (error) throw error;
       return new Response(JSON.stringify({ recommendations: data }), {
         headers: { ...corsHeaders, "Content-Type": "application/json" },
       });
     }
 
     // Approve recommendation
     if (action === "approve" && recommendationId) {
       const { error } = await supabase
         .from("seo_recommendations")
         .update({ status: "approved", applied_at: new Date().toISOString() })
         .eq("id", recommendationId);
       
       if (error) throw error;
       return new Response(JSON.stringify({ success: true }), {
         headers: { ...corsHeaders, "Content-Type": "application/json" },
       });
     }
 
     // Reject recommendation
     if (action === "reject" && recommendationId) {
       const { error } = await supabase
         .from("seo_recommendations")
         .update({ status: "rejected" })
         .eq("id", recommendationId);
       
       if (error) throw error;
       return new Response(JSON.stringify({ success: true }), {
         headers: { ...corsHeaders, "Content-Type": "application/json" },
       });
     }
 
     // Clear old recommendations
     if (action === "clear") {
       const { error } = await supabase
         .from("seo_recommendations")
         .delete()
         .neq("status", "approved");
       
       if (error) throw error;
       return new Response(JSON.stringify({ success: true }), {
         headers: { ...corsHeaders, "Content-Type": "application/json" },
       });
     }
 
     // Analyze pages
     if (action === "analyze") {
       aiClient(); // fail fast if ANTHROPIC_API_KEY is not configured
 
       const siteBaseUrl = baseUrl || Deno.env.get("SITE_URL") || "https://x402info.com";
       console.log("Analyzing site:", siteBaseUrl);
 
       // Fetch each page and analyze
       const allRecommendations: any[] = [];
 
       for (const page of PAGES_TO_ANALYZE) {
         const pageUrl = `${siteBaseUrl}${page.path}`;
         console.log(`Fetching ${page.name}: ${pageUrl}`);
 
         try {
           const pageResponse = await fetch(pageUrl, {
             headers: { "User-Agent": "SEO-Analyzer/1.0" },
           });
 
           if (!pageResponse.ok) {
             console.log(`Failed to fetch ${pageUrl}: ${pageResponse.status}`);
             continue;
           }
 
           const html = await pageResponse.text();
 
           // Extract key SEO elements
           const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
           const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i);
           const h1Match = html.match(/<h1[^>]*>([^<]*)<\/h1>/i);
           const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["']/i);
           const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']*)["']/i);
           const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["']/i);
           const imgAltMissing = (html.match(/<img[^>]*(?!alt=)[^>]*>/gi) || []).length;
 
           const currentSeo = {
             title: titleMatch?.[1]?.trim() || "",
             metaDescription: metaDescMatch?.[1]?.trim() || "",
             h1: h1Match?.[1]?.trim() || "",
             canonical: canonicalMatch?.[1]?.trim() || "",
             ogTitle: ogTitleMatch?.[1]?.trim() || "",
             ogDescription: ogDescMatch?.[1]?.trim() || "",
             imagesWithoutAlt: imgAltMissing,
           };
 
           // Use AI to analyze and suggest improvements
           const recSchema = {
             type: "object",
             properties: {
               recommendations: {
                 type: "array",
                 items: {
                   type: "object",
                   properties: {
                     type: {
                       type: "string",
                       enum: ["title", "meta_description", "h1", "canonical", "og_title", "og_description", "images", "content", "schema"],
                     },
                     current: { type: "string" },
                     recommended: { type: "string" },
                     priority: { type: "string", enum: ["high", "medium", "low"] },
                     reason: { type: "string" },
                   },
                   required: ["type", "current", "recommended", "priority", "reason"],
                   additionalProperties: false,
                 },
               },
             },
             required: ["recommendations"],
             additionalProperties: false,
           };

           // deno-lint-ignore no-explicit-any
           let recommendations: any[] = [];
           try {
             const result = await generateJSON<{ recommendations: unknown[] }>({
               system: `You are an SEO expert. Analyze the current SEO elements and provide specific, actionable recommendations. 
 Return a JSON object {"recommendations": [...]}, each recommendation with:
 - type: "title" | "meta_description" | "h1" | "canonical" | "og_title" | "og_description" | "images" | "content" | "schema"
 - current: the current value (can be empty string)
 - recommended: your specific recommended value or action
 - priority: "high" | "medium" | "low"
 - reason: brief explanation (1 sentence)
 
 Only include recommendations where there's room for improvement. Be specific with recommended values.
 For title tags: aim for 50-60 characters with primary keyword.
 For meta descriptions: aim for 150-160 characters, compelling and action-oriented.
 For H1: should be unique and contain primary keyword.`,
               user: `Analyze this page: ${page.name} (${pageUrl})
 
 Current SEO elements:
 - Title: "${currentSeo.title}" (${currentSeo.title.length} chars)
 - Meta Description: "${currentSeo.metaDescription}" (${currentSeo.metaDescription.length} chars)
 - H1: "${currentSeo.h1}"
 - Canonical: "${currentSeo.canonical}"
 - OG Title: "${currentSeo.ogTitle}"
 - OG Description: "${currentSeo.ogDescription}"
 - Images without alt: ${currentSeo.imagesWithoutAlt}
 
 The site is about x402 Protocol - HTTP 402 micropayments, AI agent payments, and web monetization.
 
 Return the recommendations as JSON.`,
               maxTokens: 16000,
               jsonSchema: recSchema,
             });
             recommendations = result.recommendations ?? [];
           } catch (e) {
             console.error("AI error for", page.name, e);
             continue;
           }
 
           // Add page context to each recommendation
           for (const rec of recommendations) {
             allRecommendations.push({
               page_path: page.path,
               page_url: pageUrl,
               recommendation_type: rec.type,
               current_value: rec.current || "",
               recommended_value: rec.recommended,
               priority: rec.priority || "medium",
               status: "pending",
             });
           }
         } catch (pageError) {
           console.error(`Error analyzing ${page.name}:`, pageError);
         }
       }
 
       // Clear old pending recommendations and insert new ones
       await supabase
         .from("seo_recommendations")
         .delete()
         .eq("status", "pending");
 
       if (allRecommendations.length > 0) {
         const { error: insertError } = await supabase
           .from("seo_recommendations")
           .insert(allRecommendations);
 
         if (insertError) {
           console.error("Insert error:", insertError);
           throw insertError;
         }
       }
 
       console.log(`Generated ${allRecommendations.length} recommendations`);
 
       return new Response(
         JSON.stringify({ 
           success: true, 
           count: allRecommendations.length,
           pages: PAGES_TO_ANALYZE.length,
         }),
         { headers: { ...corsHeaders, "Content-Type": "application/json" } }
       );
     }
 
     return new Response(
       JSON.stringify({ error: "Invalid action" }),
       { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
     );
 
   } catch (error: any) {
     console.error("SEO Analyzer error:", error);
     return new Response(
       JSON.stringify({ error: error.message }),
       { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
     );
   }
 };
 
 serve(handler);