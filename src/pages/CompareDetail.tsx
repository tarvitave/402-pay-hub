import { Link, useParams, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Newsletter from "@/components/Newsletter";
import InlineSubscribeCTA from "@/components/InlineSubscribeCTA";
import { ArrowLeft, Check, Minus } from "lucide-react";
import { comparisons } from "@/data/comparisons";

const CompareDetail = () => {
  const { slug } = useParams();
  const cmp = comparisons.find((c) => c.slug === slug);
  if (!cmp) return <Navigate to="/compare" replace />;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: cmp.title,
    description: cmp.metaDescription,
    about: ["x402 protocol", cmp.competitor, "HTTP 402", "Micropayments"],
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{cmp.title}</title>
        <meta name="description" content={cmp.metaDescription} />
        <link rel="canonical" href={`https://x402info.lovable.app/compare/${cmp.slug}`} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <Link
            to="/compare"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6"
          >
            <ArrowLeft className="h-4 w-4" /> All comparisons
          </Link>

          <h1 className="font-display text-3xl md:text-5xl font-bold mb-4">{cmp.title}</h1>
          <p className="text-lg text-muted-foreground mb-10 leading-relaxed">{cmp.intro}</p>

          <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 mb-10">
            <h2 className="text-xs font-mono uppercase tracking-wider text-primary mb-2">TL;DR</h2>
            <p className="text-base">{cmp.verdict}</p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-border mb-12">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-mono text-xs uppercase tracking-wider text-muted-foreground">
                    Feature
                  </th>
                  <th className="text-left p-4 font-mono text-xs uppercase tracking-wider text-primary">
                    x402
                  </th>
                  <th className="text-left p-4 font-mono text-xs uppercase tracking-wider text-muted-foreground">
                    {cmp.competitor}
                  </th>
                </tr>
              </thead>
              <tbody>
                {cmp.rows.map((row) => (
                  <tr key={row.feature} className="border-t border-border">
                    <td className="p-4 font-medium">{row.feature}</td>
                    <td
                      className={`p-4 ${
                        row.winner === "x402" ? "bg-primary/5 text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      <span className="flex items-start gap-2">
                        {row.winner === "x402" && <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />}
                        {row.x402}
                      </span>
                    </td>
                    <td
                      className={`p-4 ${
                        row.winner === "other" ? "bg-accent/5 text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      <span className="flex items-start gap-2">
                        {row.winner === "other" && <Check className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />}
                        {row.other}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-display text-lg font-semibold mb-3">Use x402 when</h3>
              <ul className="space-y-2">
                {cmp.whenToUseX402.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" /> {p}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-display text-lg font-semibold mb-3">Use {cmp.competitor} when</h3>
              <ul className="space-y-2">
                {cmp.whenToUseOther.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-sm">
                    <Minus className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" /> {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <InlineSubscribeCTA
            title="Stay current on x402 vs the field"
            description="Weekly updates as new payment protocols emerge."
          />

          <div className="mt-12">
            <h3 className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-4">
              Other comparisons
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {comparisons
                .filter((c) => c.slug !== cmp.slug)
                .map((c) => (
                  <Link
                    key={c.slug}
                    to={`/compare/${c.slug}`}
                    className="rounded-lg border border-border bg-card p-4 hover:border-primary/50 transition-colors"
                  >
                    <h4 className="font-semibold">x402 vs {c.competitor}</h4>
                    <p className="text-xs text-muted-foreground">{c.competitorTagline}</p>
                  </Link>
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

export default CompareDetail;