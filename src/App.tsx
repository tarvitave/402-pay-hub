import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PageTracker } from "@/components/PageTracker";
import Index from "./pages/Index";
import About from "./pages/About";
import Blog from "./pages/Blog";
import Resources from "./pages/Resources";
import Marketplace from "./pages/Marketplace";
import Newsletters from "./pages/Newsletters";
import NewsletterDetail from "./pages/NewsletterDetail";
import Admin from "./pages/Admin";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import AlternateProtocols from "./pages/AlternateProtocols";
import Ecosystem from "./pages/Ecosystem";
import Tutorials from "./pages/Tutorials";
import TutorialDetail from "./pages/TutorialDetail";
import UseCases from "./pages/UseCases";
import Glossary from "./pages/Glossary";
import Comparisons from "./pages/Comparisons";
import CompareDetail from "./pages/CompareDetail";
import Registry from "./pages/Registry";
import Validator from "./pages/Validator";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <PageTracker />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/newsletters" element={<Newsletters />} />
          <Route path="/newsletters/:slug" element={<NewsletterDetail />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/about" element={<About />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/protocols" element={<AlternateProtocols />} />
          <Route path="/ecosystem" element={<Ecosystem />} />
          <Route path="/tutorials" element={<Tutorials />} />
          <Route path="/tutorials/:slug" element={<TutorialDetail />} />
          <Route path="/use-cases" element={<UseCases />} />
          <Route path="/glossary" element={<Glossary />} />
          <Route path="/compare" element={<Comparisons />} />
          <Route path="/compare/:slug" element={<CompareDetail />} />
          <Route path="/registry" element={<Registry />} />
          <Route path="/validator" element={<Validator />} />
          <Route path="/terms" element={<TermsOfService />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
