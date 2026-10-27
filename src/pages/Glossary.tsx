import { useState } from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Newsletter from "@/components/Newsletter";
import { Search, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";

interface GlossaryTerm {
  term: string;
  definition: string;
  category: string;
  related?: string[];
}

const terms: GlossaryTerm[] = [
  { term: "HTTP 402", definition: "An HTTP status code meaning 'Payment Required.' Reserved since 1997 in the HTTP specification for future use with digital payment systems. x402 is the first protocol to give it a standardized implementation.", category: "Protocol", related: ["x402", "Status Code"] },
  { term: "x402", definition: "An open payment standard that turns the HTTP 402 status code into a fully-featured, on-chain payment layer for APIs, websites, and autonomous agents. Licensed under Apache-2.0.", category: "Protocol", related: ["HTTP 402", "Micropayments"] },
  { term: "Micropayment", definition: "A financial transaction involving a very small sum of money, typically under $1. x402 enables sub-cent payments that are impractical with traditional payment rails due to high fixed fees.", category: "Payments", related: ["Pay-Per-Use", "Stablecoin"] },
  { term: "Pay-Per-Use", definition: "A pricing model where users pay only for what they consume, rather than subscribing to a plan. x402 makes this model viable even for individual API calls costing fractions of a cent.", category: "Payments", related: ["Micropayment", "API Monetization"] },
  { term: "Stablecoin", definition: "A cryptocurrency designed to maintain a stable value relative to a fiat currency (e.g., USDC pegged to USD). x402 uses stablecoins to avoid the volatility of other cryptocurrencies.", category: "Crypto", related: ["USDC", "Settlement"] },
  { term: "USDC", definition: "USD Coin — a regulated stablecoin pegged 1:1 to the US dollar, issued by Circle. It's the primary settlement currency for x402 transactions on Base and other EVM chains.", category: "Crypto", related: ["Stablecoin", "Base", "Settlement"] },
  { term: "Base", definition: "An Ethereum Layer 2 network built by Coinbase. It provides low-cost, high-speed transactions ideal for x402 micropayments, with transaction fees often under $0.01.", category: "Infrastructure", related: ["Layer 2", "EVM", "USDC"] },
  { term: "Layer 2 (L2)", definition: "A secondary blockchain framework built on top of a Layer 1 (like Ethereum) to improve scalability and reduce costs. Base, Arbitrum, and Optimism are popular L2s used with x402.", category: "Infrastructure", related: ["Base", "Scalability"] },
  { term: "Settlement", definition: "The process of finalizing a payment transaction on the blockchain. x402 settlements happen on-chain, providing cryptographic proof of payment.", category: "Payments", related: ["On-chain", "Finality"] },
  { term: "Payment Middleware", definition: "Software that sits between your API server and incoming requests. x402's payment middleware intercepts requests, checks for valid payment, and either serves the response or returns a 402 status.", category: "Protocol", related: ["x402", "HTTP 402"] },
  { term: "Agentic Payments", definition: "Payments made autonomously by AI agents or software programs without human intervention. x402 is designed for machine-to-machine payment flows where no human is in the loop.", category: "AI", related: ["AI Agent", "Machine-to-Machine"] },
  { term: "AI Agent", definition: "An autonomous software program that can perceive its environment, make decisions, and take actions to achieve goals. In the x402 context, agents can discover, negotiate, and pay for API services.", category: "AI", related: ["Agentic Payments", "Autonomous"] },
  { term: "CAIP", definition: "Chain Agnostic Improvement Proposals — a set of standards for identifying blockchains and assets across different networks. x402 V2 uses CAIP for multi-chain payment support.", category: "Protocol", related: ["Multi-chain", "x402 V2"] },
  { term: "Wallet-Based Identity", definition: "Using a cryptocurrency wallet address as a form of identity. x402 V2 allows returning users to be recognized by their wallet, avoiding re-payment on every request.", category: "Protocol", related: ["x402 V2", "Authentication"] },
  { term: "Payment Verification", definition: "The process of cryptographically validating that a payment was made before granting access. x402 verifies on-chain transactions in real-time without trusted intermediaries.", category: "Protocol", related: ["Settlement", "On-chain"] },
  { term: "L402", definition: "Formerly LSAT — a protocol combining HTTP 402 with Lightning Network invoices and macaroon-based authentication. An alternative to x402 focused on the Bitcoin Lightning Network.", category: "Alternatives", related: ["HTTP 402", "Lightning Network"] },
  { term: "Open Payments", definition: "An Interledger-based protocol for currency-agnostic micropayments. Uses GNAP for authorization and supports both fiat and crypto settlement.", category: "Alternatives", related: ["Interledger", "Micropayments"] },
  { term: "Web Monetization", definition: "A W3C proposed standard that enables passive, streaming micropayments from users to content creators as they browse. Uses the Interledger Protocol for settlement.", category: "Alternatives", related: ["W3C", "Streaming Payments"] },
  { term: "API Monetization", definition: "The practice of generating revenue from APIs by charging consumers for access. x402 enables a new paradigm where payment is built into the HTTP protocol itself.", category: "Business", related: ["Pay-Per-Use", "Micropayment"] },
  { term: "Zero-Knowledge Proof", definition: "A cryptographic method where one party can prove to another that a statement is true without revealing any additional information. Emerging in x402 for privacy-preserving payment verification.", category: "Crypto", related: ["Privacy", "Verification"] },
];

const categories = ["All", ...Array.from(new Set(terms.map((t) => t.category)))];

const Glossary = () => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = terms
    .filter((t) => {
      const matchesSearch =
        search === "" ||
        t.term.toLowerCase().includes(search.toLowerCase()) ||
        t.definition.toLowerCase().includes(search.toLowerCase());
      const matchesCat = activeCategory === "All" || t.category === activeCategory;
      return matchesSearch && matchesCat;
    })
    .sort((a, b) => a.term.localeCompare(b.term));

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>x402 Glossary | Key Terms & Concepts for HTTP 402 Payments</title>
        <meta name="description" content="A comprehensive glossary of x402, HTTP 402, micropayment, and agentic payment terminology. Learn the key concepts behind internet-native payments." />
        <link rel="canonical" href="https://x402info.com/glossary" />
      </Helmet>
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="max-w-3xl mx-auto text-center mb-12">
            <span className="inline-block px-3 py-1 text-xs font-mono font-medium tracking-wider uppercase bg-primary/10 text-primary rounded-full mb-4">
              Knowledge Base
            </span>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
              x402 <span className="text-gradient-primary">Glossary</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Every term you need to understand HTTP 402 payments, micropayments, and the agentic payment ecosystem.
            </p>
          </div>

          {/* Search & Filters */}
          <div className="max-w-3xl mx-auto mb-10 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search terms..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                    activeCategory === cat
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-muted-foreground border-border hover:border-primary/50"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Terms */}
          <div className="max-w-3xl mx-auto space-y-4">
            <p className="text-sm text-muted-foreground">{filtered.length} terms found</p>
            {filtered.map((t) => (
              <div
                key={t.term}
                className="rounded-xl border border-border bg-card p-5 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary flex-shrink-0 mt-0.5">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-display font-semibold text-lg">{t.term}</h3>
                      <span className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        {t.category}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{t.definition}</p>
                    {t.related && t.related.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        <span className="text-[10px] text-muted-foreground">Related:</span>
                        {t.related.map((r) => (
                          <button
                            key={r}
                            onClick={() => setSearch(r)}
                            className="text-[10px] font-mono text-primary hover:underline cursor-pointer"
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
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

export default Glossary;
