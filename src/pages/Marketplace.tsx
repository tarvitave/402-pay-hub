import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Search, ExternalLink, Server, Shield, Zap, TrendingUp, Globe, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Resource {
  url: string;
  type: string;
  metadata?: {
    description?: string;
    input?: Record<string, unknown>;
    output?: Record<string, unknown>;
  };
}

interface BazaarData {
  resources: Resource[];
  total: number;
  hasMore: boolean;
}

const Marketplace = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('bazaar-discovery', {
        body: { limit: 100 }
      });

      if (error) throw error;

      setResources(data?.resources || []);
    } catch (err) {
      console.error('Error fetching bazaar resources:', err);
      setError('Failed to load marketplace data');
    } finally {
      setLoading(false);
    }
  };


  const filteredResources = resources.filter(resource => {
    const searchLower = searchTerm.toLowerCase();
    return (
      resource.url.toLowerCase().includes(searchLower) ||
      resource.metadata?.description?.toLowerCase().includes(searchLower)
    );
  });

  const extractDomain = (url: string) => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

  const extractEndpoint = (url: string) => {
    try {
      return new URL(url).pathname;
    } catch {
      return url;
    }
  };

  const stats = [
    { label: "Discovered APIs", value: resources.length.toString(), icon: Server },
    { label: "Protocol", value: "x402", icon: TrendingUp },
    { label: "Network", value: "Live", icon: Shield },
    { label: "Status", value: "Active", icon: Zap },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>x402 API Marketplace | Discover Pay-Per-Use HTTP 402 Enabled Services</title>
        <meta name="description" content="Browse the x402 Bazaar marketplace for cryptocurrency-payable APIs. Find AI inference endpoints, data APIs, and machine-to-machine services accepting instant micropayments." />
        <meta name="keywords" content="x402 marketplace, pay per use API directory, HTTP 402 API list, cryptocurrency API payments, AI API marketplace, micropayment enabled services, bazaar discovery" />
        <link rel="canonical" href="https://x402info.lovable.app/marketplace" />
      </Helmet>
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              x402 Bazaar Discovery
            </Badge>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              <span className="text-gradient-primary">Marketplace</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Discover payable APIs and services in the x402 network. Real-time discovery of HTTP 402 enabled endpoints.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {stats.map((stat) => (
              <Card key={stat.label} className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-4 text-center">
                  <stat.icon className="h-5 w-5 mx-auto mb-2 text-primary" />
                  <div className="font-display text-2xl font-bold">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Search */}
          <div className="relative max-w-md mx-auto mb-8">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search APIs and services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-card/50 border-border/50"
            />
          </div>

          {/* Resources Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading marketplace...</span>
            </div>
          ) : error ? (
            <div className="text-center py-20 text-muted-foreground">
              {error}
            </div>
          ) : resources.length === 0 ? (
            <div className="text-center py-20">
              <Globe className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-xl font-semibold mb-2">No APIs Discovered Yet</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                The x402 Bazaar is a new protocol. APIs will appear here as developers register their HTTP 402 payment-enabled endpoints.
              </p>
              <a 
                href="https://docs.cdp.coinbase.com/x402/bazaar" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-4 text-primary hover:underline"
              >
                Learn how to register your API <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((resource, index) => (
                <Card 
                  key={index} 
                  className="group border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 hover:shadow-lg"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <Badge variant="outline" className="text-xs font-mono">
                        {resource.type.toUpperCase()}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-primary">
                        <DollarSign className="h-3 w-3" />
                        <span>402</span>
                      </div>
                    </div>
                    <CardTitle className="text-base font-mono mt-2 truncate group-hover:text-primary transition-colors">
                      {extractEndpoint(resource.url)}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1 text-xs">
                      <Globe className="h-3 w-3" />
                      {extractDomain(resource.url)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {resource.metadata?.description || "No description available"}
                    </p>
                    
                    {resource.metadata?.input && (
                      <div className="mb-3">
                        <div className="text-xs font-medium text-foreground mb-1">Input</div>
                        <div className="flex flex-wrap gap-1">
                          {Object.keys(resource.metadata.input).slice(0, 3).map((key) => (
                            <Badge key={key} variant="secondary" className="text-xs font-mono">
                              {key}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between pt-3 border-t border-border/50">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Shield className="h-3 w-3 text-primary" />
                        <span>Verified</span>
                      </div>
                      <a 
                        href={resource.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        Explore <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {filteredResources.length === 0 && !loading && searchTerm && resources.length > 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No resources found matching "{searchTerm}"
            </div>
          )}

          {/* About x402 */}
          <div className="mt-12">
            <Card className="bg-card/50 border-border/50 p-6">
              <h2 className="font-display text-xl font-bold mb-3 flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                About x402 Bazaar
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                The x402 Bazaar is a decentralized discovery layer for HTTP 402 payment-enabled APIs. 
                It allows AI agents and applications to discover, verify, and pay for API services using cryptocurrency. 
                This page shows live data from the Coinbase CDP discovery endpoint.
              </p>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Marketplace;
