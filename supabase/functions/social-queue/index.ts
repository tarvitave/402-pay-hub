import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { generateJSON } from "../_shared/ai.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });

const SITE = "https://x402info.com";

interface GeneratedPost {
  channel: string;
  content: string;
  link_url?: string;
}

async function generatePosts(supabase: ReturnType<typeof createClient>) {
  const { data: newsletters } = await supabase
    .from("newsletters")
    .select("slug, title, excerpt, content, date")
    .order("created_at", { ascending: false })
    .limit(2);

  const { data: endpoints } = await supabase
    .from("x402_endpoints")
    .select("name, description, price, network")
    .eq("approved", true)
    .eq("active", true)
    .limit(8);

  const context = JSON.stringify({
    newsletters: (newsletters ?? []).map((n: Record<string, unknown>) => ({
      slug: n.slug,
      title: n.title,
      excerpt: n.excerpt,
      body: String(n.content ?? "").slice(0, 3000),
    })),
    endpoints: endpoints ?? [],
  });

  const systemPrompt = `You write social media posts for x402info.com, the independent hub for the x402 HTTP-402 micropayment protocol (AI agent payments, API monetization, stablecoin settlement on Base/Solana).

Voice: sharp, technical, no hype, no emoji spam (max one emoji), no hashtags on LinkedIn, max 2 hashtags on X.
Return JSON in this shape:
{"posts":[{"channel":"x","content":"...","link_url":"https://..."}]}
Channels allowed: "x" (max 260 chars including nothing else) and "linkedin" (max 900 chars, 2-4 short paragraphs).`;

  const userPrompt = `Using this source material, write 6 posts: 3 for X and 3 for LinkedIn.
Mix these angles: (1) the newest newsletter issue, (2) a concrete developer insight or code idea about x402, (3) the live x402 endpoint registry and free 402 validator tool at ${SITE}/registry and ${SITE}/validator.
Every post must include a link_url pointing to a real page on ${SITE} (newsletter links are ${SITE}/newsletters/<slug>). Add UTM parameters ?utm_source=<channel>&utm_medium=social&utm_campaign=auto.

SOURCE MATERIAL:
${context}`;

  const parsed = await generateJSON<{ posts?: GeneratedPost[] }>({
    system: systemPrompt,
    user: userPrompt,
    maxTokens: 16000,
    jsonSchema: {
      type: "object",
      properties: {
        posts: {
          type: "array",
          items: {
            type: "object",
            properties: {
              channel: { type: "string", enum: ["x", "linkedin"] },
              content: { type: "string" },
              link_url: { type: "string" },
            },
            required: ["channel", "content", "link_url"],
            additionalProperties: false,
          },
        },
      },
      required: ["posts"],
      additionalProperties: false,
    },
  });

  const posts = (parsed.posts ?? [])
    .filter((p) => p?.content && (p.channel === "x" || p.channel === "linkedin"))
    .map((p) => ({
      channel: p.channel,
      content: p.content.slice(0, p.channel === "x" ? 275 : 1200),
      link_url: p.link_url ?? SITE,
      source: "ai",
      status: "draft",
    }));

  if (posts.length === 0) throw new Error("No posts generated");

  const { data, error } = await supabase.from("social_posts").insert(posts).select();
  if (error) throw error;
  return data ?? [];
}

async function postToX(content: string) {
  const token = Deno.env.get("X_BEARER_TOKEN");
  if (!token) throw new Error("X_BEARER_TOKEN not configured");
  const res = await fetch("https://api.twitter.com/2/tweets", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ text: content }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`X API ${res.status}: ${JSON.stringify(body).slice(0, 200)}`);
  return String(body?.data?.id ?? "");
}

async function postToLinkedIn(content: string) {
  const token = Deno.env.get("LINKEDIN_ACCESS_TOKEN");
  const author = Deno.env.get("LINKEDIN_AUTHOR_URN");
  if (!token || !author) throw new Error("LinkedIn credentials not configured");
  const res = await fetch("https://api.linkedin.com/v2/ugcPosts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
    },
    body: JSON.stringify({
      author,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: { text: content },
          shareMediaCategory: "NONE",
        },
      },
      visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
    }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`LinkedIn API ${res.status}: ${JSON.stringify(body).slice(0, 200)}`);
  return String(body?.id ?? "");
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const action = String(body.action ?? "list");

    if (action === "list") {
      const { data, error } = await supabase
        .from("social_posts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return json({
        posts: data ?? [],
        credentials: {
          x: !!Deno.env.get("X_BEARER_TOKEN"),
          linkedin: !!(Deno.env.get("LINKEDIN_ACCESS_TOKEN") && Deno.env.get("LINKEDIN_AUTHOR_URN")),
        },
      });
    }

    if (action === "generate") {
      const created = await generatePosts(supabase);
      return json({ success: true, created: created.length });
    }

    if (action === "update") {
      const id = String(body.id ?? "");
      if (!id) return json({ error: "id required" }, 400);
      const patch: Record<string, unknown> = {};
      if (typeof body.content === "string") patch.content = body.content.slice(0, 1200);
      if (typeof body.status === "string") patch.status = body.status;
      if (typeof body.scheduled_for === "string") patch.scheduled_for = body.scheduled_for;
      const { error } = await supabase.from("social_posts").update(patch).eq("id", id);
      if (error) throw error;
      return json({ success: true });
    }

    if (action === "delete") {
      const id = String(body.id ?? "");
      if (!id) return json({ error: "id required" }, 400);
      const { error } = await supabase.from("social_posts").delete().eq("id", id);
      if (error) throw error;
      return json({ success: true });
    }

    if (action === "publish" || action === "publish-due") {
      let query = supabase.from("social_posts").select("*").eq("status", "approved");
      if (action === "publish") {
        const id = String(body.id ?? "");
        if (!id) return json({ error: "id required" }, 400);
        query = supabase.from("social_posts").select("*").eq("id", id);
      } else {
        query = query.or(`scheduled_for.is.null,scheduled_for.lte.${new Date().toISOString()}`).limit(5);
      }

      const { data: due, error } = await query;
      if (error) throw error;

      let posted = 0;
      const failures: string[] = [];
      for (const post of due ?? []) {
        const text = post.link_url ? `${post.content}\n\n${post.link_url}` : post.content;
        try {
          const externalId =
            post.channel === "x" ? await postToX(text) : await postToLinkedIn(text);
          await supabase
            .from("social_posts")
            .update({ status: "posted", posted_at: new Date().toISOString(), external_id: externalId, error: null })
            .eq("id", post.id);
          posted++;
        } catch (err) {
          const message = String((err as Error)?.message ?? err).slice(0, 300);
          failures.push(message);
          await supabase.from("social_posts").update({ status: "failed", error: message }).eq("id", post.id);
        }
      }
      return json({ success: true, posted, failures });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (err) {
    const message = String((err as Error)?.message ?? err);
    console.error("social-queue error:", message);
    return json({ error: message.slice(0, 200) }, 500);
  }
});