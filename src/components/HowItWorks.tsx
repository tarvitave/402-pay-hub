import { ArrowDown } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Request Protected Resource",
    description: "Client makes a standard HTTP request to a protected endpoint or premium content.",
    code: `GET /api/premium-data HTTP/1.1
Host: api.example.com
Authorization: Bearer <token>`,
  },
  {
    number: "02",
    title: "Receive Payment Request",
    description: "Server responds with 402 status and payment details in headers.",
    code: `HTTP/1.1 402 Payment Required
X-Payment: lightning:lnbc100n1p...
X-Price: 0.01 USD
X-Accepts: BTC, USDC`,
  },
  {
    number: "03",
    title: "Complete Payment",
    description: "Client processes payment through supported payment rail and obtains proof.",
    code: `POST /payments/complete
{
  "invoice": "lnbc100n1p...",
  "preimage": "abc123..."
}`,
  },
  {
    number: "04",
    title: "Access Granted",
    description: "Server validates payment proof and delivers the requested resource.",
    code: `HTTP/1.1 200 OK
X-Payment-Verified: true
Content-Type: application/json

{ "data": "Premium content..." }`,
  },
];

const HowItWorks = () => {
  return (
    <section className="py-20 md:py-32 bg-secondary/30 relative">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-primary font-mono text-sm mb-4 block">PROTOCOL</span>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">
            How <span className="text-gradient-primary">x402</span> Works
          </h2>
          <p className="text-muted-foreground text-lg">
            A simple, four-step flow that turns any HTTP endpoint into a monetizable resource.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {steps.map((step, index) => (
            <div key={index}>
              <div className="border-gradient rounded-xl p-6 md:p-8">
                <div className="grid md:grid-cols-2 gap-6 items-start">
                  <div>
                    <div className="flex items-center gap-4 mb-4">
                      <span className="font-mono text-3xl font-bold text-gradient-accent">
                        {step.number}
                      </span>
                      <h3 className="font-display text-xl font-semibold">
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                  <div className="code-block overflow-x-auto">
                    <pre className="text-xs md:text-sm whitespace-pre">
                      <code>{step.code}</code>
                    </pre>
                  </div>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className="flex justify-center py-4">
                  <ArrowDown className="w-6 h-6 text-primary/50" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
