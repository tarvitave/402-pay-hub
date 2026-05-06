import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Zap } from "lucide-react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/ecosystem", label: "Ecosystem", isNew: true },
    { href: "/tutorials", label: "Tutorials", isNew: true },
    { href: "/use-cases", label: "Use Cases", isNew: true },
    { href: "/compare", label: "Compare", isNew: true },
    { href: "/protocols", label: "Protocols" },
    { href: "/glossary", label: "Glossary" },
    { href: "/newsletters", label: "Newsletters" },
    { href: "/blog", label: "Blog" },
    { href: "/resources", label: "Resources" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/20 group-hover:bg-primary/30 transition-colors">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div className="absolute inset-0 rounded-lg bg-primary/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className="font-display text-xl font-bold">
              <span className="text-gradient-primary">x402</span>
              <span className="text-muted-foreground">info</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="relative text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
                {link.isNew && (
                  <span className="absolute -top-2 -right-4 text-[10px] font-bold text-primary bg-primary/10 px-1 rounded">
                    NEW
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Button asChild variant="heroOutline" size="sm">
              <a href="#newsletter">Subscribe</a>
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/50">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Button asChild variant="hero" size="sm" className="mt-2">
                <a href="#newsletter" onClick={() => setIsMenuOpen(false)}>Subscribe</a>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
