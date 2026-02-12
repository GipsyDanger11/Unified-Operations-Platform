import { Link } from "react-router";
import WaveBackground from "@/react-app/components/WaveBackground";
import { Button } from "@/react-app/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/react-app/components/ui/card";
import { Sparkles, LayoutDashboard, MessageSquare, Calendar, FileText, Package, Users, Settings } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen relative">
      <WaveBackground />
      
      <div className="relative z-10">
        {/* Hero Section */}
        <div className="container mx-auto px-6 py-20">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-sm border border-purple-200 shadow-sm">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">Modern SaaS Platform</span>
            </div>
            
            <h1 className="text-6xl font-bold tracking-tight text-purple-950">
              Unified Operations Platform
            </h1>
            
            <p className="text-xl text-purple-700 max-w-2xl mx-auto leading-relaxed">
              A complete business management solution for service companies. Streamline bookings, 
              communications, forms, and inventory in one beautiful interface.
            </p>
            
            <div className="flex items-center justify-center gap-4 pt-4">
              <Link to="/onboarding">
                <Button size="lg" className="text-base px-8 shadow-lg shadow-purple-500/20 hover:shadow-xl hover:shadow-purple-500/30 transition-all">
                  Start Onboarding
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button size="lg" variant="outline" className="text-base px-8 bg-white/80 backdrop-blur-sm hover:bg-white">
                  View Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="container mx-auto px-6 pb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            <FeatureCard
              icon={<LayoutDashboard className="w-6 h-6" />}
              title="Dashboard"
              description="Real-time operations command center with live metrics"
            />
            <FeatureCard
              icon={<MessageSquare className="w-6 h-6" />}
              title="Unified Inbox"
              description="Email and SMS conversations in one place"
            />
            <FeatureCard
              icon={<Calendar className="w-6 h-6" />}
              title="Bookings"
              description="Calendar view with automated confirmations"
            />
            <FeatureCard
              icon={<FileText className="w-6 h-6" />}
              title="Forms"
              description="Track and automate customer forms"
            />
            <FeatureCard
              icon={<Package className="w-6 h-6" />}
              title="Inventory"
              description="Track stock with runout predictions"
            />
            <FeatureCard
              icon={<Users className="w-6 h-6" />}
              title="Team Management"
              description="Role-based access and permissions"
            />
            <FeatureCard
              icon={<Settings className="w-6 h-6" />}
              title="Automation"
              description="Event-driven workflows with audit logs"
            />
            <FeatureCard
              icon={<Sparkles className="w-6 h-6" />}
              title="AI Assistant"
              description="Smart reply suggestions and insights"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-purple-200 hover:shadow-xl hover:shadow-purple-500/10 transition-all hover:-translate-y-1 group">
      <CardHeader>
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform shadow-lg shadow-purple-500/30">
          {icon}
        </div>
        <CardTitle className="text-purple-950">{title}</CardTitle>
        <CardDescription className="text-purple-700">{description}</CardDescription>
      </CardHeader>
    </Card>
  );
}
