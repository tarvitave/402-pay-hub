import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Newsletter from "@/components/Newsletter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { trackAction } from "@/hooks/usePageTracking";
import { toast } from "sonner";
import { Activity, ExternalLink, Search, RefreshCw, ShieldCheck, Clock } from "lucide-react";

interface EndpointRow {
  id: string;
  name: string;
  url: string;
  description: string | null;
  category: string;
  price: string | null;
  network: string | null;
  docs_url: string | null;
  supports_402: boolean | null;
  last_status: number | null;
  last_latency_ms: number | null;
  last_checked_at: string | null;
  uptime_24h: number | null;
}

const Registry = () => {
  const [endpoints, setEndpoints] = useState<EndpointRow[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    url: "",
    description: "",
    category: "api",
    price: "",
    network: "",
    docs_url: "",
    email: "",
  });

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("registry", { body: { action: "list" } });
    if (error) {
      toast.error("Could not load the registry");
    } else {
      setEndpoints(((data as { endpoints?: EndpointRow[] })?.endpoints ?? []) as EndpointRow[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return endpoints;
    return endpoints.filter((e) =>
      [e.name, e.description, e.category, e.network, e.url].join(" ").toLowerCase().includes(q)
    );
  }, [endpoints, search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { data, error } = await supabase.functions.invoke("registry", {
      body: { action: "submit", ...form },
    });
    setSubmitting(false);
    if (error || (data as { error?: string })?.error) {
      toast.error("Submission failed — check the URL and email.");
      return;
    }
    trackAction("submit-endpoint", form.category, { url: form.url });
    toast.success("Submitted for review — we monitor it from now on.");
    setForm({ name: "", url: "", description: "", category: "api", price: "", network: "", docs_url: "", email: "" });
  };

  const statusBadge = (e: EndpointRow) => {
    if (e.last_status === 402) return <Badge className="bg-primary/15 text-primary">402 live</Badge>;
    if (e.last_status && e.last_status < 400) return <Badge variant="secondary">HTTP {e.last_status}</Badge>;
    if (e.last_status) return <Badge variant="destructive">HTTP {e.last_status}</Badge>;
    return <Badge variant="outline">Unchecked</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>x402 Endpoint Registry — Live Uptime & Prices | x402info</title>
        <meta
          name="description"
          content="A live registry of x402 payment-enabled API endpoints with uptime, latency, price and network data, health-checked continuously."
        />
        <link rel="canonical" href="https://x402info.com/registry" />
      </Helmet>
      <Navbar />

      <main className="container mx-auto px-4 pt-28 pb-20">
        <header className="max-w-3xl">
          <Badge className="mb-4 bg-primary/15 text-primary">Live monitoring</Badge>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">x402 Endpoint Registry</h1>
          <p className="text-lg text-muted-foreground">
            Every known x402 payment-enabled endpoint, health-checked around the clock. See which ones really
            return HTTP 402, what they charge, on which network, and how reliable they are.
          </p>
        </header>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search endpoints, networks, categories…"
              className="pl-9"
            />
          </div>
          <Button variant="outline" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          {filtered.map((e) => (
            <Card key={e.id} className="border-border/60">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-lg">{e.name}</h2>
                    <a
                      href={e.url}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="text-xs text-muted-foreground hover:text-primary break-all inline-flex items-center gap-1"
                    >
                      {e.url} <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  {statusBadge(e)}
                </div>

                {e.description && <p className="mt-3 text-sm text-muted-foreground">{e.description}</p>}

                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  <Badge variant="outline">{e.category}</Badge>
                  {e.network && <Badge variant="outline">{e.network}</Badge>}
                  {e.price && <Badge variant="outline">{e.price}</Badge>}
                  {e.supports_402 && (
                    <Badge variant="outline" className="text-primary border-primary/40">
                      <ShieldCheck className="h-3 w-3 mr-1" /> x402 verified
                    </Badge>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Activity className="h-3 w-3" />
                    Uptime 24h: {e.uptime_24h != null ? `${e.uptime_24h}%` : "—"}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {e.last_latency_ms != null ? `${e.last_latency_ms} ms` : "—"}
                  </span>
                  {e.last_checked_at && (
                    <span>Checked {new Date(e.last_checked_at).toLocaleString()}</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          {!loading && filtered.length === 0 && (
            <p className="text-muted-foreground">No endpoints yet — be the first to submit one below.</p>
          )}
        </section>

        <section className="mt-16 max-w-2xl">
          <h2 className="font-display text-2xl font-bold mb-2">List your x402 endpoint</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Free. We verify it returns a valid 402 challenge, then monitor uptime and latency for you.
          </p>
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <Label htmlFor="name">Name</Label>
              <Input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="sm:col-span-1">
              <Label htmlFor="url">Endpoint URL</Label>
              <Input id="url" required placeholder="https://api.example.com/paid" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="description">What does it do?</Label>
              <Textarea id="description" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Input id="category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="network">Network</Label>
              <Input id="network" placeholder="base, solana…" value={form.network} onChange={(e) => setForm({ ...form, network: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="price">Price per call</Label>
              <Input id="price" placeholder="$0.001" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="docs">Docs URL</Label>
              <Input id="docs" value={form.docs_url} onChange={(e) => setForm({ ...form, docs_url: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="email">Your email</Label>
              <Input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" variant="hero" disabled={submitting}>
                {submitting ? "Submitting…" : "Submit endpoint"}
              </Button>
            </div>
          </form>
        </section>
      </main>

      <Newsletter />
      <Footer />
    </div>
  );
};

export default Registry;