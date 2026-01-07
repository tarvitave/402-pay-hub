import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { RefreshCw, Mail, Users, MousePointer, AlertTriangle, CheckCircle, BarChart3, Eye, Upload, Send, FileText } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface EmailEvent {
  id: string;
  message_id: string | null;
  recipient: string;
  event_type: string;
  delivered_at: string | null;
  bounced_at: string | null;
  opened_at: string | null;
  clicked_at: string | null;
  bounce_type: string | null;
  bounce_description: string | null;
  link_clicked: string | null;
  created_at: string;
}

interface Subscriber {
  id: string;
  email: string;
  subscribed_at: string;
}

interface Stats {
  totalSubscribers: number;
  totalDelivered: number;
  totalOpened: number;
  totalClicked: number;
  totalBounced: number;
  openRate: number;
  clickRate: number;
}

interface AnalyticsData {
  date: string;
  pageviews: number;
  visitors: number;
}

interface InviteContact {
  id: string;
  name: string | null;
  email: string;
  status: string;
  invited_at: string | null;
  created_at: string;
}

interface InviteSettings {
  emails_per_hour: number;
  email_subject: string;
  email_template: string;
}

// Real analytics data from the past 30 days
const analyticsData: AnalyticsData[] = [
  { date: "Dec 08", pageviews: 0, visitors: 0 },
  { date: "Dec 09", pageviews: 0, visitors: 0 },
  { date: "Dec 10", pageviews: 0, visitors: 0 },
  { date: "Dec 11", pageviews: 0, visitors: 0 },
  { date: "Dec 12", pageviews: 0, visitors: 0 },
  { date: "Dec 13", pageviews: 0, visitors: 0 },
  { date: "Dec 14", pageviews: 0, visitors: 0 },
  { date: "Dec 15", pageviews: 0, visitors: 0 },
  { date: "Dec 16", pageviews: 0, visitors: 0 },
  { date: "Dec 17", pageviews: 0, visitors: 0 },
  { date: "Dec 18", pageviews: 0, visitors: 0 },
  { date: "Dec 19", pageviews: 0, visitors: 0 },
  { date: "Dec 20", pageviews: 0, visitors: 0 },
  { date: "Dec 21", pageviews: 0, visitors: 0 },
  { date: "Dec 22", pageviews: 0, visitors: 0 },
  { date: "Dec 23", pageviews: 0, visitors: 0 },
  { date: "Dec 24", pageviews: 0, visitors: 0 },
  { date: "Dec 25", pageviews: 0, visitors: 0 },
  { date: "Dec 26", pageviews: 0, visitors: 0 },
  { date: "Dec 27", pageviews: 0, visitors: 0 },
  { date: "Dec 28", pageviews: 0, visitors: 0 },
  { date: "Dec 29", pageviews: 0, visitors: 0 },
  { date: "Dec 30", pageviews: 0, visitors: 0 },
  { date: "Dec 31", pageviews: 0, visitors: 0 },
  { date: "Jan 01", pageviews: 0, visitors: 0 },
  { date: "Jan 02", pageviews: 0, visitors: 0 },
  { date: "Jan 03", pageviews: 0, visitors: 0 },
  { date: "Jan 04", pageviews: 0, visitors: 0 },
  { date: "Jan 05", pageviews: 0, visitors: 0 },
  { date: "Jan 06", pageviews: 79, visitors: 31 },
  { date: "Jan 07", pageviews: 4, visitors: 4 },
];

const totalPageviews = analyticsData.reduce((sum, d) => sum + d.pageviews, 0);
const totalVisitors = analyticsData.reduce((sum, d) => sum + d.visitors, 0);

const Admin = () => {
  const [events, setEvents] = useState<EmailEvent[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalSubscribers: 0,
    totalDelivered: 0,
    totalOpened: 0,
    totalClicked: 0,
    totalBounced: 0,
    openRate: 0,
    clickRate: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  
  // Email Invites state
  const [inviteContacts, setInviteContacts] = useState<InviteContact[]>([]);
  const [inviteSettings, setInviteSettings] = useState<InviteSettings>({
    emails_per_hour: 50,
    email_subject: "Join the x402 Protocol Newsletter!",
    email_template: `Hi {{name}},

You have been invited to join the x402 Protocol newsletter! Stay updated on the future of web monetization, micropayments, and the HTTP 402 protocol.

Click here to subscribe: {{subscribe_url}}

Best regards,
The x402 Protocol Team`
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch subscribers
      const { data: subscribersData, error: subscribersError } = await supabase
        .from("subscribers")
        .select("*")
        .order("subscribed_at", { ascending: false });

      if (subscribersError) throw subscribersError;
      setSubscribers(subscribersData || []);

      // Fetch email events
      const { data: eventsData, error: eventsError } = await supabase
        .from("email_events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (eventsError) throw eventsError;
      setEvents(eventsData || []);

      // Calculate stats
      const { data: statsData, error: statsError } = await supabase
        .from("email_events")
        .select("event_type");

      if (statsError) throw statsError;

      const delivered = statsData?.filter(e => e.event_type === "delivered").length || 0;
      const opened = statsData?.filter(e => e.event_type === "opened").length || 0;
      const clicked = statsData?.filter(e => e.event_type === "clicked").length || 0;
      const bounced = statsData?.filter(e => e.event_type === "bounced").length || 0;

      setStats({
        totalSubscribers: subscribersData?.length || 0,
        totalDelivered: delivered,
        totalOpened: opened,
        totalClicked: clicked,
        totalBounced: bounced,
        openRate: delivered > 0 ? Math.round((opened / delivered) * 100) : 0,
        clickRate: delivered > 0 ? Math.round((clicked / delivered) * 100) : 0,
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInviteData = async () => {
    try {
      // Fetch settings
      const settingsResponse = await supabase.functions.invoke("send-invite", {
        body: { action: "getSettings" }
      });
      
      if (settingsResponse.data && !settingsResponse.error) {
        setInviteSettings({
          emails_per_hour: settingsResponse.data.emails_per_hour,
          email_subject: settingsResponse.data.email_subject,
          email_template: settingsResponse.data.email_template
        });
      }

      // Fetch contacts
      const contactsResponse = await supabase.functions.invoke("send-invite", {
        body: { action: "getContacts" }
      });
      
      if (contactsResponse.data && !contactsResponse.error) {
        setInviteContacts(contactsResponse.data);
      }
    } catch (error) {
      console.error("Error fetching invite data:", error);
    }
  };

  const handleCsvUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const text = await file.text();
      const lines = text.split("\n").filter(line => line.trim());
      const contacts: Array<{ name?: string; email: string }> = [];

      // Skip header row if it looks like headers
      const startIndex = lines[0]?.toLowerCase().includes("email") ? 1 : 0;

      for (let i = startIndex; i < lines.length; i++) {
        const parts = lines[i].split(",").map(p => p.trim().replace(/^["']|["']$/g, ""));
        if (parts.length >= 1) {
          // Try to detect which column is email
          const emailIndex = parts.findIndex(p => p.includes("@"));
          if (emailIndex >= 0) {
            const nameIndex = emailIndex === 0 ? 1 : 0;
            contacts.push({
              email: parts[emailIndex],
              name: parts[nameIndex] || undefined
            });
          }
        }
      }

      if (contacts.length === 0) {
        toast.error("No valid email addresses found in CSV");
        return;
      }

      const response = await supabase.functions.invoke("send-invite", {
        body: { action: "upload", contacts }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      toast.success(`Added ${response.data.added} contacts, skipped ${response.data.skipped} duplicates`);
      fetchInviteData();
    } catch (error) {
      console.error("Error uploading CSV:", error);
      toast.error("Failed to upload CSV");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    try {
      const response = await supabase.functions.invoke("send-invite", {
        body: {
          action: "updateSettings",
          emailsPerHour: inviteSettings.emails_per_hour,
          emailSubject: inviteSettings.email_subject,
          emailTemplate: inviteSettings.email_template
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      toast.success("Settings saved successfully");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleSendInvites = async () => {
    const pendingCount = inviteContacts.filter(c => c.status === "pending").length;
    if (pendingCount === 0) {
      toast.error("No pending contacts to send");
      return;
    }

    setIsSending(true);
    try {
      const response = await supabase.functions.invoke("send-invite", {
        body: { action: "send" }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      toast.success(`Sent ${response.data.sent} invites${response.data.failed > 0 ? `, ${response.data.failed} failed` : ""}`);
      fetchInviteData();
    } catch (error) {
      console.error("Error sending invites:", error);
      toast.error("Failed to send invites");
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchInviteData();
  }, []);

  const getEventBadgeVariant = (eventType: string) => {
    switch (eventType) {
      case "delivered":
        return "default";
      case "opened":
        return "secondary";
      case "clicked":
        return "outline";
      case "bounced":
        return "destructive";
      default:
        return "outline";
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  const webhookUrl = `https://zzlcxauyrpclvrwrciub.supabase.co/functions/v1/postmark-webhook`;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-24">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">Track analytics, email metrics and subscriber activity</p>
          </div>
          <Button onClick={fetchData} disabled={isLoading} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="grid w-full max-w-lg grid-cols-3">
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="newsletter" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Newsletter
            </TabsTrigger>
            <TabsTrigger value="invites" className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Email Invites
            </TabsTrigger>
          </TabsList>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {/* Analytics Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <Eye className="h-8 w-8 text-primary" />
                    <div>
                      <p className="text-2xl font-bold">{totalPageviews}</p>
                      <p className="text-xs text-muted-foreground">Total Page Views</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <Users className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="text-2xl font-bold">{totalVisitors}</p>
                      <p className="text-xs text-muted-foreground">Unique Visitors</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div>
                    <p className="text-2xl font-bold">{totalVisitors > 0 ? (totalPageviews / totalVisitors).toFixed(1) : 0}</p>
                    <p className="text-xs text-muted-foreground">Pages/Visit</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div>
                    <p className="text-2xl font-bold">30</p>
                    <p className="text-xs text-muted-foreground">Days Tracked</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Page Views Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Page Views - Last 30 Days</CardTitle>
                <CardDescription>Daily page views and unique visitors</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12 }} 
                        tickLine={false}
                        axisLine={false}
                        interval={4}
                        className="text-muted-foreground"
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }} 
                        tickLine={false}
                        axisLine={false}
                        className="text-muted-foreground"
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                        labelStyle={{ color: 'hsl(var(--foreground))' }}
                      />
                      <Bar dataKey="pageviews" name="Page Views" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="visitors" name="Visitors" fill="hsl(var(--primary) / 0.5)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Traffic Sources */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Pages</CardTitle>
                  <CardDescription>Most visited pages</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">/</span>
                      <Badge variant="secondary">35 views</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Devices</CardTitle>
                  <CardDescription>Visitor device breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Desktop</span>
                      <Badge variant="secondary">26 visitors</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Mobile</span>
                      <Badge variant="secondary">9 visitors</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Newsletter Tab */}
          <TabsContent value="newsletter" className="space-y-6">
            {/* Webhook Setup Notice */}
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Postmark Webhook Setup</CardTitle>
                <CardDescription>
                  Add this URL to your Postmark account under Settings → Webhooks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <code className="block p-3 bg-secondary/50 rounded-lg text-sm break-all">
                  {webhookUrl}
                </code>
              </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <Users className="h-8 w-8 text-primary" />
                    <div>
                      <p className="text-2xl font-bold">{stats.totalSubscribers}</p>
                      <p className="text-xs text-muted-foreground">Subscribers</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                    <div>
                      <p className="text-2xl font-bold">{stats.totalDelivered}</p>
                      <p className="text-xs text-muted-foreground">Delivered</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <Mail className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="text-2xl font-bold">{stats.totalOpened}</p>
                      <p className="text-xs text-muted-foreground">Opened</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <MousePointer className="h-8 w-8 text-purple-500" />
                    <div>
                      <p className="text-2xl font-bold">{stats.totalClicked}</p>
                      <p className="text-xs text-muted-foreground">Clicked</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-8 w-8 text-destructive" />
                    <div>
                      <p className="text-2xl font-bold">{stats.totalBounced}</p>
                      <p className="text-xs text-muted-foreground">Bounced</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div>
                    <p className="text-2xl font-bold">{stats.openRate}%</p>
                    <p className="text-xs text-muted-foreground">Open Rate</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Subscribers Table */}
            <Card>
              <CardHeader>
                <CardTitle>Subscribers</CardTitle>
                <CardDescription>All newsletter subscribers</CardDescription>
              </CardHeader>
              <CardContent>
                {subscribers.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No subscribers yet</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Email</th>
                          <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Subscribed</th>
                        </tr>
                      </thead>
                      <tbody>
                        {subscribers.map((subscriber) => (
                          <tr key={subscriber.id} className="border-b last:border-0">
                            <td className="py-3 px-2">{subscriber.email}</td>
                            <td className="py-3 px-2 text-muted-foreground">{formatDate(subscriber.subscribed_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Events */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Email Events</CardTitle>
                <CardDescription>Last 50 email events from Postmark webhooks</CardDescription>
              </CardHeader>
              <CardContent>
                {events.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No events yet. Configure the Postmark webhook to start tracking.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Event</th>
                          <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Recipient</th>
                          <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Time</th>
                          <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Details</th>
                        </tr>
                      </thead>
                      <tbody>
                        {events.map((event) => (
                          <tr key={event.id} className="border-b last:border-0">
                            <td className="py-3 px-2">
                              <Badge variant={getEventBadgeVariant(event.event_type)}>
                                {event.event_type}
                              </Badge>
                            </td>
                            <td className="py-3 px-2">{event.recipient}</td>
                            <td className="py-3 px-2 text-muted-foreground">{formatDate(event.created_at)}</td>
                            <td className="py-3 px-2 text-sm text-muted-foreground">
                              {event.bounce_description || event.link_clicked || "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Email Invites Tab */}
          <TabsContent value="invites" className="space-y-6">
            {/* Upload and Send Controls */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Upload Contacts
                  </CardTitle>
                  <CardDescription>
                    Upload a CSV file with name and email columns
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv"
                      onChange={handleCsvUpload}
                      className="hidden"
                      id="csv-upload"
                    />
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      variant="outline"
                      className="w-full"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      {isUploading ? "Uploading..." : "Select CSV File"}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    CSV should have columns for name and email. Existing emails and current subscribers will be skipped.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Send className="h-5 w-5" />
                    Send Invitations
                  </CardTitle>
                  <CardDescription>
                    Send invite emails to pending contacts
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">
                        Pending: <span className="font-semibold text-foreground">{inviteContacts.filter(c => c.status === "pending").length}</span>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Sent: <span className="font-semibold text-foreground">{inviteContacts.filter(c => c.status === "sent").length}</span>
                      </p>
                    </div>
                    <Button
                      onClick={handleSendInvites}
                      disabled={isSending || inviteContacts.filter(c => c.status === "pending").length === 0}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {isSending ? "Sending..." : `Send (max ${inviteSettings.emails_per_hour}/hr)`}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Emails are sent in batches based on your rate limit setting.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Settings */}
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
                      value={inviteSettings.emails_per_hour}
                      onChange={(e) => setInviteSettings(prev => ({
                        ...prev,
                        emails_per_hour: parseInt(e.target.value) || 50
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email-subject">Email subject</Label>
                    <Input
                      id="email-subject"
                      value={inviteSettings.email_subject}
                      onChange={(e) => setInviteSettings(prev => ({
                        ...prev,
                        email_subject: e.target.value
                      }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-template">Email template</Label>
                  <Textarea
                    id="email-template"
                    value={inviteSettings.email_template}
                    onChange={(e) => setInviteSettings(prev => ({
                      ...prev,
                      email_template: e.target.value
                    }))}
                    rows={8}
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

            {/* Contacts Table */}
            <Card>
              <CardHeader>
                <CardTitle>Invite Contacts</CardTitle>
                <CardDescription>Uploaded contacts waiting to be invited or already sent</CardDescription>
              </CardHeader>
              <CardContent>
                {inviteContacts.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No contacts uploaded yet. Upload a CSV to get started.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Name</th>
                          <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Email</th>
                          <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Status</th>
                          <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Invited At</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inviteContacts.slice(0, 100).map((contact) => (
                          <tr key={contact.id} className="border-b last:border-0">
                            <td className="py-3 px-2">{contact.name || "-"}</td>
                            <td className="py-3 px-2">{contact.email}</td>
                            <td className="py-3 px-2">
                              <Badge variant={
                                contact.status === "sent" ? "default" :
                                contact.status === "failed" ? "destructive" :
                                "secondary"
                              }>
                                {contact.status}
                              </Badge>
                            </td>
                            <td className="py-3 px-2 text-muted-foreground">
                              {contact.invited_at ? formatDate(contact.invited_at) : "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {inviteContacts.length > 100 && (
                      <p className="text-sm text-muted-foreground text-center mt-4">
                        Showing first 100 of {inviteContacts.length} contacts
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default Admin;
