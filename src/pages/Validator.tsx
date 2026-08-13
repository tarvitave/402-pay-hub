import { useState } from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Newsletter from "@/components/Newsletter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { trackAction } from "@/hooks/usePageTracking";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Loader2, Wand2 } from "lucide-react";

interface Check {
  label: string;
  pass: boolean;
  detail: string;
}

interface Result {
  url: string;
  reachable: boolean;
  status?: number;
  latency_ms?: number;
  score?: number;
  verdict?: string;
  checks: Check[];
  headers?: Record<string, string>;
  body_preview?: string;
  error?: string;
}

const Validator = () => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const run = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    const { data, error } = await supabase.functions.invoke("validate-402", { body: { url } });
    setLoading(false);
    if (error) {
      toast.error("Validation failed — check the URL.");
      return;
    }
    trackAction("run-validator", url);
    setResult(data as Result);
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Free x402 Validator — Test Your HTTP 402 Endpoint | x402info</title>
        <meta
          name="description"
          content="Paste any URL and instantly check whether it returns a spec-compliant x402 HTTP 402 payment challenge, with a per-rule compliance report."
        />
        <link rel="canonical" href="https://x402info.com/validator" />
      </Helmet>
      <Navbar />

      <main className="container mx-auto px-4 pt-28 pb-20">
        <header className="max-w-3xl">
          <Badge className="mb-4 bg-primary/15 text-primary">Free tool</Badge>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">x402 Endpoint Validator</h1>
          <p className="text-lg text-muted-foreground">
            Paste an endpoint URL. We send an unpaid request and grade the 402 challenge it returns against the
            x402 spec — status code, payment requirements, network, amount, payTo address, version and CORS.
          </p>
        </header>

        <form onSubmit={run} className="mt-8 flex flex-col sm:flex-row gap-3 max-w-2xl">
          <Input
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://api.example.com/paid-resource"
          />
          <Button type="submit" variant="hero" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Wand2 className="h-4 w-4 mr-2" />}
            Validate
          </Button>
        </form>

        {result && (
          <section className="mt-10 grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-1">
              <CardContent className="p-6">
                {result.reachable ? (
                  <>
                    <div className="text-5xl font-display font-bold text-gradient-primary">{result.score}%</div>
                    <p className="mt-2 font-medium">{result.verdict}</p>
                    <p className="mt-4 text-sm text-muted-foreground">
                      HTTP {result.status} · {result.latency_ms} ms
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-medium text-destructive">Endpoint unreachable</p>
                    <p className="mt-2 text-sm text-muted-foreground break-words">{result.error}</p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardContent className="p-6 space-y-3">
                {result.checks.map((c) => (
                  <div key={c.label} className="flex items-start gap-3">
                    {c.pass ? (
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="text-sm font-medium">{c.label}</p>
                      <p className="text-xs text-muted-foreground break-words">{c.detail}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {result.body_preview && (
              <Card className="lg:col-span-3">
                <CardContent className="p-6">
                  <h2 className="font-semibold mb-3">Raw 402 response</h2>
                  <pre className="text-xs bg-muted/40 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap">
                    {result.body_preview}
                  </pre>
                </CardContent>
              </Card>
            )}
          </section>
        )}
      </main>

      <Newsletter />
      <Footer />
    </div>
  );
};

export default Validator;