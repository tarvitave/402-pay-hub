import { Link } from "react-router-dom";
import { Zap, Github, Twitter, MessageCircle } from "lucide-react";

const Footer = () => {
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
