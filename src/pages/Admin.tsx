import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { RefreshCw, Mail, Users, MousePointer, AlertTriangle, CheckCircle } from "lucide-react";
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

  useEffect(() => {
    fetchData();
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
            <h1 className="text-3xl font-bold text-foreground">Newsletter Admin</h1>
            <p className="text-muted-foreground mt-1">Track email metrics and subscriber activity</p>
          </div>
          <Button onClick={fetchData} disabled={isLoading} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Webhook Setup Notice */}
        <Card className="mb-8 border-primary/20 bg-primary/5">
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
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
        <Card className="mb-8">
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
      </main>

      <Footer />
    </div>
  );
};

export default Admin;
