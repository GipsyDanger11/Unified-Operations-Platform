import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/react-app/components/ui/card";
import { Calendar, MessageSquare, FileText, Package, TrendingUp, AlertTriangle, Loader2, X, LayoutDashboard } from "lucide-react";
import { toast } from "react-toastify";
import { api } from "@/react-app/lib/api";
import { Link } from "react-router";
import { Button } from "@/react-app/components/ui/button";

interface DashboardMetrics {
  bookings: {
    today: number;
    upcoming: number;
  };
  messages: {
    unread: number;
  };
  forms: {
    pending: number;
    overdue: number;
  };
  inventory: {
    lowStock: number;
    critical: number;
  };
  contacts: {
    newThisWeek: number;
  };
}

interface DashboardAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  link: string;
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [alerts, setAlerts] = useState<DashboardAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [recentConversations, setRecentConversations] = useState<any[]>([]);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [metricsData, alertsWrapper, conversationsData, meData] = await Promise.all([
          api.getDashboardMetrics(),
          api.getDashboardAlerts(),
          api.getConversations(),
          api.getMe()
        ]);
        setMetrics(metricsData);
        setAlerts(alertsWrapper.alerts || []);
        setRecentConversations(conversationsData.conversations ? conversationsData.conversations.slice(0, 5) : []);
        setWorkspaceId(meData.workspace?.id);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDismiss = async (id: string) => {
    try {
      setAlerts(prev => prev.filter(a => a.id !== id));
      await api.dismissAlert(id);
      toast.success("Alert dismissed");
    } catch (error) {
      console.error("Failed to dismiss alert:", error);
      toast.error("Failed to dismiss alert");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Link copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  const baseUrl = window.location.origin;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-purple-950">Dashboard</h1>
          <p className="text-purple-700 mt-1">Here's what's happening today.</p>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<Calendar className="w-5 h-5" />}
          label="Today's Bookings"
          value={metrics?.bookings.today.toString() || "0"}
          change={`+${metrics?.bookings.upcoming || 0} upcoming`}
          trend="neutral"
        />
        <StatCard
          icon={<MessageSquare className="w-5 h-5" />}
          label="Unread Messages"
          value={metrics?.messages.unread.toString() || "0"}
          change={`${metrics?.contacts.newThisWeek || 0} new contacts`}
          trend="neutral"
        />
        <StatCard
          icon={<FileText className="w-5 h-5" />}
          label="Pending Forms"
          value={metrics?.forms.pending.toString() || "0"}
          change={`${metrics?.forms.overdue || 0} overdue`}
          trend={metrics?.forms.overdue ? "down" : "neutral"}
        />
        <StatCard
          icon={<Package className="w-5 h-5" />}
          label="Low Stock Items"
          value={metrics?.inventory.lowStock.toString() || "0"}
          change={metrics?.inventory.critical ? `${metrics.inventory.critical} Critical` : "Stable"}
          trend={metrics?.inventory.critical ? "down" : "neutral"}
        />
      </div>

      {/* Customer Links */}
      {workspaceId && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-200">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                  <LayoutDashboard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-purple-900">Customer Portal</h3>
                  <p className="text-sm text-purple-600">Main landing page</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(`${baseUrl}/?workspace=${workspaceId}`)}>
                  Copy
                </Button>
                <a href={`/?workspace=${workspaceId}`} target="_blank" rel="noreferrer">
                  <Button size="sm" className="bg-purple-600 hover:bg-purple-700">Open</Button>
                </a>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900">Booking Page</h3>
                  <p className="text-sm text-blue-600">Direct booking link</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(`${baseUrl}/book?workspace=${workspaceId}`)}>
                  Copy
                </Button>
                <a href={`/book?workspace=${workspaceId}`} target="_blank" rel="noreferrer">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">Open</Button>
                </a>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-indigo-50 to-white border-indigo-200">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-indigo-900">Contact Form</h3>
                  <p className="text-sm text-indigo-600">Direct contact link</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(`${baseUrl}/contact?workspace=${workspaceId}`)}>
                  Copy
                </Button>
                <a href={`/contact?workspace=${workspaceId}`} target="_blank" rel="noreferrer">
                  <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">Open</Button>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main content area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-white/80 backdrop-blur-sm border-purple-200">
          <CardHeader>
            <CardTitle className="text-purple-950">Recent Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentConversations.length > 0 ? (
                recentConversations.map((conv) => (
                  <Link
                    to={`/inbox?conversationId=${conv._id}`}
                    key={conv._id}
                    className="flex items-start gap-4 p-3 rounded-lg hover:bg-purple-50 transition-colors border border-transparent hover:border-purple-100"
                  >
                    <div className="mt-1">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold">
                        {conv.contact.firstName[0]}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className="font-semibold text-purple-900 truncate">
                          {conv.contact.firstName} {conv.contact.lastName}
                        </p>
                        <span className="text-xs text-purple-400 whitespace-nowrap">
                          {conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleDateString() : ''}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate mt-0.5">
                        {conv.lastMessage || "No messages"}
                      </p>
                    </div>
                    {conv.unreadCount > 0 && (
                      <div className="w-2 h-2 rounded-full bg-purple-600 mt-2" />
                    )}
                  </Link>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p>No recent messages</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-purple-200">
          <CardHeader>
            <CardTitle className="text-purple-950 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {alerts.length > 0 ? (
              <div className="space-y-3 text-sm">
                {alerts.map((alert, index) => (
                  <div key={alert.id || index} className={`relative group p-3 rounded-lg border transition-colors ${alert.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
                    alert.type === 'warning' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
                      'bg-blue-50 border-blue-200 text-blue-800'
                    }`}>
                    <Link to={alert.link} className="block pr-6 hover:opacity-80">
                      {alert.message}
                    </Link>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleDismiss(alert.id);
                      }}
                      className="absolute right-2 top-2 p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-black/5 transition-all"
                      title="Dismiss alert"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-green-700 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                All systems operational
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  change,
  trend,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
}) {
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-purple-200 hover:shadow-lg hover:shadow-purple-500/10 transition-all">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
            {icon}
          </div>
          <TrendingUp
            className={`w-4 h-4 ${trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : "text-gray-400"
              }`}
          />
        </div>
        <div className="text-2xl font-bold text-purple-950 mb-1">{value}</div>
        <div className="text-sm text-purple-700 mb-1">{label}</div>
        <div className="text-xs text-purple-600">{change}</div>
      </CardContent>
    </Card>
  );
}
