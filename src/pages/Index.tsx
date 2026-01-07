import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import BlogPreview from "@/components/BlogPreview";
import Sponsors from "@/components/Sponsors";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <BlogPreview />
      <Sponsors />
      <Newsletter />
      <Footer />
    </div>
  );
};

export default Index;
