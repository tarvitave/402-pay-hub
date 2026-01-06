import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-24 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">Last updated: January 6, 2026</p>

        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing and using x402info ("the Website"), you accept and agree to be bound by 
              these Terms of Service. If you do not agree to these terms, please do not use our Website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
            <p className="text-muted-foreground leading-relaxed">
              x402info provides information, resources, and educational content about the HTTP 402 
              protocol and web micropayments. We also offer a newsletter subscription service to 
              keep you updated on protocol developments.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. User Responsibilities</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              When using our Website, you agree to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Provide accurate information when subscribing to our newsletter</li>
              <li>Use the Website only for lawful purposes</li>
              <li>Not attempt to gain unauthorized access to any part of the Website</li>
              <li>Not use the Website to transmit harmful code or malware</li>
              <li>Respect the intellectual property rights of others</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed">
              All content on this Website, including text, graphics, logos, and software, is the 
              property of x402info or its content suppliers and is protected by intellectual property 
              laws. You may not reproduce, distribute, or create derivative works without our permission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Newsletter Subscription</h2>
            <p className="text-muted-foreground leading-relaxed">
              By subscribing to our newsletter, you consent to receive periodic emails about the x402 
              protocol, updates, and related content. You can unsubscribe at any time using the link 
              provided in each email.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Disclaimer of Warranties</h2>
            <p className="text-muted-foreground leading-relaxed">
              The Website and its content are provided "as is" without warranties of any kind, either 
              express or implied. We do not warrant that the Website will be uninterrupted, error-free, 
              or free of viruses or other harmful components.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              To the fullest extent permitted by law, x402info shall not be liable for any indirect, 
              incidental, special, consequential, or punitive damages arising from your use of the 
              Website or any content therein.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Third-Party Links</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our Website may contain links to third-party websites. We are not responsible for the 
              content, privacy policies, or practices of any third-party sites. We encourage you to 
              review the terms and policies of any linked websites.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Modifications to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify these Terms of Service at any time. Changes will be 
              effective immediately upon posting on the Website. Your continued use of the Website 
              after changes constitutes acceptance of the modified terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Governing Law</h2>
            <p className="text-muted-foreground leading-relaxed">
              These Terms of Service shall be governed by and construed in accordance with applicable 
              laws, without regard to conflict of law principles.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Contact Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about these Terms of Service, please contact us at legal@x402info.com.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TermsOfService;
