import { Link } from "react-router-dom";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

const blogPosts = [
  {
    id: 7,
    title: "x402 Version 2: What's New in the Updated Specification",
    excerpt: "The x402 protocol has evolved. Discover the major improvements in version 2, including enhanced payment schemes and multi-currency support.",
    date: "2025-01-07",
    readTime: "7 min read",
    category: "Protocol",
  },
  {
    id: 1,
    title: "Understanding HTTP 402: The Original Vision",
    excerpt: "Dive into the history of the 402 status code and why it was reserved for future use in the original HTTP specification.",
    date: "2025-01-03",
    readTime: "5 min read",
    category: "Protocol",
  },
  {
    id: 2,
    title: "Micropayments: Solving the Internet's Original Sin",
    excerpt: "How native web payments could have prevented the ad-driven internet and what x402 means for the future of content monetization.",
    date: "2024-12-28",
    readTime: "8 min read",
    category: "Opinion",
  },
];

const BlogPreview = () => {
  return (
    <section className="py-20 md:py-32 bg-background relative">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <span className="text-primary font-mono text-sm mb-4 block">LATEST INSIGHTS</span>
            <h2 className="font-display text-3xl md:text-5xl font-bold">
              From the <span className="text-gradient-primary">Blog</span>
            </h2>
          </div>
          <Link to="/blog">
            <Button variant="outline" className="group">
              View All Posts
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.map((post) => (
            <article
              key={post.id}
              className="group border-gradient rounded-xl overflow-hidden hover:shadow-elevated transition-all duration-300"
            >
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <span className="px-3 py-1 text-xs font-mono rounded-full bg-primary/10 text-primary">
                    {post.category}
                  </span>
                </div>
                <h3 className="font-display text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                  {post.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-6 line-clamp-3">
                  {post.excerpt}
                </p>
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
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogPreview;
