import { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Newsletter from "@/components/Newsletter";
import InlineSubscribeCTA from "@/components/InlineSubscribeCTA";
import { Clock, ExternalLink, BookOpen, Code2, Layers, Cpu, ArrowRight } from "lucide-react";
import { tutorials, type Difficulty } from "@/data/tutorials";

type Filter = "All" | Difficulty;

const iconMap = {
  BookOpen: <BookOpen className="h-5 w-5" />,
  Code2: <Code2 className="h-5 w-5" />,
  Layers: <Layers className="h-5 w-5" />,
  Cpu: <Cpu className="h-5 w-5" />,
};

const difficultyColors: Record<Difficulty, string> = {
  Beginner: "bg-green-500/10 text-green-600 border-green-500/20",
  Intermediate: "bg-accent/10 text-accent-foreground border-accent/20",
  Advanced: "bg-destructive/10 text-destructive border-destructive/20",
};

const Tutorials = () => {
  const [activeDifficulty, setActiveDifficulty] = useState<Filter>("All");

  const filtered =
    activeDifficulty === "All" ? tutorials : tutorials.filter((t) => t.difficulty === activeDifficulty);

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>x402 Developer Tutorials | Step-by-Step Integration Guides</title>
        <meta
          name="description"
          content="Learn to integrate x402 micropayments with step-by-step tutorials for Express.js, Next.js, Cloudflare Workers, Python, and AI agents."
        />
        <link rel="canonical" href="https://x402info.com/tutorials" />
      </Helmet>
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
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

          <div className="max-w-4xl mx-auto mb-10 flex flex-wrap gap-2 justify-center">
            {(["All", "Beginner", "Intermediate", "Advanced"] as Filter[]).map((d) => (
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

          <div className="max-w-5xl mx-auto space-y-6">
            {filtered.map((tutorial, idx) => (
              <div key={tutorial.id}>
                <Link
                  to={`/tutorials/${tutorial.slug}`}
                  className="block group rounded-xl border border-border bg-card p-6 md:p-8 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all"
                >
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          {iconMap[tutorial.iconName]}
                        </div>
                        <span
                          className={`px-2 py-0.5 text-[10px] font-mono rounded-full border ${difficultyColors[tutorial.difficulty]}`}
                        >
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
                          <span
                            key={tag}
                            className="px-2 py-0.5 text-[10px] font-mono rounded-full bg-muted text-muted-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <span className="inline-flex items-center gap-1 text-sm text-primary font-medium">
                        Read tutorial <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>

                    <div className="md:w-72 flex-shrink-0">
                      <h4 className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">
                        What you'll build
                      </h4>
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
                </Link>
                {idx === 2 && (
                  <div className="my-6">
                    <InlineSubscribeCTA />
                  </div>
                )}
              </div>
            ))}
          </div>

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