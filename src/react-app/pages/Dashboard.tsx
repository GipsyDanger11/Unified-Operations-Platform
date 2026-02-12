import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/react-app/components/ui/card";
import { Calendar, MessageSquare, FileText, Package, TrendingUp, AlertTriangle, Loader2 } from "lucide-react";
import { api } from "@/react-app/lib/api";
import { Link } from "react-router";

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
  type: 'warning' | 'error' | 'info';
  message: string;
  link: string;
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [alerts, setAlerts] = useState<DashboardAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [metricsData, alertsWrapper] = await Promise.all([
          api.getDashboardMetrics(),
          api.getDashboardAlerts()
        ]);
        setMetrics(metricsData);
        setAlerts(alertsWrapper.alerts || []);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-purple-950">Dashboard</h1>
        <p className="text-purple-700 mt-1">Here's what's happening today.</p>
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

      {/* Main content area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-white/80 backdrop-blur-sm border-purple-200">
          <CardHeader>
            <CardTitle className="text-purple-950">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-purple-700">
              {/* Activity feed placeholder - would normally fetch from api.getDashboardActivity() */}
              <div className="space-y-4">
                {metrics?.bookings.today ? (
                  <div className="flex items-start gap-3">
                    <div className="mt-1 bg-purple-100 p-1.5 rounded-full text-purple-600">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-purple-900">You have {metrics.bookings.today} bookings today</p>
                      <p className="text-xs text-purple-500">Check your calendar for details</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-purple-500 italic">No recent activity to show.</p>
                )}
              </div>
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
                  <Link to={alert.link} key={index} className="block">
                    <div className={`p-3 rounded-lg border transition-colors hover:opacity-90 ${alert.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
                        alert.type === 'warning' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
                          'bg-blue-50 border-blue-200 text-blue-800'
                      }`}>
                      {alert.message}
                    </div>
                  </Link>
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
