import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Newsletter from "@/components/Newsletter";
import InlineSubscribeCTA from "@/components/InlineSubscribeCTA";
import { Calendar, Clock, ArrowRight, Pin, ExternalLink } from "lucide-react";

interface ProtocolArticle {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  category: string;
  pinned?: boolean;
  protocolName?: string;
  websiteUrl?: string;
}

const articles: ProtocolArticle[] = [
  {
    id: 0,
    slug: "comparing-agentic-payment-protocols",
    title: "x402 vs L402 vs Paymail vs Others: Comparing Agentic Payment Protocols",
    excerpt:
      "A comprehensive side-by-side comparison of every major protocol designed for machine-to-machine and agentic payments. We evaluate x402, L402, Paymail, Open Payments, and more on latency, developer experience, chain support, and real-world adoption.",
    date: "2025-02-10",
    readTime: "14 min read",
    category: "Comparison",
    pinned: true,
  },
  {
    id: 1,
    slug: "l402-lightning-payments",
    title: "L402: Lightning-Native Authentication & Payments",
    excerpt:
      "L402 (formerly LSAT) combines HTTP 402 with Lightning Network invoices and macaroon-based auth tokens. Learn how it works, its strengths for streaming sats, and where it falls short for multi-chain use cases.",
    date: "2025-01-28",
    readTime: "9 min read",
    category: "Protocol Deep-Dive",
    protocolName: "L402",
    websiteUrl: "https://docs.lightning.engineering/the-lightning-network/l402",
  },
  {
    id: 2,
    slug: "open-payments-interledger",
    title: "Open Payments & Interledger: Currency-Agnostic Micropayments",
    excerpt:
      "The Interledger Foundation's Open Payments standard offers a REST-based protocol for sending value across any ledger. We explore its GNAP-based auth model, Web Monetization tie-in, and how it compares to x402.",
    date: "2025-01-20",
    readTime: "10 min read",
    category: "Protocol Deep-Dive",
    protocolName: "Open Payments",
    websiteUrl: "https://openpayments.dev",
  },
  {
    id: 3,
    slug: "paymail-bsv-payments",
    title: "Paymail: Human-Readable Payment Addressing on BSV",
    excerpt:
      "Paymail replaces raw addresses with email-like identifiers and uses capability discovery for payment negotiation. Understand its service-record approach and why it remains mostly BSV-centric.",
    date: "2025-01-14",
    readTime: "7 min read",
    category: "Protocol Deep-Dive",
    protocolName: "Paymail",
    websiteUrl: "https://bsvalias.org",
  },
  {
    id: 4,
    slug: "ens-and-crypto-payment-resolution",
    title: "ENS & Address Resolution for On-Chain Payments",
    excerpt:
      "Ethereum Name Service and similar resolvers let agents look up wallet addresses from human-readable names. We examine how ENS, Unstoppable Domains, and Basenames fit into agentic payment flows.",
    date: "2025-01-06",
    readTime: "8 min read",
    category: "Infrastructure",
    protocolName: "ENS",
    websiteUrl: "https://ens.domains",
  },
  {
    id: 5,
    slug: "web-monetization-standard",
    title: "Web Monetization: The W3C Streaming Micropayment API",
    excerpt:
      "Web Monetization uses a browser-level API and Interledger to stream tiny payments to content creators. We look at its current browser support, the role of payment pointers, and whether AI agents can leverage it.",
    date: "2024-12-30",
    readTime: "8 min read",
    category: "Protocol Deep-Dive",
    protocolName: "Web Monetization",
    websiteUrl: "https://webmonetization.org",
  },
  {
    id: 6,
    slug: "smart-contract-payment-channels",
    title: "Payment Channels & State Channels for Agent Commerce",
    excerpt:
      "From Lightning channels to Ethereum state channels (Connext, Raiden), off-chain payment channels reduce cost and latency for high-frequency agent transactions. A practical overview of the tradeoffs.",
    date: "2024-12-22",
    readTime: "11 min read",
    category: "Infrastructure",
  },
  {
    id: 7,
    slug: "nostr-wallet-connect",
    title: "Nostr Wallet Connect (NWC): Decentralised Payment Orchestration",
    excerpt:
      "NWC lets any Nostr client trigger Lightning payments through relay-based wallet communication. Discover why some agent builders are eyeing NWC for censorship-resistant, permissionless payment flows.",
    date: "2024-12-15",
    readTime: "7 min read",
    category: "Protocol Deep-Dive",
    protocolName: "NWC",
    websiteUrl: "https://nwc.dev",
  },
];

const AlternateProtocols = () => {
  const pinnedArticle = articles.find((a) => a.pinned);
  const regularArticles = articles.filter((a) => !a.pinned);

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Alternate Payment Protocols | x402 vs L402, Open Payments, Paymail & More</title>
        <meta
          name="description"
          content="Compare agentic payment protocols: x402, L402, Open Payments, Paymail, Web Monetization, ENS, and more. Deep dives, comparisons, and implementation guides for machine-to-machine payments."
        />
        <meta
          name="keywords"
          content="agentic payments, L402, Open Payments, Interledger, Paymail, Web Monetization, ENS, payment channels, NWC, machine to machine payments, AI agent payments"
        />
        <link rel="canonical" href="https://x402info.lovable.app/protocols" />
      </Helmet>
      <Navbar />

      <main className="pt-24 pb-16">
        <section className="container mx-auto px-4 py-16">
          {/* Header */}
          <div className="max-w-3xl mb-12">
            <span className="text-primary font-mono text-sm mb-4 block">ALTERNATE PROTOCOLS</span>
            <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
              The Landscape of{" "}
              <span className="text-gradient-primary">Agentic Payments</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              x402 isn't the only game in town. Explore the protocols, standards, and infrastructure powering
              machine-to-machine payments across the web.
            </p>
          </div>

          {/* Pinned Comparison Article */}
          {pinnedArticle && (
            <div className="mb-16">
              <Link
                to={`/protocols/${pinnedArticle.slug}`}
                className="group block border-2 border-primary/30 bg-primary/5 rounded-xl overflow-hidden hover:shadow-elevated hover:border-primary/50 transition-all duration-300"
              >
                <div className="p-8 md:p-10">
                  <div className="flex items-center gap-3 mb-5">
                    <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-mono rounded-full bg-primary/20 text-primary">
                      <Pin className="w-3 h-3" />
                      Pinned
                    </span>
                    <span className="px-3 py-1 text-xs font-mono rounded-full bg-accent/20 text-accent">
                      {pinnedArticle.category}
                    </span>
                  </div>
                  <h2 className="font-display text-2xl md:text-3xl font-semibold mb-4 group-hover:text-primary transition-colors">
                    {pinnedArticle.title}
                  </h2>
                  <p className="text-muted-foreground text-lg mb-6 max-w-3xl">
                    {pinnedArticle.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(pinnedArticle.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {pinnedArticle.readTime}
                      </span>
                    </div>
                    <span className="text-primary text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                      Read comparison <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          )}

          {/* Inline Subscribe CTA */}
          <div className="mb-16">
            <InlineSubscribeCTA
              title="Stay on top of the protocol wars"
              description="Get weekly breakdowns of new agentic payment standards, integrations, and ecosystem shifts."
            />
          </div>

          {/* Protocol Articles Grid */}
          <h3 className="font-display text-xl font-semibold mb-6">Protocol Deep-Dives</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularArticles.map((article) => (
              <article
                key={article.id}
                className="group border-gradient rounded-xl overflow-hidden hover:shadow-elevated transition-all duration-300 flex flex-col"
              >
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-3 mb-4 flex-wrap">
                    <span className="px-3 py-1 text-xs font-mono rounded-full bg-primary/10 text-primary">
                      {article.category}
                    </span>
                    {article.protocolName && (
                      <span className="px-3 py-1 text-xs font-mono rounded-full bg-muted text-muted-foreground">
                        {article.protocolName}
                      </span>
                    )}
                  </div>
                  <h3 className="font-display text-lg font-semibold mb-3 group-hover:text-primary transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-3 flex-1">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(article.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {article.readTime}
                      </span>
                    </div>
                    {article.websiteUrl && (
                      <a
                        href={article.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary transition-colors"
                        onClick={(e) => e.stopPropagation()}
                        title={`Visit ${article.protocolName} website`}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <Newsletter />
      <Footer />
    </div>
  );
};

export default AlternateProtocols;
