import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { RefreshCw, Mail, Users, MousePointer, AlertTriangle, CheckCircle, BarChart3, Eye, Send, FileText, List, Newspaper } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MailingListsManager from "@/components/admin/MailingListsManager";
import NewsletterEditor from "@/components/admin/NewsletterEditor";

interface EmailEvent {
  id: string;
  message_id: string | null;
  recipient: string;
  event_type: string;
  created_at: string;
  bounce_description: string | null;
  link_clicked: string | null;
}

interface Subscriber {
  id: string;
  email: string;
  subscribed_at: string;
  confirmed: boolean | null;
  unsubscribed_at: string | null;
}

interface AnalyticsData {
  date: string;
  formatted_date: string;
  pageviews: number;
  visitors: number;
}

interface TopPage {
  path: string;
  views: number;
}

const Admin = () => {
  const [events, setEvents] = useState<EmailEvent[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [topPages, setTopPages] = useState<TopPage[]>([]);
  const [totalPageviews, setTotalPageviews] = useState(0);
  const [totalVisitors, setTotalVisitors] = useState(0);
  const [stats, setStats] = useState({
    totalSubscribers: 0,
    confirmedSubscribers: 0,
    totalDelivered: 0,
    totalOpened: 0,
    totalClicked: 0,
    totalBounced: 0,
    openRate: 0,
    clickRate: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch subscribers
      const { data: subscribersData } = await supabase
        .from("subscribers")
        .select("*")
        .order("subscribed_at", { ascending: false });
      setSubscribers(subscribersData || []);

      // Fetch email events
      const { data: eventsData } = await supabase
        .from("email_events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      setEvents(eventsData || []);

      // Fetch stats from edge function
      const { data: adminStats } = await supabase.functions.invoke("admin-stats");
      if (adminStats) {
        setStats({
          totalSubscribers: adminStats.subscribers?.total || subscribersData?.length || 0,
          confirmedSubscribers: adminStats.subscribers?.confirmed || 0,
          totalDelivered: adminStats.emails?.delivered || 0,
          totalOpened: adminStats.emails?.opened || 0,
          totalClicked: adminStats.emails?.clicked || 0,
          totalBounced: adminStats.emails?.bounced || 0,
          openRate: adminStats.emails?.openRate || 0,
          clickRate: adminStats.emails?.clickRate || 0,
        });
      }

      // Fetch page analytics
      const { data: analyticsResult } = await supabase.functions.invoke("page-analytics", {
        body: { action: "get", days: 30 },
      });
      if (analyticsResult) {
        setAnalyticsData(analyticsResult.daily || []);
        setTopPages(analyticsResult.topPages || []);
        setTotalPageviews(analyticsResult.totals?.pageviews || 0);
        setTotalVisitors(analyticsResult.totals?.visitors || 0);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load some data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getEventBadgeVariant = (eventType: string) => {
    const type = eventType.toLowerCase();
    if (type === "delivered" || type === "delivery") return "default";
    if (type === "opened" || type === "open") return "secondary";
    if (type === "clicked" || type === "click") return "outline";
    if (type === "bounced" || type === "bounce") return "destructive";
    return "outline";
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-24">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage newsletters, subscribers, and analytics</p>
          </div>
          <Button onClick={fetchData} disabled={isLoading} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="grid w-full max-w-3xl grid-cols-6">
            <TabsTrigger value="analytics" className="flex items-center gap-1 text-xs">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="subscribers" className="flex items-center gap-1 text-xs">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Subscribers</span>
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center gap-1 text-xs">
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">Events</span>
            </TabsTrigger>
            <TabsTrigger value="invites" className="flex items-center gap-1 text-xs">
              <Send className="h-4 w-4" />
              <span className="hidden sm:inline">Invites</span>
            </TabsTrigger>
            <TabsTrigger value="lists" className="flex items-center gap-1 text-xs">
              <List className="h-4 w-4" />
              <span className="hidden sm:inline">Lists</span>
            </TabsTrigger>
            <TabsTrigger value="newsletters" className="flex items-center gap-1 text-xs">
              <Newspaper className="h-4 w-4" />
              <span className="hidden sm:inline">Newsletters</span>
            </TabsTrigger>
          </TabsList>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <Eye className="h-8 w-8 text-primary" />
                    <div>
                      <p className="text-2xl font-bold">{totalPageviews}</p>
                      <p className="text-xs text-muted-foreground">Page Views</p>
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
                      <p className="text-xs text-muted-foreground">Visitors</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-2xl font-bold">{totalVisitors > 0 ? (totalPageviews / totalVisitors).toFixed(1) : 0}</p>
                  <p className="text-xs text-muted-foreground">Pages/Visit</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-2xl font-bold">30</p>
                  <p className="text-xs text-muted-foreground">Days Tracked</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Page Views - Last 30 Days</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="formatted_date" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} interval={4} />
                      <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                      <Bar dataKey="pageviews" name="Page Views" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="visitors" name="Visitors" fill="hsl(var(--primary) / 0.5)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {topPages.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Top Pages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {topPages.map((page) => (
                      <div key={page.path} className="flex justify-between items-center">
                        <span className="text-sm">{page.path}</span>
                        <Badge variant="secondary">{page.views} views</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Subscribers Tab */}
          <TabsContent value="subscribers" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-2xl font-bold">{stats.totalSubscribers}</p>
                  <p className="text-xs text-muted-foreground">Total Subscribers</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-2xl font-bold">{stats.confirmedSubscribers}</p>
                  <p className="text-xs text-muted-foreground">Confirmed</p>
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Subscribers</CardTitle>
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
                          <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Status</th>
                          <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Subscribed</th>
                        </tr>
                      </thead>
                      <tbody>
                        {subscribers.map((sub) => (
                          <tr key={sub.id} className="border-b last:border-0">
                            <td className="py-3 px-2">{sub.email}</td>
                            <td className="py-3 px-2">
                              {sub.unsubscribed_at ? (
                                <Badge variant="destructive">Unsubscribed</Badge>
                              ) : sub.confirmed ? (
                                <Badge variant="default">Confirmed</Badge>
                              ) : (
                                <Badge variant="secondary">Pending</Badge>
                              )}
                            </td>
                            <td className="py-3 px-2 text-muted-foreground">{formatDate(sub.subscribed_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Email Events Tab */}
          <TabsContent value="events" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Card><CardContent className="pt-6"><div className="flex items-center gap-2"><CheckCircle className="h-6 w-6 text-green-500" /><div><p className="text-xl font-bold">{stats.totalDelivered}</p><p className="text-xs text-muted-foreground">Delivered</p></div></div></CardContent></Card>
              <Card><CardContent className="pt-6"><div className="flex items-center gap-2"><Mail className="h-6 w-6 text-blue-500" /><div><p className="text-xl font-bold">{stats.totalOpened}</p><p className="text-xs text-muted-foreground">Opened</p></div></div></CardContent></Card>
              <Card><CardContent className="pt-6"><div className="flex items-center gap-2"><MousePointer className="h-6 w-6 text-purple-500" /><div><p className="text-xl font-bold">{stats.totalClicked}</p><p className="text-xs text-muted-foreground">Clicked</p></div></div></CardContent></Card>
              <Card><CardContent className="pt-6"><div className="flex items-center gap-2"><AlertTriangle className="h-6 w-6 text-destructive" /><div><p className="text-xl font-bold">{stats.totalBounced}</p><p className="text-xs text-muted-foreground">Bounced</p></div></div></CardContent></Card>
              <Card><CardContent className="pt-6"><p className="text-xl font-bold">{stats.openRate}%</p><p className="text-xs text-muted-foreground">Open Rate</p></CardContent></Card>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Recent Email Events</CardTitle>
              </CardHeader>
              <CardContent>
                {events.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No events yet</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Event</th>
                          <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Recipient</th>
                          <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {events.map((event) => (
                          <tr key={event.id} className="border-b last:border-0">
                            <td className="py-3 px-2"><Badge variant={getEventBadgeVariant(event.event_type)}>{event.event_type}</Badge></td>
                            <td className="py-3 px-2">{event.recipient}</td>
                            <td className="py-3 px-2 text-muted-foreground">{formatDate(event.created_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Legacy Invites Tab - redirect to Lists */}
          <TabsContent value="invites">
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">Email invites have been moved to the Lists tab for better organization.</p>
                <Button variant="outline" onClick={() => document.querySelector<HTMLButtonElement>('[value="lists"]')?.click()}>
                  Go to Mailing Lists
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Mailing Lists Tab */}
          <TabsContent value="lists">
            <MailingListsManager />
          </TabsContent>

          {/* Newsletters Tab */}
          <TabsContent value="newsletters">
            <NewsletterEditor />
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default Admin;
