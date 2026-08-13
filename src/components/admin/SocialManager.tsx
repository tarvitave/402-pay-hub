import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sparkles, Send, Trash2, RefreshCw, CheckCircle2, Linkedin, Twitter } from "lucide-react";

interface SocialPost {
  id: string;
  channel: string;
  content: string;
  link_url: string | null;
  status: string;
  scheduled_for: string | null;
  posted_at: string | null;
  error: string | null;
  created_at: string;
}

const statusColor: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  approved: "bg-primary/15 text-primary",
  posted: "bg-emerald-500/15 text-emerald-600",
  failed: "bg-destructive/15 text-destructive",
};

const SocialManager = () => {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [creds, setCreds] = useState({ x: false, linkedin: false });
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const call = async (body: Record<string, unknown>) => {
    const { data, error } = await supabase.functions.invoke("social-queue", { body });
    if (error) throw error;
    const payload = data as { error?: string };
    if (payload?.error) throw new Error(payload.error);
    return data as Record<string, unknown>;
  };

  const load = async () => {
    setLoading(true);
    try {
      const data = await call({ action: "list" });
      setPosts((data.posts as SocialPost[]) ?? []);
      setCreds((data.credentials as { x: boolean; linkedin: boolean }) ?? { x: false, linkedin: false });
    } catch {
      toast.error("Could not load the social queue");
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const generate = async () => {
    setGenerating(true);
    try {
      const data = await call({ action: "generate" });
      toast.success(`Generated ${data.created} draft posts`);
      await load();
    } catch (err) {
      toast.error(`Generation failed: ${(err as Error).message}`);
    }
    setGenerating(false);
  };

  const update = async (id: string, patch: Record<string, unknown>) => {
    setBusyId(id);
    try {
      await call({ action: "update", id, ...patch });
      await load();
    } catch (err) {
      toast.error((err as Error).message);
    }
    setBusyId(null);
  };

  const publish = async (id: string) => {
    setBusyId(id);
    try {
      const data = await call({ action: "publish", id });
      if ((data.posted as number) > 0) toast.success("Posted");
      else toast.error(`Not posted: ${(data.failures as string[])?.[0] ?? "unknown error"}`);
      await load();
    } catch (err) {
      toast.error((err as Error).message);
    }
    setBusyId(null);
  };

  const remove = async (id: string) => {
    setBusyId(id);
    try {
      await call({ action: "delete", id });
      await load();
    } catch (err) {
      toast.error((err as Error).message);
    }
    setBusyId(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" /> Social autoposting
          </CardTitle>
          <CardDescription>
            AI drafts posts every Monday from your latest newsletter, the endpoint registry and the validator.
            Approved posts publish automatically (checked hourly) with UTM tracking.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <Button onClick={generate} disabled={generating}>
            <Sparkles className={`h-4 w-4 mr-2 ${generating ? "animate-pulse" : ""}`} />
            {generating ? "Generating…" : "Generate drafts now"}
          </Button>
          <Button variant="outline" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Badge variant={creds.x ? "secondary" : "outline"}>
            <Twitter className="h-3 w-3 mr-1" /> X {creds.x ? "connected" : "not connected"}
          </Badge>
          <Badge variant={creds.linkedin ? "secondary" : "outline"}>
            <Linkedin className="h-3 w-3 mr-1" /> LinkedIn {creds.linkedin ? "connected" : "not connected"}
          </Badge>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {posts.map((post) => (
          <Card key={post.id}>
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <Badge variant="outline" className="uppercase">
                  {post.channel === "x" ? <Twitter className="h-3 w-3 mr-1" /> : <Linkedin className="h-3 w-3 mr-1" />}
                  {post.channel}
                </Badge>
                <Badge className={statusColor[post.status] ?? ""}>{post.status}</Badge>
              </div>

              <Textarea
                rows={post.channel === "x" ? 4 : 7}
                value={drafts[post.id] ?? post.content}
                onChange={(e) => setDrafts({ ...drafts, [post.id]: e.target.value })}
                disabled={post.status === "posted"}
              />
              {post.link_url && <p className="text-xs text-muted-foreground break-all">{post.link_url}</p>}
              {post.error && <p className="text-xs text-destructive break-words">{post.error}</p>}

              <div className="flex flex-wrap gap-2">
                {drafts[post.id] !== undefined && drafts[post.id] !== post.content && (
                  <Button size="sm" variant="outline" disabled={busyId === post.id} onClick={() => update(post.id, { content: drafts[post.id] })}>
                    Save
                  </Button>
                )}
                {post.status !== "posted" && post.status !== "approved" && (
                  <Button size="sm" disabled={busyId === post.id} onClick={() => update(post.id, { status: "approved" })}>
                    <CheckCircle2 className="h-4 w-4 mr-1" /> Approve
                  </Button>
                )}
                {post.status !== "posted" && (
                  <Button size="sm" variant="secondary" disabled={busyId === post.id} onClick={() => publish(post.id)}>
                    <Send className="h-4 w-4 mr-1" /> Post now
                  </Button>
                )}
                <Button size="sm" variant="ghost" disabled={busyId === post.id} onClick={() => remove(post.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {!loading && posts.length === 0 && (
          <p className="text-muted-foreground">No posts in the queue yet — generate some drafts.</p>
        )}
      </div>
    </div>
  );
};

export default SocialManager;