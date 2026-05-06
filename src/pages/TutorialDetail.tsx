import { Link, useParams, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Newsletter from "@/components/Newsletter";
import InlineSubscribeCTA from "@/components/InlineSubscribeCTA";
import { ArrowLeft, ArrowRight, Clock, BookOpen, Code2, Layers, Cpu, CheckCircle2 } from "lucide-react";
import { tutorials, type Difficulty } from "@/data/tutorials";

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

const TutorialDetail = () => {
  const { slug } = useParams();
  const tutorial = tutorials.find((t) => t.slug === slug);

  if (!tutorial) return <Navigate to="/tutorials" replace />;

  const idx = tutorials.findIndex((t) => t.slug === slug);
  const next = tutorials[idx + 1];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{tutorial.title} | x402 Tutorial</title>
        <meta name="description" content={tutorial.excerpt} />
        <link rel="canonical" href={`https://x402info.lovable.app/tutorials/${tutorial.slug}`} />
      </Helmet>
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <Link
            to="/tutorials"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6"
          >
            <ArrowLeft className="h-4 w-4" /> All tutorials
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
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
            <span className="px-2 py-0.5 text-[10px] font-mono rounded-full bg-primary/5 text-primary border border-primary/10">
              {tutorial.framework}
            </span>
          </div>

          <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">{tutorial.title}</h1>
          <p className="text-lg text-muted-foreground mb-8">{tutorial.excerpt}</p>

          <div className="rounded-xl border border-border bg-card p-5 mb-10">
            <h2 className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-3">
              Prerequisites
            </h2>
            <ul className="space-y-2">
              {tutorial.prerequisites.map((p) => (
                <li key={p} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  {p}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-10">
            {tutorial.walkthrough.map((step, i) => (
              <section key={i}>
                <h2 className="font-display text-2xl font-semibold mb-3">{step.title}</h2>
                <p className="text-muted-foreground mb-4 leading-relaxed">{step.body}</p>
                {step.code && (
                  <pre className="rounded-lg border border-border bg-muted/40 p-4 overflow-x-auto text-xs font-mono">
                    <code>{step.code.content}</code>
                  </pre>
                )}
              </section>
            ))}
          </div>

          <div className="my-12">
            <InlineSubscribeCTA
              title="Get new x402 tutorials by email"
              description="Weekly deep dives, code samples, and ecosystem updates."
            />
          </div>

          {next && (
            <Link
              to={`/tutorials/${next.slug}`}
              className="block rounded-xl border border-border bg-card p-5 hover:border-primary/50 transition-colors"
            >
              <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                Next tutorial
              </span>
              <div className="flex items-center justify-between mt-1">
                <h3 className="font-display font-semibold">{next.title}</h3>
                <ArrowRight className="h-5 w-5 text-primary" />
              </div>
            </Link>
          )}
        </div>
      </main>

      <Newsletter />
      <Footer />
    </div>
  );
};

export default TutorialDetail;