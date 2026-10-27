import { useState } from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Newsletter from "@/components/Newsletter";
import SubmitProjectForm from "@/components/SubmitProjectForm";
import { ExternalLink, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";

type Category = "All" | "Infrastructure" | "DeFi" | "AI Agents" | "Developer Tools" | "Wallets" | "Analytics";

interface EcosystemProject {
  name: string;
  description: string;
  category: Category;
  url: string;
  logo?: string;
  tags: string[];
  featured?: boolean;
}

const projects: EcosystemProject[] = [
  {
    name: "Alchemy",
    description: "Integrates x402 to enable monetized access to blockchain developer platform APIs, allowing AI agents to pay for RPC calls using stablecoins.",
    category: "Infrastructure",
    url: "https://www.alchemy.com",
    tags: ["RPC", "Web3 API", "Stablecoins"],
    featured: true,
  },
  {
    name: "Stripe",
    description: "Exploring x402 integration for seamless HTTP-native payment flows alongside traditional payment rails.",
    category: "Infrastructure",
    url: "https://stripe.com",
    tags: ["Payments", "Fiat Bridge", "Enterprise"],
    featured: true,
  },
  {
    name: "AWS",
    description: "Cloud infrastructure support for x402-enabled API endpoints, enabling pay-per-use cloud services for AI agents.",
    category: "Infrastructure",
    url: "https://aws.amazon.com",
    tags: ["Cloud", "APIs", "Serverless"],
    featured: true,
  },
  {
    name: "Vercel",
    description: "Deploying x402-enabled serverless functions and edge APIs with built-in micropayment support.",
    category: "Infrastructure",
    url: "https://vercel.com",
    tags: ["Serverless", "Edge", "Deployment"],
  },
  {
    name: "Cloudflare",
    description: "x402 integration at the edge, enabling pay-per-request Workers and content monetization at global scale.",
    category: "Infrastructure",
    url: "https://cloudflare.com",
    tags: ["CDN", "Edge Workers", "Security"],
  },
  {
    name: "Nansen",
    description: "On-chain analytics platform using x402 for pay-per-query access to blockchain data and wallet intelligence.",
    category: "Analytics",
    url: "https://www.nansen.ai",
    tags: ["Analytics", "On-chain Data", "Intelligence"],
  },
  {
    name: "Messari",
    description: "Crypto research and data platform with x402-enabled API access for real-time market data and research reports.",
    category: "Analytics",
    url: "https://messari.io",
    tags: ["Research", "Market Data", "Reports"],
  },
  {
    name: "AgentWallet SDK",
    description: "Open-source SDK enabling AI agents to hold wallets and make x402 payments autonomously without human intervention.",
    category: "AI Agents",
    url: "https://github.com/coinbase/x402",
    tags: ["SDK", "Autonomous Payments", "Open Source"],
    featured: true,
  },
  {
    name: "Coinbase Developer Platform",
    description: "Creator and primary sponsor of x402, providing developer tools, documentation, and reference implementations.",
    category: "Developer Tools",
    url: "https://docs.cdp.coinbase.com/x402/welcome",
    tags: ["Documentation", "Reference", "SDK"],
  },
  {
    name: "World",
    description: "Worldcoin/World integration with x402 for identity-verified micropayments and proof-of-personhood gating.",
    category: "Wallets",
    url: "https://world.org",
    tags: ["Identity", "Proof of Personhood", "Payments"],
  },
  {
    name: "Chainstack",
    description: "Multi-cloud blockchain infrastructure supporting x402 for monetized node access and API endpoints.",
    category: "Infrastructure",
    url: "https://chainstack.com",
    tags: ["Nodes", "Multi-chain", "API"],
  },
  {
    name: "SmartContracts.tools",
    description: "Developer tooling for building and testing x402-enabled smart contract interactions and payment flows.",
    category: "Developer Tools",
    url: "https://www.smartcontracts.tools",
    tags: ["Smart Contracts", "Testing", "Tooling"],
  },
  {
    name: "Dwellir",
    description: "Decentralized RPC infrastructure with x402 integration for pay-per-call node access across multiple chains.",
    category: "Infrastructure",
    url: "https://dwellir.com",
    tags: ["RPC", "Decentralized", "Multi-chain"],
  },
  {
    name: "Base",
    description: "Layer 2 network built on Ethereum, providing low-cost settlement for x402 stablecoin micropayments.",
    category: "Infrastructure",
    url: "https://base.org",
    tags: ["L2", "USDC", "Low Fees"],
    featured: true,
  },
];

const categories: Category[] = ["All", "Infrastructure", "DeFi", "AI Agents", "Developer Tools", "Wallets", "Analytics"];

const Ecosystem = () => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category>("All");

  const filtered = projects.filter((p) => {
    const matchesSearch =
      search === "" ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchesCat = activeCategory === "All" || p.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  const featured = filtered.filter((p) => p.featured);
  const rest = filtered.filter((p) => !p.featured);

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>x402 Ecosystem | Projects, Tools & Integrations Directory</title>
        <meta name="description" content="Explore the x402 ecosystem — discover projects, tools, platforms, and integrations building with the HTTP 402 payment protocol for AI agents and micropayments." />
        <link rel="canonical" href="https://x402info.com/ecosystem" />
      </Helmet>
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="max-w-3xl mx-auto text-center mb-12">
            <span className="inline-block px-3 py-1 text-xs font-mono font-medium tracking-wider uppercase bg-primary/10 text-primary rounded-full mb-4">
              Ecosystem Directory
            </span>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Who's Building with <span className="text-gradient-primary">x402</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              A growing directory of projects, tools, and platforms integrating the x402 payment protocol. Filter by category or search to find what you need.
            </p>
          </div>

          {/* Search & Filters */}
          <div className="max-w-4xl mx-auto mb-10 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects, tags, or descriptions..."
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

          {/* Featured */}
          {featured.length > 0 && (
            <div className="max-w-6xl mx-auto mb-12">
              <h2 className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                <Filter className="h-3.5 w-3.5" /> Featured Partners
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featured.map((project) => (
                  <ProjectCard key={project.name} project={project} />
                ))}
              </div>
            </div>
          )}

          {/* All */}
          <div className="max-w-6xl mx-auto">
            {rest.length > 0 && (
              <>
                <h2 className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-4">
                  All Projects ({filtered.length})
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rest.map((project) => (
                    <ProjectCard key={project.name} project={project} />
                  ))}
                </div>
              </>
            )}
            {filtered.length === 0 && (
              <p className="text-center text-muted-foreground py-12">No projects match your search. Try a different term or category.</p>
            )}
          </div>

          <div className="max-w-3xl mx-auto mt-20">
            <SubmitProjectForm />
          </div>
        </div>
      </main>

      <Newsletter />
      <Footer />
    </div>
  );
};

const ProjectCard = ({ project }: { project: EcosystemProject }) => (
  <a
    href={project.url}
    target="_blank"
    rel="noopener noreferrer"
    className="group block rounded-xl border border-border bg-card p-6 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all"
  >
    <div className="flex items-start justify-between mb-3">
      <div>
        <h3 className="font-display font-semibold text-lg group-hover:text-primary transition-colors">{project.name}</h3>
        <span className="text-xs font-mono text-primary/70">{project.category}</span>
      </div>
      <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
    </div>
    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{project.description}</p>
    <div className="flex flex-wrap gap-1.5">
      {project.tags.map((tag) => (
        <span key={tag} className="px-2 py-0.5 text-[10px] font-mono rounded-full bg-muted text-muted-foreground">
          {tag}
        </span>
      ))}
    </div>
  </a>
);

export default Ecosystem;
