import { Zap, Shield, Globe, Cpu, Wallet, Code } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Instant Micropayments",
    description: "Enable sub-cent transactions without traditional payment overhead. Perfect for APIs, content, and digital services.",
  },
  {
    icon: Shield,
    title: "Native HTTP Integration",
    description: "Built directly into the HTTP protocol with the 402 status code. No complex integrations or third-party SDKs needed.",
  },
  {
    icon: Globe,
    title: "Universal Standard",
    description: "Works across any platform, language, or framework. A truly open standard for the decentralized web.",
  },
  {
    icon: Cpu,
    title: "Machine-to-Machine",
    description: "Enable autonomous payments between AI agents, IoT devices, and automated systems without human intervention.",
  },
  {
    icon: Wallet,
    title: "Multi-Currency Support",
    description: "Support for Bitcoin, stablecoins, and traditional payment rails. Let your users pay how they prefer.",
  },
  {
    icon: Code,
    title: "Developer First",
    description: "Simple REST-like semantics with comprehensive SDKs. Get started with just a few lines of code.",
  },
];

const Features = () => {
  return (
    <section className="py-20 md:py-32 bg-background relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-primary font-mono text-sm mb-4 block">WHY X402</span>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">
            Built for the <span className="text-gradient-accent">Future</span> of Payments
          </h2>
          <p className="text-muted-foreground text-lg">
            The HTTP 402 status code was reserved for "Payment Required" since 1999. 
            The x402 protocol finally brings it to life.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative border-gradient rounded-xl p-6 hover:shadow-elevated transition-all duration-300"
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
