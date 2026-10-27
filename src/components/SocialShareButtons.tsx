 import { Twitter, Linkedin, Link2, Check } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import { useState } from "react";
 import { useToast } from "@/hooks/use-toast";
 
 interface SocialShareButtonsProps {
   url: string;
   title: string;
   description?: string;
 }
 
 const SocialShareButtons = ({ url, title, description }: SocialShareButtonsProps) => {
   const [copied, setCopied] = useState(false);
   const { toast } = useToast();
 
   const fullUrl = url.startsWith("http") ? url : `https://x402info.com${url}`;
   
   const shareOnTwitter = () => {
     const text = encodeURIComponent(`${title}\n\n`);
     const shareUrl = encodeURIComponent(fullUrl);
     window.open(`https://twitter.com/intent/tweet?text=${text}&url=${shareUrl}`, "_blank", "width=550,height=450");
   };
 
   const shareOnLinkedIn = () => {
     const shareUrl = encodeURIComponent(fullUrl);
     window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`, "_blank", "width=550,height=450");
   };
 
   const copyLink = async () => {
     try {
       await navigator.clipboard.writeText(fullUrl);
       setCopied(true);
       toast({
         title: "Link copied!",
         description: "The link has been copied to your clipboard.",
       });
       setTimeout(() => setCopied(false), 2000);
     } catch (err) {
       toast({
         title: "Failed to copy",
         description: "Please copy the link manually.",
         variant: "destructive",
       });
     }
   };
 
   return (
     <div className="flex items-center gap-2">
       <span className="text-sm text-muted-foreground mr-2">Share:</span>
       <Button
         variant="outline"
         size="icon"
         className="h-9 w-9"
         onClick={shareOnTwitter}
         title="Share on X (Twitter)"
       >
         <Twitter className="h-4 w-4" />
       </Button>
       <Button
         variant="outline"
         size="icon"
         className="h-9 w-9"
         onClick={shareOnLinkedIn}
         title="Share on LinkedIn"
       >
         <Linkedin className="h-4 w-4" />
       </Button>
       <Button
         variant="outline"
         size="icon"
         className="h-9 w-9"
         onClick={copyLink}
         title="Copy link"
       >
         {copied ? <Check className="h-4 w-4 text-primary" /> : <Link2 className="h-4 w-4" />}
       </Button>
     </div>
   );
 };
 
 export default SocialShareButtons;