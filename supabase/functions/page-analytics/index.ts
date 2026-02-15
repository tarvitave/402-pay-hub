import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PageViewRequest {
  action: "track" | "get";
  page_path?: string;
  visitor_id?: string;
  days?: number;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, page_path, visitor_id, days = 30 }: PageViewRequest = await req.json();

    // Track a page view
    if (action === "track") {
      if (!page_path || !visitor_id) {
        return new Response(
          JSON.stringify({ error: "page_path and visitor_id are required" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      const { error } = await supabase
        .from("page_views")
        .insert({ page_path, visitor_id });

      if (error) {
        console.error("Error tracking page view:", error);
        return new Response(
          JSON.stringify({ error: "Failed to track page view" }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get analytics — use RPC / raw SQL to aggregate server-side and avoid the 1000-row limit
    if (action === "get") {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      startDate.setHours(0, 0, 0, 0);
      const startISO = startDate.toISOString();

      // Daily aggregation via multiple smaller queries won't work well.
      // Instead, paginate through ALL rows using range queries.
      const allViews: { created_at: string; visitor_id: string; page_path: string }[] = [];
      const pageSize = 1000;
      let offset = 0;
      let hasMore = true;

      while (hasMore) {
        const { data, error } = await supabase
          .from("page_views")
          .select("created_at, visitor_id, page_path")
          .gte("created_at", startISO)
          .order("created_at", { ascending: true })
          .range(offset, offset + pageSize - 1);

        if (error) {
          console.error("Error fetching page views:", error);
          return new Response(
            JSON.stringify({ error: "Failed to fetch analytics" }),
            { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }

        if (data && data.length > 0) {
          allViews.push(...data);
          offset += pageSize;
          hasMore = data.length === pageSize;
        } else {
          hasMore = false;
        }
      }

      // Group by date
      const dailyData: Record<string, { pageviews: number; visitors: Set<string> }> = {};

      // Initialize all dates in range
      for (let i = 0; i < days; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        const dateKey = date.toISOString().split("T")[0];
        dailyData[dateKey] = { pageviews: 0, visitors: new Set() };
      }

      // Populate with actual data
      for (const view of allViews) {
        const dateKey = new Date(view.created_at).toISOString().split("T")[0];
        if (dailyData[dateKey]) {
          dailyData[dateKey].pageviews++;
          dailyData[dateKey].visitors.add(view.visitor_id);
        }
      }

      // Convert to array format
      const analytics = Object.entries(dailyData).map(([date, data]) => ({
        date,
        formatted_date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        pageviews: data.pageviews,
        visitors: data.visitors.size,
      }));

      // Calculate totals
      const totalPageviews = analytics.reduce((sum, d) => sum + d.pageviews, 0);
      const allVisitors = new Set<string>();
      for (const view of allViews) {
        allVisitors.add(view.visitor_id);
      }

      // Top pages
      const pageCounts: Record<string, number> = {};
      for (const view of allViews) {
        pageCounts[view.page_path] = (pageCounts[view.page_path] || 0) + 1;
      }
      const topPages = Object.entries(pageCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([path, views]) => ({ path, views }));

      return new Response(
        JSON.stringify({
          daily: analytics,
          totals: {
            pageviews: totalPageviews,
            visitors: allVisitors.size,
            days,
          },
          topPages,
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    console.error("Error in page-analytics function:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
