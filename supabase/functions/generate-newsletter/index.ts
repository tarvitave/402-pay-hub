 import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
 import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
 
 const corsHeaders = {
   "Access-Control-Allow-Origin": "*",
   "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
 };
 
 // Rotating sponsors list
 const SPONSORS = [
   { name: "OSVue", url: "https://osvue.com", description: "Ship MVPs fast with Vue.js templates. Save 100+ hours on your next project." },
   { name: "WheelOfPopups", url: "https://wheelofpopups.com", description: "Gamified popups that boost conversions. Turn visitors into subscribers." },
   { name: "RaffleSelect", url: "https://raffleselect.com", description: "Run viral giveaways. Build your audience with social-powered raffles." },
   { name: "Phlorin", url: "https://phlorin.com", description: "Accept crypto payments instantly. Multi-chain support for modern commerce." },
   { name: "NoCodeAPI", url: "https://nocodeapi.com", description: "Connect to 200+ APIs without code. Build automations in minutes." },
 ];
 
 function getWeekNumber(date: Date): number {
   const startOfYear = new Date(date.getFullYear(), 0, 1);
   const pastDaysOfYear = (date.getTime() - startOfYear.getTime()) / 86400000;
   return Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
 }
 
 function formatDate(date: Date): string {
   const months = ["January", "February", "March", "April", "May", "June", 
                   "July", "August", "September", "October", "November", "December"];
   return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
 }
 
 function getMonthAbbrev(date: Date): string {
   const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", 
                   "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
   return months[date.getMonth()];
 }
 
 const handler = async (req: Request): Promise<Response> => {
   if (req.method === "OPTIONS") {
     return new Response(null, { headers: corsHeaders });
   }
 
   try {
     const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
     const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
     const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
     
     if (!lovableApiKey) {
       throw new Error("LOVABLE_API_KEY is not configured");
     }
 
     const supabase = createClient(supabaseUrl, supabaseServiceKey);
 
     // Get the latest newsletter to determine week number
     const { data: latestNewsletter, error: fetchError } = await supabase
       .from("newsletters")
       .select("id, date, slug")
       .order("id", { ascending: false })
       .limit(1)
       .single();
 
     if (fetchError && fetchError.code !== "PGRST116") {
       console.error("Error fetching latest newsletter:", fetchError);
       throw fetchError;
     }
 
     // Calculate week number (start from 11 if we have 10 existing)
     let weekNumber = 11;
     if (latestNewsletter?.slug) {
       const match = latestNewsletter.slug.match(/week-(\d+)/);
       if (match) {
         weekNumber = parseInt(match[1]) + 1;
       }
     }
 
     // Get current date for the newsletter
     const now = new Date();
     const dateStr = formatDate(now);
     const monthAbbrev = getMonthAbbrev(now);
 
     // Rotate sponsor based on week number
     const sponsor = SPONSORS[(weekNumber - 1) % SPONSORS.length];
 
     // Generate newsletter content using Lovable AI
     const systemPrompt = `You are a newsletter writer for x402 Protocol, a newsletter about HTTP 402 micropayments, AI agent payments, and web monetization. 
 
 Write engaging, informative content that follows this exact structure. Use markdown formatting.
 
 The newsletter should feel current and relevant, discussing developments in:
 - HTTP 402 protocol and payment standards
 - Cryptocurrency facilitators (Base, Solana, Avalanche)
 - AI agents making payments
 - API monetization
 - ERC-8004 and reputation systems
 
 Keep the tone professional but approachable. Include specific but realistic details.`;
 
     const userPrompt = `Write newsletter content for Week ${weekNumber} (${dateStr}).
 
 Generate content for these 5 sections:
 
 1. **Status 402** - 2-3 paragraphs about x402 specification updates, SDK releases, or protocol improvements
 
 2. **Clearing & Settlement** - 2-3 paragraphs about payment facilitators on Base, Solana, or Avalanche networks
 
 3. **Agent Shopping** - 2-3 paragraphs about new APIs accepting x402 payments or AI agents using micropayments
 
 4. **Reputation & Safety** - 2-3 paragraphs about ERC-8004 reputation standards or security developments
 
 5. **The 1-Line Integration** - A brief code example showing a simple x402 integration (use TypeScript/JavaScript)
 
 Format each section with the heading as shown above. Make the content realistic and engaging.
 
 End with this sponsor section:
 
 ---
 
 **This week's sponsor: [${sponsor.name}](${sponsor.url})**
 
 ${sponsor.description}
 
 ---
 
 *That's a wrap for Week ${weekNumber}! Star us on GitHub and share this newsletter with a friend.*`;
 
     console.log(`Generating newsletter for Week ${weekNumber}...`);
 
     const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
       method: "POST",
       headers: {
         "Authorization": `Bearer ${lovableApiKey}`,
         "Content-Type": "application/json",
       },
       body: JSON.stringify({
         model: "google/gemini-2.5-flash",
         messages: [
           { role: "system", content: systemPrompt },
           { role: "user", content: userPrompt },
         ],
       }),
     });
 
     if (!aiResponse.ok) {
       const errorText = await aiResponse.text();
       console.error("AI Gateway error:", aiResponse.status, errorText);
       throw new Error(`AI Gateway error: ${aiResponse.status}`);
     }
 
     const aiResult = await aiResponse.json();
     const generatedContent = aiResult.choices?.[0]?.message?.content;
 
     if (!generatedContent) {
       throw new Error("No content generated from AI");
     }
 
     console.log("AI content generated successfully");
 
     // Create the newsletter slug and title
     const slug = `week-${weekNumber.toString().padStart(2, "0")}`;
     const title = `x402 Protocol Weekly #${weekNumber}`;
     const excerpt = `Week ${weekNumber} updates: Protocol developments, facilitator news, and the latest in AI agent payments.`;
 
     // Use a rotating hero image (cycle through 1-10)
     const heroImageNum = ((weekNumber - 1) % 10) + 1;
     const heroImage = `/src/assets/newsletter-week-${heroImageNum.toString().padStart(2, "0")}.jpg`;
 
     // Insert the newsletter as a draft (no sent_at means draft)
     const { data: newsletter, error: insertError } = await supabase
       .from("newsletters")
       .insert({
         slug,
         title,
         date: dateStr,
         month: monthAbbrev,
         excerpt,
         content: generatedContent,
         hero_image: heroImage,
         read_time: "8 min read",
         category: "Weekly Digest",
         industry: "General",
       })
       .select()
       .single();
 
     if (insertError) {
       console.error("Error inserting newsletter:", insertError);
       throw insertError;
     }
 
     console.log(`Newsletter Week ${weekNumber} created successfully:`, newsletter.id);
 
     return new Response(
       JSON.stringify({ 
         success: true, 
         newsletter: { 
           id: newsletter.id, 
           slug, 
           title, 
           weekNumber 
         } 
       }),
       { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
     );
 
   } catch (error: any) {
     console.error("Error generating newsletter:", error);
     return new Response(
       JSON.stringify({ error: error.message }),
       { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
     );
   }
 };
 
 serve(handler);