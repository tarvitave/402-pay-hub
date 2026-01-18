import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit, Trash2, Save, X, Loader2, Send, Calendar, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface Newsletter {
  id: number;
  slug: string;
  title: string;
  date: string;
  month: string;
  read_time: string;
  category: string;
  industry: string;
  excerpt: string;
  content: string;
  hero_image: string | null;
  scheduled_at: string | null;
  sent_at: string | null;
  created_at: string;
}

const CATEGORIES = ["GenAI Tools", "AI Models", "Industry News", "Tutorials", "Product Updates", "Weekly Digest"];
const INDUSTRIES = ["General", "Finance", "Healthcare", "Technology", "Marketing", "E-commerce"];

const SPONSORS = [
  {
    name: "OSVue.com",
    url: "https://osvue.com",
    description: "OSVue is your go-to platform for discovering and exploring open-source projects. Find the best tools, libraries, and frameworks curated for developers who value transparency and community-driven innovation."
  },
  {
    name: "WheelOfPopups.com",
    url: "https://wheelofpopups.com",
    description: "WheelOfPopups transforms boring exit popups into engaging gamified experiences. Spin-to-win wheels, scratch cards, and slot machines that boost conversions by up to 30% while delighting your visitors."
  },
  {
    name: "RaffleSelect.com",
    url: "https://raffleselect.com",
    description: "RaffleSelect makes running giveaways and contests effortless. From social media raffles to email list growth campaigns, our platform handles entries, winner selection, and compliance—so you can focus on engagement."
  },
  {
    name: "Phlorin.com",
    url: "https://phlorin.com",
    description: "Phlorin is the next-generation payment orchestration layer for web3 commerce. Seamlessly accept crypto payments, manage multi-chain transactions, and integrate with existing payment infrastructure."
  },
  {
    name: "NoCodeAPI.com",
    url: "https://nocodeapi.com",
    description: "NoCodeAPI connects your favorite apps without writing code. Build powerful automations with 200+ integrations including Google Sheets, Airtable, Notion, and more. Perfect for makers who ship fast."
  }
];

const getWeeklyTemplate = (weekNumber: number) => {
  const sponsor = SPONSORS[weekNumber % SPONSORS.length];
  
  return `# x402 Protocol Weekly Digest

*Your weekly roundup of HTTP 402 protocol developments, integrations, and the future of machine-to-machine payments.*

---

## 🔴 Status 402
**For Developers: Breaking spec changes & SDK updates**

[Write about the latest HTTP 402 specification changes, breaking changes in SDKs, and important updates developers need to know about this week.]

---

## 🏦 The Clearing House
**For Fintech/DeFi: Facilitator news from Base, Solana, Avalanche**

[Cover news from payment facilitators across different chains. Include updates from Base, Solana, Avalanche, and other networks supporting x402 payments.]

---

## 🛒 Agent Shopping
**For ListBuilders: New APIs and services accepting x402**

[Highlight new APIs, services, and platforms that have started accepting x402 payments. Great for builders looking to integrate new capabilities into their AI agents.]

---

## 🛡️ Reputation & Safety
**For Founders: ERC-8004, agent identity, and security**

[Discuss developments in agent identity standards like ERC-8004, security best practices, reputation systems, and trust frameworks for autonomous agents.]

---

## ⚡ The 1-Line Integration
**For Vibe Coders: Fast, vibe-first implementation tutorials**

\`\`\`javascript
// This week's quick win:
// [Add a simple, copy-paste code snippet here]
\`\`\`

[Brief explanation of what this code does and how to use it in your project.]

---

## 📰 Also Worth Reading

Check out the **[AllDayAL Newsletter](https://alldayal.com)** for daily AI insights, tool reviews, and productivity tips for busy professionals. Subscribe to stay ahead of the curve!

---

## 💎 This Week's Sponsor: ${sponsor.name}

[![${sponsor.name}](${sponsor.url})](${sponsor.url})

${sponsor.description}

**[Check out ${sponsor.name} →](${sponsor.url})**

---

*Thanks for reading the x402 Protocol Weekly Digest. Forward this to a friend who's building the future of autonomous commerce!*

[Subscribe](https://x402info.com/#newsletter) | [Unsubscribe](#unsubscribe)
`;
};

const getNextWeekNumber = () => {
  const startOfYear = new Date(new Date().getFullYear(), 0, 1);
  const today = new Date();
  const daysSinceStart = Math.floor((today.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
  return Math.ceil(daysSinceStart / 7);
};

export default function NewsletterEditor() {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState({
    title: "",
    date: new Date().toISOString().split("T")[0],
    read_time: "8 min read",
    category: "GenAI Tools",
    industry: "General",
    excerpt: "",
    content: "",
    hero_image: "",
  });

  const fetchNewsletters = async () => {
    try {
      const { data, error } = await supabase
        .from("newsletters")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setNewsletters(data || []);
    } catch (error) {
      console.error("Error fetching newsletters:", error);
      toast.error("Failed to fetch newsletters");
    } finally {
      setIsLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const formatMonth = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const handleCreate = () => {
    setIsCreating(true);
    setEditingId(null);
    setForm({
      title: "",
      date: new Date().toISOString().split("T")[0],
      read_time: "8 min read",
      category: "GenAI Tools",
      industry: "General",
      excerpt: "",
      content: "",
      hero_image: "",
    });
  };

  const handleUseWeeklyTemplate = () => {
    const weekNumber = getNextWeekNumber();
    const today = new Date();
    const dateStr = today.toISOString().split("T")[0];
    
    setIsCreating(true);
    setEditingId(null);
    setForm({
      title: `x402 Protocol Weekly Digest - Week ${weekNumber}`,
      date: dateStr,
      read_time: "10 min read",
      category: "Weekly Digest",
      industry: "Technology",
      excerpt: `Your weekly roundup of HTTP 402 protocol developments, integrations, and the future of machine-to-machine payments. Week ${weekNumber} edition.`,
      content: getWeeklyTemplate(weekNumber),
      hero_image: "",
    });
  };

  const handleEdit = (newsletter: Newsletter) => {
    setEditingId(newsletter.id);
    setIsCreating(false);
    setForm({
      title: newsletter.title,
      date: newsletter.date,
      read_time: newsletter.read_time,
      category: newsletter.category,
      industry: newsletter.industry,
      excerpt: newsletter.excerpt,
      content: newsletter.content,
      hero_image: newsletter.hero_image || "",
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsCreating(false);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.excerpt.trim() || !form.content.trim()) {
      toast.error("Title, excerpt, and content are required");
      return;
    }

    setIsSaving(true);
    try {
      const slug = generateSlug(form.title);
      const month = formatMonth(form.date);

      const newsletterData = {
        slug,
        title: form.title,
        date: form.date,
        month,
        read_time: form.read_time,
        category: form.category,
        industry: form.industry,
        excerpt: form.excerpt,
        content: form.content,
        hero_image: form.hero_image || null,
      };

      if (isCreating) {
        const { error } = await supabase.from("newsletters").insert(newsletterData);
        if (error) throw error;
        toast.success("Newsletter created");
      } else if (editingId) {
        const { error } = await supabase.from("newsletters").update(newsletterData).eq("id", editingId);
        if (error) throw error;
        toast.success("Newsletter updated");
      }

      handleCancel();
      fetchNewsletters();
    } catch (error) {
      console.error("Error saving newsletter:", error);
      toast.error("Failed to save newsletter");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this newsletter?")) return;

    try {
      const { error } = await supabase.from("newsletters").delete().eq("id", id);
      if (error) throw error;
      toast.success("Newsletter deleted");
      fetchNewsletters();
    } catch (error) {
      console.error("Error deleting newsletter:", error);
      toast.error("Failed to delete newsletter");
    }
  };

  useEffect(() => {
    fetchNewsletters();
  }, []);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Editor view
  if (isCreating || editingId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{isCreating ? "Create Newsletter" : "Edit Newsletter"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Newsletter title..."
              />
              <p className="text-xs text-muted-foreground">Slug: {generateSlug(form.title) || "(auto-generated)"}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={form.date}
                onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">Month: {formatMonth(form.date)}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={form.category} onValueChange={(value) => setForm((prev) => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Select value={form.industry} onValueChange={(value) => setForm((prev) => ({ ...prev, industry: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map((ind) => (
                    <SelectItem key={ind} value={ind}>
                      {ind}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="read_time">Read Time</Label>
              <Input
                id="read_time"
                value={form.read_time}
                onChange={(e) => setForm((prev) => ({ ...prev, read_time: e.target.value }))}
                placeholder="8 min read"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hero_image">Hero Image URL (optional)</Label>
            <Input
              id="hero_image"
              value={form.hero_image}
              onChange={(e) => setForm((prev) => ({ ...prev, hero_image: e.target.value }))}
              placeholder="https://..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              value={form.excerpt}
              onChange={(e) => setForm((prev) => ({ ...prev, excerpt: e.target.value }))}
              rows={2}
              placeholder="Brief summary..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content (Markdown)</Label>
            <Textarea
              id="content"
              value={form.content}
              onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
              rows={12}
              className="font-mono text-sm"
              placeholder="Write your newsletter content here..."
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Save
            </Button>
            <Button variant="outline" onClick={handleCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // List view
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Newsletters</h3>
          <p className="text-sm text-muted-foreground">{newsletters.length} newsletters</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleUseWeeklyTemplate}>
            <Calendar className="h-4 w-4 mr-2" />
            Weekly Template
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            New Newsletter
          </Button>
        </div>
      </div>

      {newsletters.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No newsletters yet. Create one to get started.
          </CardContent>
        </Card>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Title</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Category</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground"></th>
              </tr>
            </thead>
            <tbody>
              {newsletters.map((newsletter) => (
                <tr key={newsletter.id} className="border-t">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium">{newsletter.title}</p>
                      <p className="text-xs text-muted-foreground">/{newsletter.slug}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm">{formatDate(newsletter.date)}</td>
                  <td className="py-3 px-4">
                    <Badge variant="secondary">{newsletter.category}</Badge>
                  </td>
                  <td className="py-3 px-4">
                    {newsletter.sent_at ? (
                      <Badge variant="default">Sent</Badge>
                    ) : newsletter.scheduled_at ? (
                      <Badge variant="outline">Scheduled</Badge>
                    ) : (
                      <Badge variant="secondary">Draft</Badge>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(newsletter)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(newsletter.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
