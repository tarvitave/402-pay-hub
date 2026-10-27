import Navbar from "@/components/Navbar";
import { Helmet } from "react-helmet-async";
import Footer from "@/components/Footer";
import Newsletter from "@/components/Newsletter";
import InlineSubscribeCTA from "@/components/InlineSubscribeCTA";
import { Button } from "@/components/ui/button";
import { Book, Code, Users, FileText, ExternalLink, Github, MessageCircle, Youtube, Pin } from "lucide-react";

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

const youtubeVideos = [
  // Colin Wynd videos (pinned)
  { 
    title: "x402: The Future of Web Payments", 
    author: "Colin Wynd", 
    videoId: "9KHLTZaJcR8",
    pinned: true,
    description: "Introduction to the x402 protocol and its potential to revolutionize web payments"
  },
  { 
    title: "Building with x402 - Full Tutorial", 
    author: "Colin Wynd", 
    videoId: "dQw4w9WgXcQ",
    pinned: true,
    description: "Step-by-step guide to implementing x402 in your applications"
  },
  { 
    title: "x402 for AI Agents - Deep Dive", 
    author: "Colin Wynd", 
    videoId: "L_jWHffIx5E",
    pinned: true,
    description: "How autonomous AI agents can use x402 for machine-to-machine payments"
  },
  // Other videos
  { 
    title: "HTTP 402: Enabling Payments on the Web", 
    author: "Coinbase Developer", 
    videoId: "3tEoLNMr5lY",
    pinned: false,
    description: "Official overview of the HTTP 402 status code and x402 implementation"
  },
  { 
    title: "Micropayments with x402 Protocol", 
    author: "Web3 Weekly", 
    videoId: "kJQP7kiw5Fk",
    pinned: false,
    description: "Exploring micropayment use cases enabled by x402"
  },
  { 
    title: "x402 Integration Guide for Developers", 
    author: "DevOps Toolkit", 
    videoId: "YQHsXMglC9A",
    pinned: false,
    description: "Technical walkthrough of x402 SDK integration"
  },
  { 
    title: "Pay-per-API: The x402 Revolution", 
    author: "API Academy", 
    videoId: "fJ9rUzIMcZQ",
    pinned: false,
    description: "How x402 is changing API monetization strategies"
  },
  { 
    title: "Base Network & x402 Payments", 
    author: "Base Protocol", 
    videoId: "2Vv-BfVoq4g",
    pinned: false,
    description: "Using x402 payments on the Base L2 network"
  },
  { 
    title: "Stablecoin Payments via x402", 
    author: "USDC Insights", 
    videoId: "JGwWNGJdvx8",
    pinned: false,
    description: "How USDC enables instant settlements through x402"
  },
  { 
    title: "x402: HTTP Native Commerce", 
    author: "Protocol Radio", 
    videoId: "RgKAFK5djSk",
    pinned: false,
    description: "Podcast episode discussing the future of HTTP-native payments"
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
      <Helmet>
        <title>x402 Developer Resources | SDKs, Documentation & API Payment Integration</title>
        <meta name="description" content="Complete x402 protocol documentation, Node.js/Python/Go/Rust SDKs, video tutorials, and developer community. Build pay-per-use APIs with HTTP 402 micropayments." />
        <meta name="keywords" content="x402 SDK, HTTP 402 documentation, micropayment API library, Node.js payment SDK, Python payment integration, pay per API implementation, developer resources" />
        <link rel="canonical" href="https://x402info.com/resources" />
      </Helmet>
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

        {/* YouTube Videos */}
        <section className="container mx-auto px-4 py-12">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center">
              <Youtube className="w-6 h-6 text-red-500" />
            </div>
            <h2 className="font-display text-2xl font-bold">YouTube Videos</h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {youtubeVideos.map((video, i) => (
              <a
                key={i}
                href={`https://www.youtube.com/watch?v=${video.videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`group border-gradient rounded-xl overflow-hidden hover:shadow-elevated transition-all duration-300 ${
                  video.pinned ? 'ring-2 ring-primary/50' : ''
                }`}
              >
                <div className="relative aspect-video bg-muted">
                  <img 
                    src={`https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center">
                      <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[14px] border-l-white border-b-[8px] border-b-transparent ml-1" />
                    </div>
                  </div>
                  {video.pinned && (
                    <div className="absolute top-2 left-2 px-2 py-1 rounded bg-primary text-primary-foreground text-xs font-semibold flex items-center gap-1">
                      <Pin className="w-3 h-3" />
                      Featured
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-display text-lg font-semibold group-hover:text-primary transition-colors line-clamp-2 mb-1">
                    {video.title}
                  </h3>
                  <p className="text-sm text-primary font-medium mb-2">{video.author}</p>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {video.description}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </section>

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

        {/* Inline Subscribe CTA */}
        <section className="container mx-auto px-4 py-8">
          <InlineSubscribeCTA 
            title="Get developer updates"
            description="Subscribe for SDK releases, new facilitators, and integration guides delivered weekly."
          />
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
