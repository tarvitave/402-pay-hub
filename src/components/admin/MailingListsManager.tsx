import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, Upload, Send, ChevronDown, ChevronUp, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface MailingList {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
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
  const [settings, setSettings] = useState<InviteSettings>({
    emails_per_hour: 50,
    email_subject: "Join our Newsletter!",
    email_template: "Hi {{name}},\n\nYou've been invited to subscribe.\n\nClick here: {{subscribe_url}}",
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

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
      const text = await file.text();
      const lines = text.split("\n").filter((line) => line.trim());
      const contacts: Array<{ name?: string; email: string }> = [];

      const startIndex = lines[0]?.toLowerCase().includes("email") ? 1 : 0;

      for (let i = startIndex; i < lines.length; i++) {
        const parts = lines[i].split(/[,\t]/).map((p) => p.trim().replace(/^["']|["']$/g, ""));
        if (parts.length >= 1) {
          const emailIndex = parts.findIndex((p) => p.includes("@"));
          if (emailIndex >= 0) {
            const nameIndex = emailIndex === 0 ? 1 : 0;
            contacts.push({
              email: parts[emailIndex],
              name: parts[nameIndex] || undefined,
            });
          }
        }
      }

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
  }, []);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
          <Button onClick={handleSaveSettings} disabled={isSavingSettings}>
            {isSavingSettings ? "Saving..." : "Save Settings"}
          </Button>
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
          {lists.map((list) => (
            <Card key={list.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{list.name}</CardTitle>
                    {list.description && <CardDescription>{list.description}</CardDescription>}
                  </div>
                  <div className="flex items-center gap-2">
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
                    disabled={sendingListId === list.id || list.stats.pending === 0}
                  >
                    {sendingListId === list.id ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Send Batch
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
