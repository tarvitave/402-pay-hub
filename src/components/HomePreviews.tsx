import { Link } from "react-router-dom";
import { ArrowRight, Bot, Database, BookOpen, Layers, Cpu, GitCompare } from "lucide-react";
import { tutorials } from "@/data/tutorials";
import { comparisons } from "@/data/comparisons";

const iconMap = {
  BookOpen: <BookOpen className="h-5 w-5" />,
  Layers: <Layers className="h-5 w-5" />,
  Cpu: <Cpu className="h-5 w-5" />,
  Code2: <Layers className="h-5 w-5" />,
};

const featuredUseCases = [
  {
    title: "Pay-Per-Call AI APIs",
    desc: "Monetize AI inference per-request. No keys, no subscriptions.",
    icon: <Bot className="h-5 w-5" />,
  },
  {
    title: "Premium Data Feeds",
    desc: "Gate real-time analytics behind tiny per-query payments.",
    icon: <Database className="h-5 w-5" />,
  },
  {
    title: "Decentralized API Marketplace",
    desc: "Permissionless listings with instant settlement.",
    icon: <GitCompare className="h-5 w-5" />,
  },
];

const HomePreviews = () => {
  const topTutorials = tutorials.slice(0, 3);

  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4 space-y-20">
        {/* Tutorials */}
        <div>
          <SectionHeader
            tag="Developer Tutorials"
            title="Start building"
            subtitle="Step-by-step guides to ship your first paid endpoint."
            href="/tutorials"
            cta="All tutorials"
          />
          <div className="grid md:grid-cols-3 gap-6">
            {topTutorials.map((t) => (
              <Link
                key={t.slug}
                to={`/tutorials/${t.slug}`}
                className="group rounded-xl border border-border bg-card p-6 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary mb-3">
                  {iconMap[t.iconName as keyof typeof iconMap]}
                </div>
                <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1">
                  {t.framework} · {t.readTime}
                </p>
                <h3 className="font-display font-semibold mb-2 group-hover:text-primary transition-colors">
                  {t.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{t.excerpt}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Use Cases */}
        <div>
          <SectionHeader
            tag="Use Cases"
            title="Built for these flows"
            subtitle="Real-world applications shipping with x402 today."
            href="/use-cases"
            cta="All use cases"
          />
          <div className="grid md:grid-cols-3 gap-6">
            {featuredUseCases.map((u) => (
              <Link
                key={u.title}
                to="/use-cases"
                className="group rounded-xl border border-border bg-card p-6 hover:border-primary/50 transition-all"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary mb-3">
                  {u.icon}
                </div>
                <h3 className="font-display font-semibold mb-2 group-hover:text-primary transition-colors">
                  {u.title}
                </h3>
                <p className="text-sm text-muted-foreground">{u.desc}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Comparisons */}
        <div>
          <SectionHeader
            tag="Comparisons"
            title="x402 vs the alternatives"
            subtitle="Honest side-by-side breakdowns to help you choose."
            href="/compare"
            cta="All comparisons"
          />
          <div className="grid md:grid-cols-3 gap-6">
            {comparisons.map((c) => (
              <Link
                key={c.slug}
                to={`/compare/${c.slug}`}
                className="group rounded-xl border border-border bg-card p-6 hover:border-primary/50 transition-all"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary mb-3">
                  <GitCompare className="h-5 w-5" />
                </div>
                <h3 className="font-display font-semibold mb-2 group-hover:text-primary transition-colors">
                  x402 vs {c.competitor}
                </h3>
                <p className="text-sm text-muted-foreground">{c.competitorTagline}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const SectionHeader = ({
  tag,
  title,
  subtitle,
  href,
  cta,
}: {
  tag: string;
  title: string;
  subtitle: string;
  href: string;
  cta: string;
}) => (
  <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
    <div>
      <span className="text-primary font-mono text-sm mb-2 block">{tag.toUpperCase()}</span>
      <h2 className="font-display text-3xl md:text-4xl font-bold">
        {title}
      </h2>
      <p className="text-muted-foreground mt-2">{subtitle}</p>
    </div>
    <Link
      to={href}
      className="inline-flex items-center gap-1 text-sm text-primary font-medium hover:gap-2 transition-all"
    >
      {cta} <ArrowRight className="h-4 w-4" />
    </Link>
  </div>
);

export default HomePreviews;