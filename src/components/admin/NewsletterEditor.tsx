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

const CATEGORIES = ["GenAI Tools", "AI Models", "Industry News", "Tutorials", "Product Updates"];
const INDUSTRIES = ["General", "Finance", "Healthcare", "Technology", "Marketing", "E-commerce"];

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
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          New Newsletter
        </Button>
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
