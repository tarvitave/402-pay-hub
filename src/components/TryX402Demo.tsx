import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Lock, CheckCircle2, RefreshCw, Wallet } from "lucide-react";

type Step = "idle" | "requesting" | "challenged" | "paying" | "verified" | "delivered";

const sample = {
  fact:
    "The HTTP 402 status code was reserved in RFC 7231 in 1997 'for future use' — and stayed unused for 28 years until x402 picked it up.",
  source: "x402info.com/api/fact",
};

const TryX402Demo = () => {
  const [step, setStep] = useState<Step>("idle");
  const [log, setLog] = useState<string[]>([]);

  const append = (line: string) => setLog((prev) => [...prev, line]);

  const reset = () => {
    setStep("idle");
    setLog([]);
  };

  const run = async () => {
    reset();
    trackAction("run_x402_demo");
    setStep("requesting");
    append("→ GET /api/fact");
    await wait(550);
    setStep("challenged");
    append("← HTTP 402 Payment Required");
    append('  accepts: [{ asset: "USDC", amount: "0.001", network: "base" }]');
    await wait(900);
    setStep("paying");
    append("⛓  signing payment with agent wallet…");
    await wait(800);
    append("✓ payment signed (tx: 0xa3f…9b1)");
    await wait(400);
    setStep("verified");
    append("→ GET /api/fact  X-PAYMENT: <signed receipt>");
    await wait(550);
    append("← HTTP 200 OK");
    setStep("delivered");
  };

  return (
    <section className="py-20 md:py-28 bg-muted/20 border-y border-border">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-10">
          <span className="inline-block px-3 py-1 text-xs font-mono font-medium tracking-wider uppercase bg-primary/10 text-primary rounded-full mb-4">
            Try It Live
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            See an <span className="text-gradient-primary">x402 payment</span> in action
          </h2>
          <p className="text-lg text-muted-foreground">
            A simulated request to a paid endpoint. Watch the full HTTP 402 → pay → retry flow.
          </p>
        </div>

        <div className="max-w-3xl mx-auto rounded-2xl border border-border bg-card overflow-hidden shadow-lg">
          <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-muted/30">
            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
              <Lock className="h-3.5 w-3.5" /> {sample.source}
            </div>
            <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
              <Wallet className="h-3.5 w-3.5" /> agent wallet · 4.97 USDC
            </div>
          </div>

          <div className="grid md:grid-cols-2">
            <div className="p-6 border-b md:border-b-0 md:border-r border-border min-h-[280px]">
              <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-3">
                Network log
              </h3>
              <div className="font-mono text-xs space-y-1 text-muted-foreground">
                {log.length === 0 && <p className="text-muted-foreground/60">Click "Run" to start…</p>}
                {log.map((l, i) => (
                  <p key={i} className={l.startsWith("←") ? "text-foreground" : ""}>
                    {l}
                  </p>
                ))}
                {(step === "requesting" || step === "paying" || step === "verified") && (
                  <Loader2 className="h-3 w-3 animate-spin inline" />
                )}
              </div>
            </div>

            <div className="p-6 min-h-[280px] flex flex-col">
              <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-3">
                Response
              </h3>
              {step !== "delivered" ? (
                <div className="flex-1 flex items-center justify-center text-center text-muted-foreground/60 text-sm">
                  Locked until payment is verified
                </div>
              ) : (
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center gap-2 text-primary text-xs font-mono mb-3">
                    <CheckCircle2 className="h-4 w-4" /> Paid 0.001 USDC · delivered
                  </div>
                  <p className="text-sm leading-relaxed flex-1">{sample.fact}</p>
                </div>
              )}
            </div>
          </div>

          <div className="px-5 py-4 border-t border-border bg-muted/20 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Demo only — no real payment is made.
            </p>
            {step === "idle" && (
              <Button size="sm" onClick={run} variant="hero">
                Run demo
              </Button>
            )}
            {step !== "idle" && step !== "delivered" && (
              <Button size="sm" variant="outline" disabled>
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> Running…
              </Button>
            )}
            {step === "delivered" && (
              <Button size="sm" variant="outline" onClick={reset}>
                <RefreshCw className="h-3.5 w-3.5 mr-1" /> Run again
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default TryX402Demo;