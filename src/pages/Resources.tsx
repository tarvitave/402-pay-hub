import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Newsletter from "@/components/Newsletter";
import { Button } from "@/components/ui/button";
import { Book, Code, Users, FileText, ExternalLink, Github, MessageCircle } from "lucide-react";

const resources = [
  {
    category: "Documentation",
    icon: Book,
    items: [
      { title: "Protocol Specification", description: "The complete x402 protocol specification document", link: "https://www.x402.org/" },
      { title: "Getting Started Guide", description: "Quick start guide for implementing x402", link: "https://www.x402.org/#getting-started" },
      { title: "API Reference", description: "Complete API documentation with examples", link: "https://www.x402.org/#api-reference" },
    ]
  },
  {
    category: "SDKs & Libraries",
    icon: Code,
    items: [
      { title: "x402-node", description: "Node.js SDK for x402 protocol", link: "https://github.com/coinbase/x402/tree/main/typescript", language: "JavaScript" },
      { title: "x402-python", description: "Python library for x402 implementation", link: "https://github.com/coinbase/x402/tree/main/python", language: "Python" },
      { title: "x402-go", description: "Go package for x402 protocol", link: "https://github.com/coinbase/x402/tree/main/go", language: "Go" },
      { title: "x402-rust", description: "Rust crate for x402 implementation", link: "https://github.com/coinbase/x402/tree/main/rust", language: "Rust" },
    ]
  },
  {
    category: "Community",
    icon: Users,
    items: [
      { title: "Discord Server", description: "Join developers discussing x402", link: "https://discord.gg/cdp", icon: MessageCircle },
      { title: "GitHub Organization", description: "Contribute to open source implementations", link: "https://github.com/coinbase/x402", icon: Github },
      { title: "Twitter/X", description: "Follow for protocol updates and news", link: "https://x.com/coinaboratorio" },
    ]
  },
];

const useCases = [
  {
    title: "Pay-per-API Call",
    description: "Monetize your APIs without complex billing systems. Charge per request automatically.",
    example: "AI inference endpoints, data APIs, webhooks"
  },
  {
    title: "Premium Content",
    description: "Gate articles, videos, or downloads behind instant micropayments.",
    example: "News articles, research papers, digital downloads"
  },
  {
    title: "Machine-to-Machine",
    description: "Enable AI agents and IoT devices to pay for services autonomously.",
    example: "Autonomous systems, AI workflows, sensor networks"
  },
  {
    title: "Tipping & Support",
    description: "Accept instant tips and support payments without payment processors.",
    example: "Creators, open source, podcasts"
  },
];

const Resources = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        {/* Hero */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-3xl">
            <span className="text-primary font-mono text-sm mb-4 block">RESOURCES</span>
            <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
              Everything You Need to <span className="text-gradient-primary">Build</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Documentation, SDKs, community resources, and more to help you implement x402.
            </p>
          </div>
        </section>

        {/* Resources Grid */}
        {resources.map((section, idx) => (
          <section key={idx} className="container mx-auto px-4 py-12">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <section.icon className="w-6 h-6 text-primary" />
              </div>
              <h2 className="font-display text-2xl font-bold">{section.category}</h2>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {section.items.map((item, i) => (
                <a
                  key={i}
                  href={item.link}
                  className="group border-gradient rounded-xl p-6 hover:shadow-elevated transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-display text-lg font-semibold group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    {item.description}
                  </p>
                  {'language' in item && (
                    <span className="px-2 py-1 text-xs font-mono rounded bg-secondary text-secondary-foreground">
                      {item.language}
                    </span>
                  )}
                </a>
              ))}
            </div>
          </section>
        ))}

        {/* Use Cases */}
        <section className="container mx-auto px-4 py-16">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
              <FileText className="w-6 h-6 text-accent" />
            </div>
            <h2 className="font-display text-2xl font-bold">Use Cases</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {useCases.map((useCase, i) => (
              <div key={i} className="border-gradient rounded-xl p-6">
                <h3 className="font-display text-xl font-semibold mb-3">
                  {useCase.title}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {useCase.description}
                </p>
                <p className="text-xs text-primary font-mono">
                  Examples: {useCase.example}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-4 py-16">
          <div className="border-gradient rounded-2xl p-8 md:p-12 text-center">
            <h2 className="font-display text-3xl font-bold mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Jump into our quickstart guide and have your first x402 endpoint 
              running in under 10 minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="lg">
                Read the Quickstart
              </Button>
              <Button variant="heroOutline" size="lg">
                View on GitHub
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Newsletter />
      <Footer />
    </div>
  );
};

export default Resources;
