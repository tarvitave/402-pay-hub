 import { useState } from "react";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { ArrowRight, Loader2, Mail } from "lucide-react";
 import { supabase } from "@/integrations/supabase/client";
 import { useToast } from "@/hooks/use-toast";
 
 interface InlineSubscribeCTAProps {
   variant?: "default" | "compact";
   title?: string;
   description?: string;
 }
 
 const InlineSubscribeCTA = ({ 
   variant = "default",
   title = "Stay in the loop",
   description = "Get the latest x402 protocol updates, tutorials, and news delivered to your inbox."
 }: InlineSubscribeCTAProps) => {
   const [email, setEmail] = useState("");
   const [isLoading, setIsLoading] = useState(false);
   const { toast } = useToast();
 
   const handleSubscribe = async (e: React.FormEvent) => {
     e.preventDefault();
     
     if (!email) {
       toast({
         title: "Email required",
         description: "Please enter your email address.",
         variant: "destructive",
       });
       return;
     }
 
     setIsLoading(true);
     
     try {
       const { data, error } = await supabase.functions.invoke('send-newsletter', {
         body: { email },
       });
 
       if (error) throw error;
 
       if (data?.alreadySubscribed) {
         toast({
           title: "Already subscribed!",
           description: "This email is already on our mailing list.",
         });
       } else {
         toast({
           title: "You're subscribed!",
           description: "Thanks for joining our newsletter.",
         });
       }
       setEmail("");
     } catch (error: any) {
       console.error("Subscription error:", error);
       toast({
         title: "Subscription failed",
         description: error.message || "Please try again later.",
         variant: "destructive",
       });
     } finally {
       setIsLoading(false);
     }
   };
 
   if (variant === "compact") {
     return (
       <form onSubmit={handleSubscribe} className="flex gap-2">
         <Input
           type="email"
           placeholder="Enter your email"
           value={email}
           onChange={(e) => setEmail(e.target.value)}
           className="flex-1 h-10 bg-secondary/50 border-border text-sm"
           disabled={isLoading}
         />
         <Button type="submit" size="sm" disabled={isLoading} className="shrink-0">
           {isLoading ? (
             <Loader2 className="h-4 w-4 animate-spin" />
           ) : (
             <ArrowRight className="h-4 w-4" />
           )}
         </Button>
       </form>
     );
   }
 
   return (
     <div className="border-gradient rounded-xl p-6 md:p-8 bg-primary/5">
       <div className="flex items-start gap-4">
         <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
           <Mail className="w-5 h-5 text-primary" />
         </div>
         <div className="flex-1">
           <h3 className="font-display text-lg font-semibold mb-1">{title}</h3>
           <p className="text-sm text-muted-foreground mb-4">{description}</p>
           <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
             <Input
               type="email"
               placeholder="Enter your email"
               value={email}
               onChange={(e) => setEmail(e.target.value)}
               className="flex-1 h-10 bg-background border-border"
               disabled={isLoading}
             />
             <Button type="submit" disabled={isLoading} className="shrink-0">
               {isLoading ? (
                 <Loader2 className="h-4 w-4 animate-spin" />
               ) : (
                 <>
                   Subscribe
                   <ArrowRight className="ml-2 h-4 w-4" />
                 </>
               )}
             </Button>
           </form>
         </div>
       </div>
     </div>
   );
 };
 
 export default InlineSubscribeCTA;