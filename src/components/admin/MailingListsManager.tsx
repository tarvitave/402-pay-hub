import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, Upload, Send, ChevronDown, ChevronUp, FileText, Loader2, Pause, Play, UploadCloud, Copy, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

interface MailingList {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  paused: boolean;
  stats: {
    pending: number;
    sent: number;
    failed: number;
  };
}

interface Invite {
  id: string;
  name: string | null;
  email: string;
  status: string;
  sent_at: string | null;
  created_at: string;
  list_id: string | null;
}

interface InviteSettings {
  emails_per_hour: number;
  email_subject: string;
  email_template: string;
  paused: boolean;
}

export default function MailingListsManager() {
  const [lists, setLists] = useState<MailingList[]>([]);
  const [invites, setInvites] = useState<Record<string, Invite[]>>({});
  const [expandedListId, setExpandedListId] = useState<string | null>(null);
  const [newListName, setNewListName] = useState("");
  const [newListDescription, setNewListDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingListId, setUploadingListId] = useState<string | null>(null);
  const [sendingListId, setSendingListId] = useState<string | null>(null);
  const [togglingPauseListId, setTogglingPauseListId] = useState<string | null>(null);
  const [settings, setSettings] = useState<InviteSettings>({
    emails_per_hour: 50,
    email_subject: "Join our Newsletter!",
    email_template: "Hi {{name}},\n\nYou've been invited to subscribe.\n\nClick here: {{subscribe_url}}",
    paused: false,
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isTogglingPause, setIsTogglingPause] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dropStatus, setDropStatus] = useState<string | null>(null);
  const [isDeduping, setIsDeduping] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [emailServers, setEmailServers] = useState<string[] | null>(null);
  const [suppressedCount, setSuppressedCount] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<
    "created_desc" | "created_asc" | "name_asc" | "name_desc" | "size_desc" | "size_asc"
  >("created_desc");
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const dropInputRef = useRef<HTMLInputElement | null>(null);

  const parseContacts = (text: string): Array<{ name?: string; email: string }> => {
    const lines = text.split(/\r?\n/).filter((line) => line.trim());
    const contacts: Array<{ name?: string; email: string }> = [];
    const startIndex = lines[0]?.toLowerCase().includes("email") && !lines[0].includes("@") ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
      const parts = lines[i].split(/[,;\t]/).map((p) => p.trim().replace(/^["']|["']$/g, ""));
      const emailIndex = parts.findIndex((p) => p.includes("@"));
      if (emailIndex >= 0) {
        const nameIndex = emailIndex === 0 ? 1 : 0;
        contacts.push({ email: parts[emailIndex], name: parts[nameIndex] || undefined });
      }
    }
    return contacts;
  };

  const processDroppedFiles = async (files: File[]) => {
    const csvFiles = files.filter((f) => /\.(csv|tsv|txt)$/i.test(f.name));
    if (csvFiles.length === 0) {
      toast.error("Drop CSV, TSV or TXT files with name and email columns");
      return;
    }

    const listSize = (l: MailingList) =>
      (l.stats?.pending || 0) + (l.stats?.sent || 0) + (l.stats?.failed || 0);
    const existingByName = new Map(lists.map((l) => [l.name.trim().toLowerCase(), l]));
    const importedNames = new Set<string>();

    for (const file of csvFiles) {
      const listName = file.name;
      const key = listName.trim().toLowerCase();
      const existing = existingByName.get(key);
      const isEmptyExisting = existing ? listSize(existing) === 0 : false;
      if (importedNames.has(key) || (existing && !isEmptyExisting)) {
        toast.info(`"${listName}" was already imported — skipped`);
        continue;
      }
      importedNames.add(key);
      setDropStatus(`Importing "${listName}"...`);
      try {
        const contacts = parseContacts(await file.text());
        if (contacts.length === 0) {
          toast.error(`No email addresses found in ${file.name}`);
          continue;
        }

        let listId = existing?.id;
        if (!listId) {
          const created = await supabase.functions.invoke("send-invites", {
            body: { action: "create-list", name: listName, description: `Imported from ${file.name}` },
          });
          if (created.error) throw created.error;
          listId = created.data?.id;
        }
        const uploaded = await supabase.functions.invoke("send-invites", {
          body: { action: "upload", contacts, listId },
        });
        if (uploaded.error) throw uploaded.error;

        toast.success(
          `"${listName}": added ${uploaded.data.added} contacts, skipped ${uploaded.data.skipped} duplicates`
        );
      } catch (error) {
        console.error("Error importing file:", file.name, error);
        toast.error(`Failed to import ${file.name}`);
      }
    }

    setDropStatus(null);
    fetchLists();
  };

  const fetchSuppressionStats = async () => {
    try {
      const response = await supabase.functions.invoke("send-invites", {
        body: { action: "suppression-stats" },
      });
      if (!response.error && typeof response.data?.total === "number") {
        setSuppressedCount(response.data.total);
      }
    } catch (error) {
      console.error("Error fetching suppression stats:", error);
    }
  };

  const fetchEmailServers = async () => {
    try {
      const response = await supabase.functions.invoke("send-invites", {
        body: { action: "check-email-servers" },
      });
      if (!response.error && response.data?.servers) setEmailServers(response.data.servers);
    } catch (error) {
      console.error("Error checking email servers:", error);
    }
  };

  const handleDedupeAll = async () => {
    if (!confirm("Remove duplicate emails so each address exists in only one mailing list?")) return;
    setIsDeduping(true);
    try {
      const response = await supabase.functions.invoke("send-invites", {
        body: { action: "dedupe-all" },
      });
      if (response.error) throw response.error;
      toast.success(
        `Removed ${response.data.removed} duplicates — ${response.data.unique} unique addresses remain`
      );
      fetchLists();
      setInvites({});
      if (expandedListId) fetchInvites(expandedListId);
    } catch (error) {
      console.error("Error deduplicating:", error);
      toast.error("Failed to deduplicate mailing lists");
    } finally {
      setIsDeduping(false);
    }
  };

  const handleCleanBadEmails = async () => {
    setIsCleaning(true);
    try {
      const response = await supabase.functions.invoke("send-invites", {
        body: { action: "clean-bad-emails" },
      });
      if (response.error) throw response.error;
      const d = response.data;
      toast.success(
        `Checked ${d.servers} email server(s): ${d.badEmails} bad addresses suppressed, removed ${d.removedInvites} contacts`
      );
      if (!d.usedAccountToken) {
        toast.info("Only the default email server was scanned. Add an account-level API token to scan all servers.");
      }
      fetchLists();
      setInvites({});
      if (expandedListId) fetchInvites(expandedListId);
    } catch (error) {
      console.error("Error cleaning bad emails:", error);
      toast.error("Failed to clean bad/spam emails");
    } finally {
      fetchSuppressionStats();
      setIsCleaning(false);
    }
  };

  const fetchLists = async () => {
    try {
      const response = await supabase.functions.invoke("send-invites", {
        body: { action: "get-lists" },
      });

      if (response.error) throw response.error;
      setLists(response.data || []);
    } catch (error) {
      console.error("Error fetching lists:", error);
      toast.error("Failed to fetch mailing lists");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await supabase.functions.invoke("send-invites", {
        body: { action: "get-settings" },
      });

      if (response.data && !response.error) {
        setSettings({
          emails_per_hour: response.data.emails_per_hour || 50,
          email_subject: response.data.email_subject || "Join our Newsletter!",
          email_template: response.data.email_template || "Hi {{name}},\n\nClick here: {{subscribe_url}}",
          paused: response.data.paused ?? false,
        });
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  const fetchInvites = async (listId: string) => {
    try {
      const response = await supabase.functions.invoke("send-invites", {
        body: { action: "list-invites", listId },
      });

      if (response.error) throw response.error;
      setInvites((prev) => ({ ...prev, [listId]: response.data || [] }));
    } catch (error) {
      console.error("Error fetching invites:", error);
    }
  };

  const handleCreateList = async () => {
    if (!newListName.trim()) {
      toast.error("List name is required");
      return;
    }

    setIsCreating(true);
    try {
      const response = await supabase.functions.invoke("send-invites", {
        body: { action: "create-list", name: newListName, description: newListDescription },
      });

      if (response.error) throw response.error;
      toast.success("Mailing list created");
      setNewListName("");
      setNewListDescription("");
      fetchLists();
    } catch (error) {
      console.error("Error creating list:", error);
      toast.error("Failed to create list");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteList = async (listId: string) => {
    if (!confirm("Are you sure you want to delete this list and all its contacts?")) return;

    try {
      const response = await supabase.functions.invoke("send-invites", {
        body: { action: "delete-list", listId },
      });

      if (response.error) throw response.error;
      toast.success("List deleted");
      fetchLists();
    } catch (error) {
      console.error("Error deleting list:", error);
      toast.error("Failed to delete list");
    }
  };

  const handleCsvUpload = async (listId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingListId(listId);
    try {
      const contacts = parseContacts(await file.text());

      if (contacts.length === 0) {
        toast.error("No valid email addresses found in CSV");
        return;
      }

      const response = await supabase.functions.invoke("send-invites", {
        body: { action: "upload", contacts, listId },
      });

      if (response.error) throw response.error;
      toast.success(`Added ${response.data.added} contacts, skipped ${response.data.skipped} duplicates`);
      fetchLists();
      if (expandedListId === listId) fetchInvites(listId);
    } catch (error) {
      console.error("Error uploading CSV:", error);
      toast.error("Failed to upload CSV");
    } finally {
      setUploadingListId(null);
      const input = fileInputRefs.current[listId];
      if (input) input.value = "";
    }
  };

  const handleSendBatch = async (listId: string) => {
    setSendingListId(listId);
    try {
      const response = await supabase.functions.invoke("send-invites", {
        body: { action: "send", listId },
      });

      if (response.error) throw response.error;
      
      if (response.data.sent > 0) {
        toast.success(`Sent ${response.data.sent} invites${response.data.failed > 0 ? `, ${response.data.failed} failed` : ""}`);
      } else {
        toast.info(response.data.message || "No pending contacts to send");
      }
      
      fetchLists();
      if (expandedListId === listId) fetchInvites(listId);
    } catch (error) {
      console.error("Error sending invites:", error);
      toast.error("Failed to send invites");
    } finally {
      setSendingListId(null);
    }
  };

  const handleToggleListPause = async (listId: string, currentlyPaused: boolean) => {
    setTogglingPauseListId(listId);
    try {
      const action = currentlyPaused ? "resume-list" : "pause-list";
      const response = await supabase.functions.invoke("send-invites", {
        body: { action, listId },
      });

      if (response.error) throw response.error;
      
      // Update local state
      setLists((prev) =>
        prev.map((list) =>
          list.id === listId ? { ...list, paused: !currentlyPaused } : list
        )
      );
      toast.success(currentlyPaused ? "List resumed" : "List paused");
    } catch (error) {
      console.error("Error toggling list pause:", error);
      toast.error("Failed to update list status");
    } finally {
      setTogglingPauseListId(null);
    }
  };

  const handleRemoveInvite = async (inviteId: string, listId: string) => {
    try {
      const response = await supabase.functions.invoke("send-invites", {
        body: { action: "remove", inviteId },
      });

      if (response.error) throw response.error;
      toast.success("Contact removed");
      fetchLists();
      fetchInvites(listId);
    } catch (error) {
      console.error("Error removing invite:", error);
      toast.error("Failed to remove contact");
    }
  };

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    try {
      const response = await supabase.functions.invoke("send-invites", {
        body: {
          action: "update-settings",
          emailsPerHour: settings.emails_per_hour,
          emailSubject: settings.email_subject,
          emailTemplate: settings.email_template,
        },
      });

      if (response.error) throw response.error;
      toast.success("Settings saved");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleTogglePause = async () => {
    setIsTogglingPause(true);
    try {
      const action = settings.paused ? "resume" : "pause";
      const response = await supabase.functions.invoke("send-invites", {
        body: { action },
      });

      if (response.error) throw response.error;
      setSettings((prev) => ({ ...prev, paused: !prev.paused }));
      toast.success(settings.paused ? "Email sending resumed" : "Email sending paused");
    } catch (error) {
      console.error("Error toggling pause:", error);
      toast.error("Failed to update pause status");
    } finally {
      setIsTogglingPause(false);
    }
  };

  const toggleExpand = (listId: string) => {
    if (expandedListId === listId) {
      setExpandedListId(null);
    } else {
      setExpandedListId(listId);
      if (!invites[listId]) fetchInvites(listId);
    }
  };

  useEffect(() => {
    fetchLists();
    fetchSettings();
    fetchEmailServers();
    fetchSuppressionStats();
  }, []);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString();
  };

  const sortedLists = [...lists].sort((a, b) => {
    const sizeOf = (l: MailingList) => l.stats.pending + l.stats.sent + l.stats.failed;
    switch (sortBy) {
      case "name_asc":
        return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
      case "name_desc":
        return b.name.localeCompare(a.name, undefined, { sensitivity: "base" });
      case "created_asc":
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case "size_desc":
        return sizeOf(b) - sizeOf(a);
      case "size_asc":
        return sizeOf(a) - sizeOf(b);
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Drag & drop import + list hygiene */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UploadCloud className="h-5 w-5" />
            Import Mailing Lists
          </CardTitle>
          <CardDescription>
            Drop CSV files with name and email columns — each file becomes a new mailing list named after the file.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              processDroppedFiles(Array.from(e.dataTransfer.files));
            }}
            onClick={() => dropInputRef.current?.click()}
            className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
              isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
            }`}
          >
            <input
              ref={dropInputRef}
              type="file"
              accept=".csv,.tsv,.txt"
              multiple
              className="hidden"
              onChange={(e) => {
                processDroppedFiles(Array.from(e.target.files || []));
                e.currentTarget.value = "";
              }}
            />
            {dropStatus ? (
              <div className="flex items-center justify-center gap-2 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                {dropStatus}
              </div>
            ) : (
              <>
                <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm font-medium">Drag & drop CSV files here</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Or click to browse. The file name becomes the mailing list name.
                </p>
              </>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={handleDedupeAll} disabled={isDeduping}>
              {isDeduping ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Copy className="h-4 w-4 mr-2" />}
              De-duplicate All Lists
            </Button>
            <Button variant="outline" onClick={handleCleanBadEmails} disabled={isCleaning}>
              {isCleaning ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <ShieldAlert className="h-4 w-4 mr-2" />}
              Remove Bounced & Spam Emails
            </Button>
          </div>
          {emailServers && emailServers.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Connected email servers ({emailServers.length}): {emailServers.join(", ")}
            </p>
          )}
          {suppressedCount !== null && (
            <p className="text-xs text-muted-foreground">
              Suppression list: {suppressedCount.toLocaleString()} blocked addresses (refreshed automatically every
              night at 3am UTC).
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            De-duplication keeps one copy of each address (preferring already-sent contacts). Bounce cleanup pulls
            hard bounces, spam complaints and suppressions from your email provider, stores them in the suppression
            list, and removes them everywhere. Suppressed addresses are blocked on import, on signup and at send time.
          </p>
        </CardContent>
      </Card>

      {/* Email Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Email Settings</CardTitle>
          <CardDescription>Configure the invitation email template and rate limiting</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="emails-per-hour">Emails per hour</Label>
              <Input
                id="emails-per-hour"
                type="number"
                min={1}
                max={500}
                value={settings.emails_per_hour}
                onChange={(e) => setSettings((prev) => ({ ...prev, emails_per_hour: parseInt(e.target.value) || 50 }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-subject">Email subject</Label>
              <Input
                id="email-subject"
                value={settings.email_subject}
                onChange={(e) => setSettings((prev) => ({ ...prev, email_subject: e.target.value }))}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email-template">Email template</Label>
            <Textarea
              id="email-template"
              value={settings.email_template}
              onChange={(e) => setSettings((prev) => ({ ...prev, email_template: e.target.value }))}
              rows={6}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Use {"{{name}}"} for recipient name and {"{{subscribe_url}}"} for the subscription link.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleSaveSettings} disabled={isSavingSettings}>
              {isSavingSettings ? "Saving..." : "Save Settings"}
            </Button>
            <Button 
              onClick={handleTogglePause} 
              disabled={isTogglingPause}
              variant={settings.paused ? "default" : "outline"}
            >
              {isTogglingPause ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : settings.paused ? (
                <Play className="h-4 w-4 mr-2" />
              ) : (
                <Pause className="h-4 w-4 mr-2" />
              )}
              {settings.paused ? "Resume Sending" : "Pause Sending"}
            </Button>
            {settings.paused && (
              <Badge variant="secondary" className="ml-2">
                Sending Paused
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create New List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create Mailing List
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="list-name">List Name</Label>
              <Input
                id="list-name"
                placeholder="e.g., Product Launch 2024"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="list-description">Description (optional)</Label>
              <Input
                id="list-description"
                placeholder="Brief description..."
                value={newListDescription}
                onChange={(e) => setNewListDescription(e.target.value)}
              />
            </div>
          </div>
          <Button onClick={handleCreateList} disabled={isCreating || !newListName.trim()}>
            {isCreating ? "Creating..." : "Create List"}
          </Button>
        </CardContent>
      </Card>

      {/* Lists */}
      {lists.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No mailing lists yet. Create one to get started.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground">{lists.length} mailing lists</p>
            <div className="flex items-center gap-2">
              <Label htmlFor="list-sort" className="text-xs text-muted-foreground">
                Sort by
              </Label>
              <select
                id="list-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="h-9 rounded-md border border-input bg-background px-2 text-sm"
              >
                <option value="created_desc">Newest first</option>
                <option value="created_asc">Oldest first</option>
                <option value="name_asc">Name (A–Z)</option>
                <option value="name_desc">Name (Z–A)</option>
                <option value="size_desc">Most subscribers</option>
                <option value="size_asc">Fewest subscribers</option>
              </select>
            </div>
          </div>
          {sortedLists.map((list) => (
            <Card key={list.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{list.name}</CardTitle>
                    {list.description && <CardDescription>{list.description}</CardDescription>}
                    <p className="text-xs text-muted-foreground mt-1">Created {formatDate(list.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {list.paused && <Badge variant="outline" className="text-amber-600 border-amber-600">Paused</Badge>}
                    <Badge variant="outline">
                      {(list.stats.pending + list.stats.sent + list.stats.failed).toLocaleString()} emails
                    </Badge>
                    <Badge variant="secondary">{list.stats.pending} pending</Badge>
                    <Badge variant="default">{list.stats.sent} sent</Badge>
                    {list.stats.failed > 0 && <Badge variant="destructive">{list.stats.failed} failed</Badge>}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <input
                    ref={(el) => (fileInputRefs.current[list.id] = el)}
                    type="file"
                    accept=".csv"
                    onChange={(e) => handleCsvUpload(list.id, e)}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRefs.current[list.id]?.click()}
                    disabled={uploadingListId === list.id}
                  >
                    {uploadingListId === list.id ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    Upload CSV
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSendBatch(list.id)}
                    disabled={sendingListId === list.id || list.stats.pending === 0 || list.paused}
                  >
                    {sendingListId === list.id ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Send Batch
                  </Button>
                  <Button
                    variant={list.paused ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleToggleListPause(list.id, list.paused)}
                    disabled={togglingPauseListId === list.id}
                  >
                    {togglingPauseListId === list.id ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : list.paused ? (
                      <Play className="h-4 w-4 mr-2" />
                    ) : (
                      <Pause className="h-4 w-4 mr-2" />
                    )}
                    {list.paused ? "Resume" : "Pause"}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => toggleExpand(list.id)}>
                    {expandedListId === list.id ? (
                      <ChevronUp className="h-4 w-4 mr-2" />
                    ) : (
                      <ChevronDown className="h-4 w-4 mr-2" />
                    )}
                    {expandedListId === list.id ? "Hide" : "View"} Contacts
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteList(list.id)} className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Expanded contacts list */}
                {expandedListId === list.id && (
                  <div className="border rounded-lg overflow-hidden">
                    {!invites[list.id] ? (
                      <div className="p-4 text-center text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                      </div>
                    ) : invites[list.id].length === 0 ? (
                      <div className="p-4 text-center text-muted-foreground">
                        No contacts in this list yet.
                      </div>
                    ) : (
                      <table className="w-full">
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="text-left py-2 px-3 text-sm font-medium text-muted-foreground">Name</th>
                            <th className="text-left py-2 px-3 text-sm font-medium text-muted-foreground">Email</th>
                            <th className="text-left py-2 px-3 text-sm font-medium text-muted-foreground">Status</th>
                            <th className="text-left py-2 px-3 text-sm font-medium text-muted-foreground">Sent At</th>
                            <th className="text-left py-2 px-3 text-sm font-medium text-muted-foreground"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {invites[list.id].slice(0, 50).map((invite) => (
                            <tr key={invite.id} className="border-t">
                              <td className="py-2 px-3 text-sm">{invite.name || "-"}</td>
                              <td className="py-2 px-3 text-sm">{invite.email}</td>
                              <td className="py-2 px-3">
                                <Badge
                                  variant={invite.status === "sent" ? "default" : invite.status === "failed" ? "destructive" : "secondary"}
                                >
                                  {invite.status}
                                </Badge>
                              </td>
                              <td className="py-2 px-3 text-sm text-muted-foreground">{formatDate(invite.sent_at)}</td>
                              <td className="py-2 px-3">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveInvite(invite.id, list.id)}
                                  className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                    {invites[list.id] && invites[list.id].length > 50 && (
                      <p className="text-xs text-muted-foreground text-center py-2 border-t">
                        Showing first 50 of {invites[list.id].length} contacts
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
