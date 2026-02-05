import { useState } from "react";
import { Link } from "react-router-dom";
import { Zap, Github, Twitter, MessageCircle, ArrowRight, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('send-newsletter', {
        body: { email },
      });

      if (error) throw error;

      if (data?.alreadySubscribed) {
        toast({
          title: "Already subscribed!",
          description: "This email is already on our mailing list.",
        });
      } else {
        toast({
          title: "You're subscribed!",
          description: "Thanks for joining our newsletter.",
        });
      }
      setEmail("");
    } catch (error: any) {
      toast({
        title: "Subscription failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const footerLinks = {
    Protocol: [
      { label: "Documentation", href: "/resources" },
      { label: "Specification", href: "/resources" },
      { label: "Implementations", href: "/resources" },
      { label: "Use Cases", href: "/about" },
    ],
    Resources: [
      { label: "Blog", href: "/blog" },
      { label: "Tutorials", href: "/blog" },
      { label: "FAQ", href: "/about" },
      { label: "Community", href: "/resources" },
    ],
    Connect: [
      { label: "GitHub", href: "#", icon: Github },
      { label: "Twitter", href: "#", icon: Twitter },
      { label: "Discord", href: "#", icon: MessageCircle },
    ],
  };

  return (
    <footer className="border-t border-border bg-card/50">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/20">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <span className="font-display text-xl font-bold">
                <span className="text-gradient-primary">x402</span>
                <span className="text-muted-foreground">info</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              Your source for everything HTTP 402 and the future of web micropayments.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-display font-semibold mb-4">{category}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                    >
                      {link.icon && <link.icon className="w-4 h-4" />}
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter Subscribe */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="font-display font-semibold mb-4">Newsletter</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Get weekly x402 updates delivered to your inbox.
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 h-9 bg-secondary/50 border-border text-sm"
                disabled={isLoading}
              />
              <Button type="submit" size="sm" disabled={isLoading} className="shrink-0 px-3">
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}
              </Button>
            </form>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} x402info. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
