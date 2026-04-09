import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Newsletter from "@/components/Newsletter";
import InlineSubscribeCTA from "@/components/InlineSubscribeCTA";
import { ArrowRight, Zap, Bot, Database, Globe, Shield, Coins } from "lucide-react";

interface UseCase {
  title: string;
  description: string;
  example: string;
  icon: React.ReactNode;
  benefits: string[];
  industry: string;
}

const useCases: UseCase[] = [
  {
    title: "Pay-Per-Call AI APIs",
    description: "Monetize AI inference endpoints with per-request micropayments. No API keys, no subscriptions — just instant payment per call.",
    example: "An LLM provider charges $0.001 per token via x402. AI agents pay automatically, scaling costs perfectly with usage.",
    icon: <Bot className="h-6 w-6" />,
    benefits: ["Zero signup friction", "Usage-based pricing", "Autonomous agent support"],
    industry: "AI & Machine Learning",
  },
  {
    title: "Premium Data Feeds",
    description: "Gate real-time financial data, blockchain analytics, or market intelligence behind x402 micropayments.",
    example: "Nansen charges $0.05 per wallet analysis query. Traders and bots pay per insight without monthly commitments.",
    icon: <Database className="h-6 w-6" />,
    benefits: ["No minimum commitment", "Real-time access", "Machine-readable pricing"],
    industry: "Finance & Analytics",
  },
  {
    title: "Content Monetization",
    description: "Replace paywalls with micropayments. Readers pay fractions of a cent per article instead of monthly subscriptions.",
    example: "A research publication charges $0.10 per article. Readers pay only for what they read, no account needed.",
    icon: <Globe className="h-6 w-6" />,
    benefits: ["Higher conversion rates", "No account required", "Global accessibility"],
    industry: "Media & Publishing",
  },
  {
    title: "Decentralized API Marketplace",
    description: "Build marketplaces where any developer can list paid APIs. x402 handles payment negotiation and settlement automatically.",
    example: "A weather data marketplace lets providers set their own prices. Consumers discover and pay for endpoints on the fly.",
    icon: <Coins className="h-6 w-6" />,
    benefits: ["Permissionless listing", "Instant settlement", "Multi-vendor support"],
    industry: "API Economy",
  },
  {
    title: "IoT Device Micropayments",
    description: "Enable machine-to-machine payments between IoT devices for bandwidth, compute, storage, or sensor data access.",
    example: "A self-driving car pays roadside sensors for real-time traffic data at $0.0001 per data point.",
    icon: <Zap className="h-6 w-6" />,
    benefits: ["Sub-cent transactions", "No human intervention", "Real-time settlement"],
    industry: "IoT & Edge Computing",
  },
  {
    title: "Anti-Spam & Rate Limiting",
    description: "Use micropayments as a Sybil-resistance mechanism. Requiring even a tiny payment per request stops automated abuse.",
    example: "A public API charges $0.001 per request to prevent DDoS and scraping while remaining accessible to legitimate users.",
    icon: <Shield className="h-6 w-6" />,
    benefits: ["Economic spam prevention", "No CAPTCHAs needed", "Legitimate access preserved"],
    industry: "Security & Infrastructure",
  },
];

const UseCases = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>x402 Use Cases | Real-World Micropayment Applications</title>
        <meta name="description" content="Explore real-world x402 use cases: AI API monetization, premium data feeds, content micropayments, IoT machine-to-machine payments, and more." />
        <link rel="canonical" href="https://x402info.lovable.app/use-cases" />
      </Helmet>
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="max-w-3xl mx-auto text-center mb-14">
            <span className="inline-block px-3 py-1 text-xs font-mono font-medium tracking-wider uppercase bg-primary/10 text-primary rounded-full mb-4">
              Use Cases
            </span>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
              What You Can Build with <span className="text-gradient-primary">x402</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              From AI agent payments to content monetization — real-world applications of HTTP 402 micropayments across industries.
            </p>
          </div>

          {/* Use Cases */}
          <div className="max-w-5xl mx-auto space-y-8">
            {useCases.map((uc, idx) => (
              <div key={uc.title}>
                <div className="group rounded-xl border border-border bg-card overflow-hidden hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all">
                  <div className="p-6 md:p-8">
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Left */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                            {uc.icon}
                          </div>
                          <div>
                            <h2 className="text-xl font-display font-semibold group-hover:text-primary transition-colors">
                              {uc.title}
                            </h2>
                            <span className="text-xs font-mono text-muted-foreground">{uc.industry}</span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">{uc.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {uc.benefits.map((b) => (
                            <span key={b} className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-primary/5 text-primary border border-primary/10">
                              <ArrowRight className="h-3 w-3" /> {b}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Right: Example */}
                      <div className="md:w-80 flex-shrink-0 bg-muted/50 rounded-lg p-4 border border-border/50">
                        <h4 className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">Example Scenario</h4>
                        <p className="text-sm text-foreground/80">{uc.example}</p>
                      </div>
                    </div>
                  </div>
                </div>
                {idx === 2 && <div className="my-6"><InlineSubscribeCTA /></div>}
              </div>
            ))}
          </div>
        </div>
      </main>

      <Newsletter />
      <Footer />
    </div>
  );
};

export default UseCases;
