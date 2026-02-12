import { Card, CardContent, CardHeader, CardTitle } from "@/react-app/components/ui/card";
import { Calendar, MessageSquare, FileText, Package, TrendingUp, AlertTriangle } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-purple-950">Dashboard</h1>
        <p className="text-purple-700 mt-1">Welcome back, John. Here's what's happening today.</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<Calendar className="w-5 h-5" />}
          label="Today's Bookings"
          value="12"
          change="+3 from yesterday"
          trend="up"
        />
        <StatCard
          icon={<MessageSquare className="w-5 h-5" />}
          label="Unread Messages"
          value="8"
          change="2 urgent"
          trend="neutral"
        />
        <StatCard
          icon={<FileText className="w-5 h-5" />}
          label="Pending Forms"
          value="5"
          change="3 overdue"
          trend="down"
        />
        <StatCard
          icon={<Package className="w-5 h-5" />}
          label="Low Stock Items"
          value="2"
          change="Critical"
          trend="down"
        />
      </div>

      {/* Main content area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-white/80 backdrop-blur-sm border-purple-200">
          <CardHeader>
            <CardTitle className="text-purple-950">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-purple-700">Activity timeline will appear here</div>
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
            <div className="space-y-3 text-sm">
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800">
                3 unconfirmed bookings today
              </div>
              <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-800">
                Low stock: Floor cleaner (2 units)
              </div>
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-800">
                5 forms pending completion
              </div>
            </div>
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
            className={`w-4 h-4 ${
              trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : "text-gray-400"
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
