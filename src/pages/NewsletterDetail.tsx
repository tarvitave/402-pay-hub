import { useParams, Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Newsletter from "@/components/Newsletter";
import SocialShareButtons from "@/components/SocialShareButtons";
import { Calendar, Clock, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";

// Import newsletter images
import week01 from "@/assets/newsletter-week-01.jpg";
import week02 from "@/assets/newsletter-week-02.jpg";
import week03 from "@/assets/newsletter-week-03.jpg";
import week04 from "@/assets/newsletter-week-04.jpg";
import week05 from "@/assets/newsletter-week-05.jpg";
import week06 from "@/assets/newsletter-week-06.jpg";
import week07 from "@/assets/newsletter-week-07.jpg";
import week08 from "@/assets/newsletter-week-08.jpg";
import week09 from "@/assets/newsletter-week-09.jpg";
import week10 from "@/assets/newsletter-week-10.jpg";

const imageMap: Record<string, string> = {
  "/src/assets/newsletter-week-01.jpg": week01,
  "/src/assets/newsletter-week-02.jpg": week02,
  "/src/assets/newsletter-week-03.jpg": week03,
  "/src/assets/newsletter-week-04.jpg": week04,
  "/src/assets/newsletter-week-05.jpg": week05,
  "/src/assets/newsletter-week-06.jpg": week06,
  "/src/assets/newsletter-week-07.jpg": week07,
  "/src/assets/newsletter-week-08.jpg": week08,
  "/src/assets/newsletter-week-09.jpg": week09,
  "/src/assets/newsletter-week-10.jpg": week10,
};

const NewsletterDetail = () => {
  const { slug } = useParams();
  const location = useLocation();

  const { data: newsletter, isLoading } = useQuery({
    queryKey: ["newsletter", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("newsletters")
        .select("*")
        .eq("slug", slug)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  const getImageSrc = (heroImage: string | null) => {
    if (!heroImage) return null;
    return imageMap[heroImage] || heroImage;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-4xl mx-auto animate-pulse">
              <div className="h-8 bg-muted rounded w-1/4 mb-4" />
              <div className="h-12 bg-muted rounded w-3/4 mb-8" />
              <div className="h-64 bg-muted rounded mb-8" />
              <div className="space-y-4">
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-2/3" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!newsletter) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 py-16 text-center">
            <h1 className="text-4xl font-bold mb-4">Newsletter Not Found</h1>
            <p className="text-muted-foreground mb-8">The newsletter you're looking for doesn't exist.</p>
            <Button asChild>
              <Link to="/newsletters">Back to Newsletters</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const imageSrc = getImageSrc(newsletter.hero_image);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <article className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            {/* Back Button */}
            <Link 
              to="/newsletters" 
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Newsletters
            </Link>

            {/* Header */}
            <header className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <span className="px-3 py-1 text-xs font-mono rounded-full bg-primary/10 text-primary">
                  {newsletter.category}
                </span>
              </div>
              <h1 className="font-display text-3xl md:text-5xl font-bold mb-6">
                {newsletter.title}
              </h1>
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(newsletter.date).toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {newsletter.read_time}
                </span>
              </div>
              
              {/* Social Share Buttons */}
              <div className="mt-6">
                <SocialShareButtons 
                  url={location.pathname}
                  title={newsletter.title}
                  description={newsletter.excerpt}
                />
              </div>
            </header>

            {/* Hero Image */}
            {imageSrc && (
              <div className="relative rounded-xl overflow-hidden mb-12">
                <img 
                  src={imageSrc} 
                  alt={newsletter.title}
                  className="w-full h-auto"
                />
              </div>
            )}

            {/* Content */}
            <div className="prose prose-invert prose-lg max-w-none">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => (
                    <h1 className="font-display text-3xl font-bold mt-12 mb-6 text-foreground">{children}</h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="font-display text-2xl font-bold mt-10 mb-4 text-foreground">{children}</h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="font-display text-xl font-semibold mt-8 mb-3 text-foreground">{children}</h3>
                  ),
                  p: ({ children }) => (
                    <p className="text-muted-foreground mb-4 leading-relaxed">{children}</p>
                  ),
                  a: ({ href, children }) => (
                    <a 
                      href={href} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80 underline underline-offset-4"
                    >
                      {children}
                    </a>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside space-y-2 text-muted-foreground mb-6">{children}</ol>
                  ),
                  li: ({ children }) => (
                    <li className="text-muted-foreground">{children}</li>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-semibold text-foreground">{children}</strong>
                  ),
                  code: ({ children }) => (
                    <code className="bg-muted px-2 py-1 rounded text-sm font-mono text-primary">{children}</code>
                  ),
                  pre: ({ children }) => (
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto mb-6">{children}</pre>
                  ),
                  hr: () => (
                    <hr className="border-border my-8" />
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground my-6">
                      {children}
                    </blockquote>
                  ),
                }}
              >
                {newsletter.content}
              </ReactMarkdown>
            </div>

            {/* Bottom Share Buttons */}
            <div className="mt-12 pt-8 border-t border-border">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-muted-foreground text-sm">Enjoyed this newsletter? Share it with your network.</p>
                <SocialShareButtons 
                  url={location.pathname}
                  title={newsletter.title}
                  description={newsletter.excerpt}
                />
              </div>
            </div>
          </div>
        </article>
      </main>

      <Newsletter />
      <Footer />
    </div>
  );
};

export default NewsletterDetail;
