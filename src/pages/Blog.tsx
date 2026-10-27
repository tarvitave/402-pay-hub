import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Newsletter from "@/components/Newsletter";
import InlineSubscribeCTA from "@/components/InlineSubscribeCTA";
import { Calendar, Clock, ArrowRight } from "lucide-react";

const blogPosts = [
  {
    id: 7,
    slug: "x402-version-2-whats-new",
    title: "x402 Version 2: What's New in the Updated Specification",
    excerpt: "The x402 protocol has evolved. Discover the major improvements in version 2, including enhanced payment schemes, better error handling, multi-currency support, and streamlined facilitator interactions.",
    date: "2025-01-07",
    readTime: "7 min read",
    category: "Protocol",
    featured: true,
  },
  {
    id: 1,
    slug: "understanding-http-402",
    title: "Understanding HTTP 402: The Original Vision",
    excerpt: "Dive into the history of the 402 status code and why it was reserved for future use in the original HTTP specification. We explore what the web's architects intended and why it took 25 years to realize their vision.",
    date: "2025-01-03",
    readTime: "5 min read",
    category: "Protocol",
    featured: true,
  },
  {
    id: 2,
    slug: "micropayments-internets-original-sin",
    title: "Micropayments: Solving the Internet's Original Sin",
    excerpt: "How native web payments could have prevented the ad-driven internet and what x402 means for the future of content monetization. A deep dive into the economics of attention vs. transaction.",
    date: "2024-12-28",
    readTime: "8 min read",
    category: "Opinion",
    featured: true,
  },
  {
    id: 3,
    slug: "building-first-x402-api",
    title: "Building Your First x402 API Endpoint",
    excerpt: "A step-by-step tutorial on implementing payment-required endpoints using the x402 protocol with Node.js. Complete with code examples and best practices.",
    date: "2024-12-20",
    readTime: "12 min read",
    category: "Tutorial",
    featured: false,
  },
  {
    id: 4,
    slug: "ai-agents-and-micropayments",
    title: "AI Agents and Micropayments: A Perfect Match",
    excerpt: "Why autonomous AI agents need native payment capabilities and how x402 enables machine-to-machine commerce at scale.",
    date: "2024-12-15",
    readTime: "6 min read",
    category: "Future",
    featured: false,
  },
  {
    id: 5,
    slug: "comparing-payment-rails",
    title: "Comparing Payment Rails for x402",
    excerpt: "An objective comparison of Lightning Network, stablecoins, and traditional payments for implementing x402 in your application.",
    date: "2024-12-10",
    readTime: "10 min read",
    category: "Technical",
    featured: false,
  },
  {
    id: 6,
    slug: "content-monetization-without-ads",
    title: "Content Monetization Without Ads: A Reality Check",
    excerpt: "Can micropayments really replace advertising? We analyze the economics and present realistic scenarios for content creators.",
    date: "2024-12-05",
    readTime: "7 min read",
    category: "Opinion",
    featured: false,
  },
];

const Blog = () => {
  const featuredPosts = blogPosts.filter(p => p.featured);
  const regularPosts = blogPosts.filter(p => !p.featured);

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>x402 Blog | Micropayment Tutorials, API Monetization & HTTP 402 Guides</title>
        <meta name="description" content="Technical tutorials on implementing HTTP 402 micropayments, pay-per-API guides, AI agent payment integration, and web monetization strategies without advertising." />
        <meta name="keywords" content="micropayment tutorial, HTTP 402 implementation guide, pay per API tutorial, AI agent payments, web monetization blog, stablecoin integration, Lightning Network API" />
        <link rel="canonical" href="https://x402info.com/blog" />
      </Helmet>
      <Navbar />
      
      <main className="pt-24 pb-16">
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mb-12">
            <span className="text-primary font-mono text-sm mb-4 block">BLOG</span>
            <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
              Insights on <span className="text-gradient-primary">Micropayments</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Technical deep-dives, protocol updates, and the future of web monetization.
            </p>
          </div>

          {/* Featured Posts */}
          <div className="grid md:grid-cols-2 gap-6 mb-16">
            {featuredPosts.map((post) => (
              <Link
                key={post.id}
                to={`/blog/${post.slug}`}
                className="group border-gradient rounded-xl overflow-hidden hover:shadow-elevated transition-all duration-300"
              >
                <div className="p-8">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="px-3 py-1 text-xs font-mono rounded-full bg-accent/20 text-accent">
                      Featured
                    </span>
                    <span className="px-3 py-1 text-xs font-mono rounded-full bg-primary/10 text-primary">
                      {post.category}
                    </span>
                  </div>
                  <h2 className="font-display text-2xl font-semibold mb-4 group-hover:text-primary transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(post.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.readTime}
                      </span>
                    </div>
                    <span className="text-primary text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                      Read more <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Inline Subscribe CTA */}
          <div className="mb-16">
            <InlineSubscribeCTA 
              title="Never miss an article"
              description="Subscribe to get notified about new x402 tutorials, protocol updates, and developer insights."
            />
          </div>

          {/* Regular Posts */}
          <h3 className="font-display text-xl font-semibold mb-6">All Articles</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularPosts.map((post) => (
              <Link
                key={post.id}
                to={`/blog/${post.slug}`}
                className="group border-gradient rounded-xl overflow-hidden hover:shadow-elevated transition-all duration-300"
              >
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="px-3 py-1 text-xs font-mono rounded-full bg-primary/10 text-primary">
                      {post.category}
                    </span>
                  </div>
                  <h3 className="font-display text-lg font-semibold mb-3 group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(post.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric'
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.readTime}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <Newsletter />
      <Footer />
    </div>
  );
};

export default Blog;
