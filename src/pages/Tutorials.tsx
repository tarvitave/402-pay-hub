import { useState } from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Newsletter from "@/components/Newsletter";
import InlineSubscribeCTA from "@/components/InlineSubscribeCTA";
import { Clock, ArrowRight, ExternalLink, BookOpen, Code2, Layers, Cpu } from "lucide-react";

type Difficulty = "All" | "Beginner" | "Intermediate" | "Advanced";

interface Tutorial {
  id: number;
  title: string;
  excerpt: string;
  difficulty: Exclude<Difficulty, "All">;
  readTime: string;
  framework: string;
  tags: string[];
  icon: React.ReactNode;
  steps: string[];
}

const tutorials: Tutorial[] = [
  {
    id: 1,
    title: "Getting Started with x402: Your First Paid Endpoint",
    excerpt: "Build a simple Express.js API that charges 1¢ per request using x402. From zero to a working micropayment endpoint in 15 minutes.",
    difficulty: "Beginner",
    readTime: "15 min",
    framework: "Express.js",
    tags: ["Node.js", "Express", "USDC"],
    icon: <BookOpen className="h-5 w-5" />,
    steps: [
      "Install the x402 middleware package",
      "Configure your wallet address for receiving payments",
      "Add the paymentMiddleware to your Express app",
      "Define pricing for each endpoint",
      "Test with the x402 client SDK",
    ],
  },
  {
    id: 2,
    title: "x402 + Next.js: Monetize Your API Routes",
    excerpt: "Add pay-per-use pricing to Next.js API routes and server actions. Learn how to gate premium content and data behind x402 micropayments.",
    difficulty: "Intermediate",
    readTime: "20 min",
    framework: "Next.js",
    tags: ["React", "Vercel", "Server Actions"],
    icon: <Layers className="h-5 w-5" />,
    steps: [
      "Set up x402 in a Next.js project",
      "Create a middleware wrapper for API routes",
      "Implement payment verification in server actions",
      "Build a client-side payment flow component",
      "Deploy to Vercel with environment variables",
    ],
  },
  {
    id: 3,
    title: "Building an AI Agent That Pays for Data",
    excerpt: "Create an autonomous AI agent using LangChain that can discover x402-enabled APIs, negotiate prices, and pay for data access without human intervention.",
    difficulty: "Advanced",
    readTime: "30 min",
    framework: "Python + LangChain",
    tags: ["AI Agent", "LangChain", "Autonomous"],
    icon: <Cpu className="h-5 w-5" />,
    steps: [
      "Set up an agent wallet with the AgentWallet SDK",
      "Implement 402 response detection in LangChain tools",
      "Build automatic payment approval logic",
      "Chain API calls with autonomous payment flow",
      "Add budget limits and spending controls",
    ],
  },
  {
    id: 4,
    title: "x402 with Cloudflare Workers",
    excerpt: "Deploy x402 payment-gated APIs on the edge with Cloudflare Workers. Sub-50ms response times with built-in stablecoin verification.",
    difficulty: "Intermediate",
    readTime: "18 min",
    framework: "Cloudflare Workers",
    tags: ["Edge Computing", "Wrangler", "Global"],
    icon: <Code2 className="h-5 w-5" />,
    steps: [
      "Initialize a Cloudflare Worker project",
      "Install the x402 verification library",
      "Implement payment verification at the edge",
      "Configure KV storage for payment receipts",
      "Deploy globally with wrangler",
    ],
  },
  {
    id: 5,
    title: "Multi-Chain Payments with x402 V2",
    excerpt: "Leverage x402 V2's CAIP standards to accept payments across Ethereum, Base, Arbitrum, and Solana from a single endpoint configuration.",
    difficulty: "Advanced",
    readTime: "25 min",
    framework: "Node.js",
    tags: ["Multi-chain", "CAIP", "x402 V2"],
    icon: <Layers className="h-5 w-5" />,
    steps: [
      "Understand CAIP chain and asset identifiers",
      "Configure multi-chain payment accepts",
      "Implement chain-specific verification",
      "Handle cross-chain settlement",
      "Test with multiple wallet providers",
    ],
  },
  {
    id: 6,
    title: "Monetizing a REST API with x402",
    excerpt: "Take an existing REST API and add tiered pricing: free endpoints, pay-per-call endpoints, and subscription-like bulk access with wallet-based identity.",
    difficulty: "Beginner",
    readTime: "12 min",
    framework: "Express.js",
    tags: ["REST API", "Tiered Pricing", "Identity"],
    icon: <BookOpen className="h-5 w-5" />,
    steps: [
      "Audit your API for monetizable endpoints",
      "Define a pricing strategy per route",
      "Implement x402 middleware with route-level config",
      "Enable wallet-based identity for repeat users",
      "Monitor revenue with payment event hooks",
    ],
  },
];

const difficultyColors: Record<Exclude<Difficulty, "All">, string> = {
  Beginner: "bg-green-500/10 text-green-600 border-green-500/20",
  Intermediate: "bg-accent/10 text-accent-foreground border-accent/20",
  Advanced: "bg-destructive/10 text-destructive border-destructive/20",
};

const Tutorials = () => {
  const [activeDifficulty, setActiveDifficulty] = useState<Difficulty>("All");

  const filtered = activeDifficulty === "All" ? tutorials : tutorials.filter((t) => t.difficulty === activeDifficulty);

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>x402 Developer Tutorials | Step-by-Step Integration Guides</title>
        <meta name="description" content="Learn to integrate x402 micropayments with step-by-step tutorials for Express.js, Next.js, Cloudflare Workers, Python, and AI agents." />
        <link rel="canonical" href="https://x402info.lovable.app/tutorials" />
      </Helmet>
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="max-w-3xl mx-auto text-center mb-12">
            <span className="inline-block px-3 py-1 text-xs font-mono font-medium tracking-wider uppercase bg-primary/10 text-primary rounded-full mb-4">
              Developer Tutorials
            </span>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Build with <span className="text-gradient-primary">x402</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Step-by-step guides to integrate HTTP 402 micropayments into your applications, APIs, and AI agents.
            </p>
          </div>

          {/* Difficulty Filter */}
          <div className="max-w-4xl mx-auto mb-10 flex flex-wrap gap-2 justify-center">
            {(["All", "Beginner", "Intermediate", "Advanced"] as Difficulty[]).map((d) => (
              <button
                key={d}
                onClick={() => setActiveDifficulty(d)}
                className={`px-4 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                  activeDifficulty === d
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground border-border hover:border-primary/50"
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          {/* Tutorials Grid */}
          <div className="max-w-5xl mx-auto space-y-6">
            {filtered.map((tutorial, idx) => (
              <div key={tutorial.id}>
                <div className="group rounded-xl border border-border bg-card p-6 md:p-8 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Left */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          {tutorial.icon}
                        </div>
                        <span className={`px-2 py-0.5 text-[10px] font-mono rounded-full border ${difficultyColors[tutorial.difficulty]}`}>
                          {tutorial.difficulty}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {tutorial.readTime}
                        </span>
                      </div>
                      <h2 className="text-xl font-display font-semibold mb-2 group-hover:text-primary transition-colors">
                        {tutorial.title}
                      </h2>
                      <p className="text-sm text-muted-foreground mb-3">{tutorial.excerpt}</p>
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        <span className="px-2 py-0.5 text-[10px] font-mono rounded-full bg-primary/5 text-primary border border-primary/10">
                          {tutorial.framework}
                        </span>
                        {tutorial.tags.map((tag) => (
                          <span key={tag} className="px-2 py-0.5 text-[10px] font-mono rounded-full bg-muted text-muted-foreground">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Right: Steps */}
                    <div className="md:w-72 flex-shrink-0">
                      <h4 className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">What you'll build</h4>
                      <ol className="space-y-1.5">
                        {tutorial.steps.map((step, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/10 text-primary text-[9px] font-bold flex-shrink-0 mt-0.5">
                              {i + 1}
                            </span>
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </div>
                {idx === 2 && <div className="my-6"><InlineSubscribeCTA /></div>}
              </div>
            ))}
          </div>

          {/* External resources */}
          <div className="max-w-5xl mx-auto mt-16">
            <h2 className="text-2xl font-display font-bold mb-6 text-center">External Resources</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { title: "Official x402 Docs", url: "https://docs.x402.org", desc: "Complete protocol specification and API reference" },
                { title: "x402 GitHub", url: "https://github.com/coinbase/x402", desc: "Open-source SDK, examples, and reference implementations" },
                { title: "Coinbase CDP Docs", url: "https://docs.cdp.coinbase.com/x402/welcome", desc: "AI-powered documentation with interactive examples" },
              ].map((r) => (
                <a
                  key={r.url}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-3 rounded-lg border border-border bg-card p-4 hover:border-primary/50 transition-colors"
                >
                  <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-semibold group-hover:text-primary transition-colors">{r.title}</h3>
                    <p className="text-xs text-muted-foreground">{r.desc}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Newsletter />
      <Footer />
    </div>
  );
};

export default Tutorials;
