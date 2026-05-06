import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Send, CheckCircle2 } from "lucide-react";
import { z } from "zod";

const schema = z.object({
  projectName: z.string().trim().min(2).max(120),
  url: z.string().trim().url().max(500),
  category: z.string().trim().min(2).max(50),
  description: z.string().trim().min(20).max(1000),
  contactEmail: z.string().trim().email().max(320),
});

const categories = ["Infrastructure", "DeFi", "AI Agents", "Developer Tools", "Wallets", "Analytics"];

const SubmitProjectForm = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    projectName: "",
    url: "",
    category: categories[0],
    description: "",
    contactEmail: "",
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast({
        title: "Please check the form",
        description: parsed.error.issues[0].message,
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke("submit-ecosystem-project", {
        body: parsed.data,
      });
      if (error) throw error;
      setSubmitted(true);
      toast({ title: "Submission received", description: "We'll review and get back to you." });
    } catch (err: any) {
      toast({
        title: "Submission failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-8 text-center">
        <CheckCircle2 className="h-10 w-10 text-primary mx-auto mb-3" />
        <h3 className="font-display text-xl font-semibold mb-1">Thanks for submitting!</h3>
        <p className="text-sm text-muted-foreground">
          We review submissions weekly and will email you if we need more info.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-xl border border-border bg-card p-6 md:p-8 space-y-4">
      <div className="mb-2">
        <h3 className="font-display text-2xl font-semibold mb-1">Submit your project</h3>
        <p className="text-sm text-muted-foreground">
          Building with x402? Get listed in our ecosystem directory — free.
        </p>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="projectName">Project name *</Label>
          <Input
            id="projectName"
            value={form.projectName}
            onChange={(e) => setForm({ ...form, projectName: e.target.value })}
            maxLength={120}
            required
          />
        </div>
        <div>
          <Label htmlFor="url">Project URL *</Label>
          <Input
            id="url"
            type="url"
            placeholder="https://"
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            maxLength={500}
            required
          />
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="category">Category *</Label>
          <select
            id="category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="contactEmail">Contact email *</Label>
          <Input
            id="contactEmail"
            type="email"
            value={form.contactEmail}
            onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
            maxLength={320}
            required
          />
        </div>
      </div>
      <div>
        <Label htmlFor="description">Description * (20-1000 chars)</Label>
        <Textarea
          id="description"
          rows={4}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          maxLength={1000}
          required
          placeholder="What does your project do, and how does it use x402?"
        />
      </div>
      <Button type="submit" disabled={loading} variant="hero" className="w-full md:w-auto">
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting…
          </>
        ) : (
          <>
            <Send className="h-4 w-4 mr-2" /> Submit project
          </>
        )}
      </Button>
    </form>
  );
};

export default SubmitProjectForm;