import { ExternalLink } from "lucide-react";
import osvueLogo from "@/assets/sponsor-osvue.png";
import nocodeapiLogo from "@/assets/sponsor-nocodeapi.png";

const sponsors = [
  {
    name: "OSVue",
    logo: osvueLogo,
    description: "Empowering the Vue.js ecosystem through open-source innovation. Discover tools, libraries, and boilerplate templates to accelerate your Vue development.",
    link: "https://osvue.com",
    tier: "primary",
  },
  {
    name: "NoCodeAPI",
    logo: nocodeapiLogo,
    description: "The easiest way to connect APIs without code. Connect to 50+ third-party apps like Google Sheets, Airtable, and Stripe without any backend.",
    link: "https://nocodeapi.com",
    tier: "primary",
  },
];

const Sponsors = () => {
  return (
    <section className="py-16 md:py-24 bg-muted/30 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="text-primary font-mono text-sm mb-4 block">SPONSORS</span>
          <h2 className="font-display text-2xl md:text-4xl font-bold mb-4">
            Supported by <span className="text-gradient-primary">Industry Leaders</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            x402 is made possible by the generous support of these amazing companies.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {sponsors.map((sponsor) => (
            <a
              key={sponsor.name}
              href={sponsor.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group border-gradient rounded-xl p-6 hover:shadow-elevated transition-all duration-300 flex flex-col items-center text-center"
            >
              <div className="w-20 h-20 mb-4 rounded-xl overflow-hidden bg-background flex items-center justify-center p-2">
                <img
                  src={sponsor.logo}
                  alt={`${sponsor.name} logo`}
                  className="w-full h-full object-contain"
                />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2 group-hover:text-primary transition-colors flex items-center gap-2">
                {sponsor.name}
                <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-muted-foreground text-sm">
                {sponsor.description}
              </p>
            </a>
          ))}
        </div>

        <div className="text-center mt-10">
          <p className="text-muted-foreground text-sm">
            Interested in sponsoring x402?{" "}
            <a href="mailto:sponsors@x402.info" className="text-primary hover:underline">
              Get in touch
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Sponsors;
