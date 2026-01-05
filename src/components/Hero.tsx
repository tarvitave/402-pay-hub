import { Button } from "@/components/ui/button";
import { ArrowRight, Code2, Coins } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-screen hero-gradient overflow-hidden pt-16">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-primary/5 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-primary/5 rounded-full" />
      </div>

      <div className="container relative mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-fade-in">
            <span className="font-mono text-xs text-primary">HTTP 402</span>
            <span className="text-muted-foreground text-sm">Payment Required</span>
          </div>

          {/* Main Heading */}
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight animate-fade-in" style={{ animationDelay: "0.1s" }}>
            The Future of{" "}
            <span className="text-gradient-primary">Web Monetization</span>{" "}
            is Here
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Explore the x402 protocol — enabling seamless micropayments, 
            pay-per-use APIs, and the next generation of internet commerce 
            through HTTP 402.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <Button variant="hero" size="xl">
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="heroOutline" size="xl">
              Read the Docs
            </Button>
          </div>

          {/* Code Preview */}
          <div className="relative max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <div className="border-gradient rounded-xl overflow-hidden shadow-elevated">
              <div className="flex items-center gap-2 px-4 py-3 bg-secondary/50 border-b border-border">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-destructive/60" />
                  <div className="w-3 h-3 rounded-full bg-accent/60" />
                  <div className="w-3 h-3 rounded-full bg-primary/60" />
                </div>
                <span className="font-mono text-xs text-muted-foreground ml-2">HTTP Response</span>
              </div>
              <div className="code-block text-left">
                <pre className="text-sm">
                  <code>
                    <span className="text-primary">HTTP/1.1</span> <span className="text-accent">402 Payment Required</span>
                    {"\n"}
                    <span className="text-muted-foreground">X-Payment:</span> <span className="text-foreground">bitcoin:bc1q...?amount=0.0001</span>
                    {"\n"}
                    <span className="text-muted-foreground">X-Price:</span> <span className="text-foreground">0.01 USD</span>
                    {"\n"}
                    <span className="text-muted-foreground">Content-Type:</span> <span className="text-foreground">application/json</span>
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mt-20">
          {[
            { icon: Code2, label: "API Calls Daily", value: "10M+" },
            { icon: Coins, label: "Transactions", value: "$2M+" },
            { label: "Developers", value: "5,000+" },
            { label: "Integrations", value: "150+" },
          ].map((stat, index) => (
            <div
              key={index}
              className="text-center animate-fade-in"
              style={{ animationDelay: `${0.5 + index * 0.1}s` }}
            >
              <div className="font-display text-3xl md:text-4xl font-bold text-gradient-primary mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
