import Navbar from "@/components/Navbar";
import { Helmet } from "react-helmet-async";
import Footer from "@/components/Footer";
import Newsletter from "@/components/Newsletter";
import { Zap, History, Target, Users } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>About x402 Protocol | History of HTTP 402 Payment Required Status Code</title>
        <meta name="description" content="Discover the origin of HTTP 402 Payment Required and how x402 protocol enables native web micropayments. Learn about Lightning Network integration, stablecoin payments, and the mission to fix web monetization." />
        <meta name="keywords" content="HTTP 402 history, x402 protocol explained, web payment protocol, RFC 2616 payment required, micropayment standard, internet payment layer, web monetization alternative" />
        <link rel="canonical" href="https://x402info.lovable.app/about" />
      </Helmet>
      <Navbar />
      
      <main className="pt-24 pb-16">
        {/* Hero */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-3xl">
            <span className="text-primary font-mono text-sm mb-4 block">ABOUT X402</span>
            <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
              The <span className="text-gradient-primary">Protocol</span> for Web Payments
            </h1>
            <p className="text-xl text-muted-foreground">
              HTTP 402 was designed into the web from the beginning. We're finally making it real.
            </p>
          </div>
        </section>

        {/* History */}
        <section className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <History className="w-6 h-6 text-primary" />
                </div>
                <h2 className="font-display text-2xl font-bold">The Origin Story</h2>
              </div>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  In 1999, when HTTP/1.1 was being finalized, the architects of the web 
                  reserved status code 402 for "Payment Required" — anticipating a future 
                  where micropayments would be native to the internet.
                </p>
                <p>
                  That future never materialized. Instead, we got advertising, surveillance 
                  capitalism, and paywalls. The web's economic layer was built on the wrong 
                  foundation.
                </p>
                <p>
                  The x402 protocol revives this original vision, using modern payment 
                  technologies like Lightning Network and stablecoins to finally enable 
                  what HTTP always intended.
                </p>
              </div>
            </div>
            <div className="border-gradient rounded-xl p-8">
              <div className="code-block">
                <pre className="text-sm">
                  <code>
                    <span className="text-muted-foreground">RFC 2616 (1999)</span>
                    {"\n\n"}
                    <span className="text-accent">10.4.3 402 Payment Required</span>
                    {"\n\n"}
                    <span className="text-foreground">This code is reserved for</span>
                    {"\n"}
                    <span className="text-foreground">future use.</span>
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* Mission */}
        <section className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 border-gradient rounded-xl p-8 text-center">
              <Zap className="w-16 h-16 text-primary mx-auto mb-4" />
              <h3 className="font-display text-2xl font-bold mb-4">
                Payments as Seamless as HTTP
              </h3>
              <p className="text-muted-foreground">
                No accounts. No forms. No friction. Just value exchange 
                at the speed of the web.
              </p>
            </div>
            <div className="order-1 md:order-2">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Target className="w-6 h-6 text-accent" />
                </div>
                <h2 className="font-display text-2xl font-bold">Our Mission</h2>
              </div>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  We believe the internet should have a native economic layer that 
                  enables creators, developers, and businesses to monetize their 
                  work directly — without intermediaries.
                </p>
                <p>
                  x402info exists to educate, advocate, and accelerate the adoption 
                  of HTTP 402 as the standard for web micropayments.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h2 className="font-display text-2xl font-bold">Frequently Asked Questions</h2>
            </div>
            
            <div className="space-y-6">
              {[
                {
                  q: "What payment methods does x402 support?",
                  a: "The x402 protocol is payment-agnostic and can work with Bitcoin (on-chain and Lightning), stablecoins like USDC, and even traditional payment rails. The protocol defines how to request and verify payment, not which payment system to use."
                },
                {
                  q: "Is x402 an official HTTP standard?",
                  a: "HTTP 402 is part of the official HTTP specification. The x402 extension provides a practical implementation framework for using this status code in real applications."
                },
                {
                  q: "How do I get started implementing x402?",
                  a: "Check out our Resources section for documentation, SDKs, and tutorials. We have implementations for Node.js, Python, Go, and more popular languages."
                },
                {
                  q: "What are the fees?",
                  a: "The x402 protocol itself has no fees — it's an open standard. Transaction fees depend on which payment rail you choose to use (Lightning is often sub-cent, stablecoins vary by network)."
                }
              ].map((faq, i) => (
                <div key={i} className="border-gradient rounded-xl p-6">
                  <h3 className="font-display font-semibold mb-3">{faq.q}</h3>
                  <p className="text-muted-foreground">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Newsletter />
      <Footer />
    </div>
  );
};

export default About;
