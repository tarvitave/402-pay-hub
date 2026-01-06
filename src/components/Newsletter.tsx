import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, ArrowRight, CheckCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-newsletter", {
        body: { email },
      });

      if (error) throw error;

      setIsSubmitted(true);
      setEmail("");
      toast({
        title: "Subscribed!",
        description: "Check your inbox for a welcome email.",
      });
    } catch (error: any) {
      console.error("Newsletter subscription error:", error);
      toast({
        title: "Subscription failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-20 md:py-32 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-8 animate-pulse-glow">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">
            Stay <span className="text-gradient-accent">Ahead</span> of the Curve
          </h2>
          
          <p className="text-muted-foreground text-lg mb-10">
            Get weekly insights on micropayments, protocol updates, and the future 
            of web monetization. Join 5,000+ developers and builders.
          </p>

          {isSubmitted ? (
            <div className="flex items-center justify-center gap-3 p-6 rounded-xl border-gradient">
              <CheckCircle className="w-6 h-6 text-primary" />
              <span className="text-lg">Thanks for subscribing! Check your inbox.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 bg-secondary border-border focus:border-primary"
                required
              />
              <Button type="submit" variant="hero" size="lg" className="shrink-0" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Subscribe
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>
          )}

          <p className="text-xs text-muted-foreground mt-6">
            No spam, ever. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
