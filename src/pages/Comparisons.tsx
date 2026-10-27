import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Newsletter from "@/components/Newsletter";
import { ArrowRight, GitCompare } from "lucide-react";
import { comparisons } from "@/data/comparisons";

const Comparisons = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>x402 vs Other Payment Protocols | Detailed Comparisons</title>
        <meta
          name="description"
          content="Compare x402 to L402, Lightning Network, Stripe, and other payment protocols. Side-by-side feature matrices and recommendations."
        />
        <link rel="canonical" href="https://x402info.com/compare" />
      </Helmet>
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 text-xs font-mono font-medium tracking-wider uppercase bg-primary/10 text-primary rounded-full mb-4">
              Comparisons
            </span>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
              x402 vs <span className="text-gradient-primary">Everything Else</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Honest, side-by-side comparisons against the alternatives. Pick the right tool for your use case.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {comparisons.map((c) => (
              <Link
                key={c.slug}
                to={`/compare/${c.slug}`}
                className="group rounded-xl border border-border bg-card p-6 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                  <GitCompare className="h-5 w-5" />
                </div>
                <h2 className="font-display text-xl font-semibold mb-1 group-hover:text-primary transition-colors">
                  x402 vs {c.competitor}
                </h2>
                <p className="text-sm text-muted-foreground mb-4">{c.competitorTagline}</p>
                <span className="inline-flex items-center gap-1 text-sm text-primary font-medium">
                  Compare <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Newsletter />
      <Footer />
    </div>
  );
};

export default Comparisons;