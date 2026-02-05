 import { useState, useEffect } from "react";
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
 import { Button } from "@/components/ui/button";
 import { Badge } from "@/components/ui/badge";
 import { supabase } from "@/integrations/supabase/client";
 import { toast } from "sonner";
 import { Search, Check, X, Trash2, RefreshCw, AlertTriangle, Info, AlertCircle } from "lucide-react";
 import {
   Accordion,
   AccordionContent,
   AccordionItem,
   AccordionTrigger,
 } from "@/components/ui/accordion";
 
 interface SeoRecommendation {
   id: string;
   page_path: string;
   page_url: string;
   recommendation_type: string;
   current_value: string | null;
   recommended_value: string;
   priority: string;
   status: string;
   applied_at: string | null;
   created_at: string;
 }
 
 const SeoAnalyzer = () => {
   const [recommendations, setRecommendations] = useState<SeoRecommendation[]>([]);
   const [isAnalyzing, setIsAnalyzing] = useState(false);
   const [isLoading, setIsLoading] = useState(true);
 
   const fetchRecommendations = async () => {
     try {
       const { data, error } = await supabase.functions.invoke("seo-analyzer", {
         body: { action: "get" },
       });
 
       if (error) throw error;
       setRecommendations(data.recommendations || []);
     } catch (error) {
       console.error("Error fetching recommendations:", error);
       toast.error("Failed to load recommendations");
     } finally {
       setIsLoading(false);
     }
   };
 
   useEffect(() => {
     fetchRecommendations();
   }, []);
 
   const runAnalysis = async () => {
     setIsAnalyzing(true);
     try {
       const { data, error } = await supabase.functions.invoke("seo-analyzer", {
         body: { action: "analyze" },
       });
 
       if (error) throw error;
       toast.success(`Generated ${data.count} recommendations from ${data.pages} pages`);
       await fetchRecommendations();
     } catch (error: any) {
       console.error("Analysis error:", error);
       toast.error(error.message || "Analysis failed");
     } finally {
       setIsAnalyzing(false);
     }
   };
 
   const handleApprove = async (id: string) => {
     try {
       const { error } = await supabase.functions.invoke("seo-analyzer", {
         body: { action: "approve", recommendationId: id },
       });
 
       if (error) throw error;
       toast.success("Recommendation approved");
       await fetchRecommendations();
     } catch (error) {
       toast.error("Failed to approve");
     }
   };
 
   const handleReject = async (id: string) => {
     try {
       const { error } = await supabase.functions.invoke("seo-analyzer", {
         body: { action: "reject", recommendationId: id },
       });
 
       if (error) throw error;
       toast.success("Recommendation rejected");
       await fetchRecommendations();
     } catch (error) {
       toast.error("Failed to reject");
     }
   };
 
   const clearRejected = async () => {
     try {
       const { error } = await supabase.functions.invoke("seo-analyzer", {
         body: { action: "clear" },
       });
 
       if (error) throw error;
       toast.success("Cleared pending and rejected recommendations");
       await fetchRecommendations();
     } catch (error) {
       toast.error("Failed to clear");
     }
   };
 
   const getPriorityIcon = (priority: string) => {
     switch (priority) {
       case "high":
         return <AlertCircle className="h-4 w-4 text-destructive" />;
       case "medium":
         return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
       default:
         return <Info className="h-4 w-4 text-blue-500" />;
     }
   };
 
   const getPriorityBadge = (priority: string) => {
     switch (priority) {
       case "high":
         return <Badge variant="destructive">High</Badge>;
       case "medium":
         return <Badge variant="secondary">Medium</Badge>;
       default:
         return <Badge variant="outline">Low</Badge>;
     }
   };
 
   const getStatusBadge = (status: string) => {
     switch (status) {
       case "approved":
         return <Badge className="bg-emerald-600 text-emerald-50">Approved</Badge>;
       case "rejected":
         return <Badge variant="outline">Rejected</Badge>;
       default:
         return <Badge variant="secondary">Pending</Badge>;
     }
   };
 
   const getTypeLabel = (type: string) => {
     const labels: Record<string, string> = {
       title: "Title Tag",
       meta_description: "Meta Description",
       h1: "H1 Heading",
       canonical: "Canonical URL",
       og_title: "OG Title",
       og_description: "OG Description",
       images: "Image Alt Tags",
       content: "Content",
       schema: "Schema Markup",
     };
     return labels[type] || type;
   };
 
   // Group recommendations by page
   const groupedByPage = recommendations.reduce((acc, rec) => {
     if (!acc[rec.page_path]) {
       acc[rec.page_path] = [];
     }
     acc[rec.page_path].push(rec);
     return acc;
   }, {} as Record<string, SeoRecommendation[]>);
 
   const pendingCount = recommendations.filter(r => r.status === "pending").length;
   const approvedCount = recommendations.filter(r => r.status === "approved").length;
 
   return (
     <div className="space-y-6">
       {/* Header Stats */}
       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <Card>
           <CardContent className="pt-6">
             <p className="text-2xl font-bold">{recommendations.length}</p>
             <p className="text-xs text-muted-foreground">Total Recommendations</p>
           </CardContent>
         </Card>
         <Card>
           <CardContent className="pt-6">
             <p className="text-2xl font-bold">{pendingCount}</p>
             <p className="text-xs text-muted-foreground">Pending Review</p>
           </CardContent>
         </Card>
         <Card>
           <CardContent className="pt-6">
             <p className="text-2xl font-bold">{approvedCount}</p>
             <p className="text-xs text-muted-foreground">Approved</p>
           </CardContent>
         </Card>
         <Card>
           <CardContent className="pt-6">
             <p className="text-2xl font-bold">{Object.keys(groupedByPage).length}</p>
             <p className="text-xs text-muted-foreground">Pages Analyzed</p>
           </CardContent>
         </Card>
       </div>
 
       {/* Actions */}
       <div className="flex gap-2 flex-wrap">
         <Button onClick={runAnalysis} disabled={isAnalyzing}>
           {isAnalyzing ? (
             <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
           ) : (
             <Search className="h-4 w-4 mr-2" />
           )}
           {isAnalyzing ? "Analyzing..." : "Run SEO Analysis"}
         </Button>
         <Button variant="outline" onClick={fetchRecommendations} disabled={isLoading}>
           <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
           Refresh
         </Button>
         {recommendations.length > 0 && (
           <Button variant="outline" onClick={clearRejected}>
             <Trash2 className="h-4 w-4 mr-2" />
             Clear Non-Approved
           </Button>
         )}
       </div>
 
       {/* Recommendations by Page */}
       {isLoading ? (
         <Card>
           <CardContent className="py-12 text-center">
             <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
             <p className="text-muted-foreground mt-2">Loading recommendations...</p>
           </CardContent>
         </Card>
       ) : recommendations.length === 0 ? (
         <Card>
           <CardContent className="py-12 text-center">
             <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
             <p className="text-muted-foreground">No SEO recommendations yet.</p>
             <p className="text-sm text-muted-foreground mt-1">
               Click "Run SEO Analysis" to scan your pages.
             </p>
           </CardContent>
         </Card>
       ) : (
         <Accordion type="multiple" className="space-y-4">
           {Object.entries(groupedByPage).map(([pagePath, recs]) => (
             <AccordionItem key={pagePath} value={pagePath} className="border rounded-lg px-4">
               <AccordionTrigger className="hover:no-underline">
                 <div className="flex items-center gap-3">
                   <span className="font-medium">{pagePath}</span>
                   <Badge variant="outline">{recs.length} recommendations</Badge>
                   {recs.some(r => r.priority === "high" && r.status === "pending") && (
                     <Badge variant="destructive">High Priority</Badge>
                   )}
                 </div>
               </AccordionTrigger>
               <AccordionContent>
                 <div className="space-y-4 pt-2">
                   {recs.map((rec) => (
                     <Card key={rec.id} className={rec.status === "approved" ? "border-primary/50" : ""}>
                       <CardHeader className="pb-2">
                         <div className="flex items-center justify-between">
                           <div className="flex items-center gap-2">
                             {getPriorityIcon(rec.priority)}
                             <CardTitle className="text-base">{getTypeLabel(rec.recommendation_type)}</CardTitle>
                             {getPriorityBadge(rec.priority)}
                           </div>
                           {getStatusBadge(rec.status)}
                         </div>
                       </CardHeader>
                       <CardContent className="space-y-3">
                         {rec.current_value && (
                           <div>
                             <p className="text-xs text-muted-foreground mb-1">Current:</p>
                             <p className="text-sm bg-muted p-2 rounded line-through opacity-70">
                               {rec.current_value || "(empty)"}
                             </p>
                           </div>
                         )}
                         <div>
                           <p className="text-xs text-muted-foreground mb-1">Recommended:</p>
                           <p className="text-sm bg-primary/10 p-2 rounded border border-primary/20">
                             {rec.recommended_value}
                           </p>
                         </div>
                         
                         {rec.status === "pending" && (
                           <div className="flex gap-2 pt-2">
                             <Button size="sm" onClick={() => handleApprove(rec.id)}>
                               <Check className="h-4 w-4 mr-1" />
                               Approve
                             </Button>
                             <Button size="sm" variant="outline" onClick={() => handleReject(rec.id)}>
                               <X className="h-4 w-4 mr-1" />
                               Reject
                             </Button>
                           </div>
                         )}
                         
                         {rec.status === "approved" && rec.applied_at && (
                           <p className="text-xs text-primary/80">
                             Approved on {new Date(rec.applied_at).toLocaleDateString()}
                           </p>
                         )}
                       </CardContent>
                     </Card>
                   ))}
                 </div>
               </AccordionContent>
             </AccordionItem>
           ))}
         </Accordion>
       )}
 
       {/* Instructions */}
       <Card>
         <CardHeader>
           <CardTitle className="text-lg">How to Apply SEO Changes</CardTitle>
         </CardHeader>
         <CardContent className="text-sm text-muted-foreground space-y-2">
           <p>1. <strong>Run Analysis</strong> - Scans all main pages and generates AI-powered recommendations.</p>
           <p>2. <strong>Review</strong> - Check each recommendation and approve or reject based on relevance.</p>
           <p>3. <strong>Apply Changes</strong> - Approved recommendations need to be implemented in the codebase:</p>
           <ul className="list-disc list-inside ml-4 space-y-1">
             <li><strong>Title/Meta tags</strong> - Update in index.html or page components</li>
             <li><strong>H1 headings</strong> - Update in page components</li>
             <li><strong>OG tags</strong> - Update meta tags in index.html</li>
             <li><strong>Image alt tags</strong> - Add alt attributes to img elements</li>
           </ul>
         </CardContent>
       </Card>
     </div>
   );
 };
 
 export default SeoAnalyzer;