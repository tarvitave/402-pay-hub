import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Newsletter from "@/components/Newsletter";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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

const Newsletters = () => {
  const { data: newsletters, isLoading } = useQuery({
    queryKey: ["newsletters-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("newsletters")
        .select("*")
        .eq("category", "Weekly Digest")
        .order("date", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const getImageSrc = (heroImage: string | null) => {
    if (!heroImage) return null;
    return imageMap[heroImage] || heroImage;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mb-12">
            <span className="text-primary font-mono text-sm mb-4 block">NEWSLETTERS</span>
            <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
              Weekly <span className="text-gradient-primary">x402 Digest</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Stay updated on protocol changes, facilitator news, new APIs, security updates, and quick integration tutorials.
            </p>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="border-gradient rounded-xl overflow-hidden animate-pulse">
                  <div className="h-48 bg-muted" />
                  <div className="p-6 space-y-4">
                    <div className="h-6 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-full" />
                    <div className="h-4 bg-muted rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {newsletters?.map((newsletter, index) => {
                const imageSrc = getImageSrc(newsletter.hero_image);
                return (
                  <Link
                    key={newsletter.id}
                    to={`/newsletters/${newsletter.slug}`}
                    className="group border-gradient rounded-xl overflow-hidden hover:shadow-elevated transition-all duration-300"
                  >
                    {imageSrc && (
                      <div className="relative h-48 overflow-hidden">
                        <img 
                          src={imageSrc} 
                          alt={newsletter.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                        {index === 0 && (
                          <span className="absolute top-4 left-4 px-3 py-1 text-xs font-mono rounded-full bg-accent/90 text-accent-foreground">
                            Latest
                          </span>
                        )}
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <span className="px-3 py-1 text-xs font-mono rounded-full bg-primary/10 text-primary">
                          {newsletter.category}
                        </span>
                      </div>
                      <h2 className="font-display text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                        {newsletter.title}
                      </h2>
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                        {newsletter.excerpt}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(newsletter.date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {newsletter.read_time}
                          </span>
                        </div>
                        <span className="text-primary text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                          Read <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <Newsletter />
      <Footer />
    </div>
  );
};

export default Newsletters;
