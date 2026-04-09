import Navbar from "@/components/Navbar";
import { Helmet } from "react-helmet-async";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import BlogPreview from "@/components/BlogPreview";
import Sponsors from "@/components/Sponsors";
import ProtocolStats from "@/components/ProtocolStats";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>x402 Protocol | HTTP 402 Micropayments for Web APIs & AI Agents</title>
        <meta name="description" content="Implement HTTP 402 Payment Required for micropayments, pay-per-use API monetization, and machine-to-machine payments. Build stablecoin & Lightning Network integrations without complex billing." />
        <meta name="keywords" content="HTTP 402, x402 protocol, micropayments, pay per use API, API monetization, stablecoin payments, cryptocurrency micropayments, AI agent payments, web monetization" />
        <link rel="canonical" href="https://x402info.lovable.app/" />
      </Helmet>
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <BlogPreview />
      <ProtocolStats />
      <Sponsors />
      <Newsletter />
      <Footer />
    </div>
  );
};

export default Index;
