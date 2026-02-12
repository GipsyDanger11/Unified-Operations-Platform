import { useState } from "react";
import { Link, useNavigate } from "react-router";
import WaveBackground from "@/react-app/components/WaveBackground";
import { Button } from "@/react-app/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle, CardContent, CardFooter } from "@/react-app/components/ui/card";
import { Input } from "@/react-app/components/ui/input";
import { Label } from "@/react-app/components/ui/label";
import { Sparkles, LayoutDashboard, MessageSquare, Calendar, FileText, Package, Users, Settings, LogIn, ArrowRight, Loader2 } from "lucide-react";
import { api } from "@/react-app/lib/api";

export default function HomePage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    businessName: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      let response;
      if (isLogin) {
        response = await api.login(formData.email, formData.password);
      } else {
        response = await api.register({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          businessName: formData.businessName,
        });
      }

      if (response.token) {
        navigate("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative">
      <WaveBackground />

      <div className="relative z-10">
        {/* Navigation */}
        <nav className="container mx-auto px-6 py-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
              <span className="font-bold text-sm">U</span>
            </div>
            <span className="font-bold text-xl text-purple-950">Unified Ops</span>
          </div>
          <div className="flex items-center gap-4">
            {/* Temporary links for demo purposes */}
            <Link to="/contact?workspace=DEMO" className="text-sm text-purple-600 hover:text-purple-900">Demo Contact</Link>
            <Link to="/book?workspace=DEMO" className="text-sm text-purple-600 hover:text-purple-900">Demo Booking</Link>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="container mx-auto px-6 py-12 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column: Text */}
            <div className="space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-sm border border-purple-200 shadow-sm mx-auto lg:mx-0">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">Hackathon Edition 2024</span>
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold tracking-tight text-purple-950 leading-tight">
                One Platform to <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">Run Everything</span>
              </h1>

              <p className="text-xl text-purple-700 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Replace chaos with clarity. Manage bookings, communications, forms, and inventory in one beautiful interface.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <Button size="lg" className="h-12 px-8 text-base bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-500/20" onClick={() => {
                  setIsLogin(false);
                  document.getElementById('auth-card')?.scrollIntoView({ behavior: 'smooth' });
                }}>
                  Start Free Trial <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
                <Link to="/dashboard">
                  <Button size="lg" variant="outline" className="h-12 px-8 text-base border-purple-200 bg-white/50 backdrop-blur-sm hover:bg-white">
                    View Demo Dashboard
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Column: Auth Card */}
            <div className="w-full max-w-md mx-auto lg:ml-auto">
              <Card id="auth-card" className="border-purple-100 shadow-2xl bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-2xl text-purple-900 text-center">
                    {isLogin ? "Welcome Back" : "Create Account"}
                  </CardTitle>
                  <CardDescription className="text-center">
                    {isLogin ? "Login to access your dashboard" : "Get started with your free workspace"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                      <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-100">
                        {error}
                      </div>
                    )}

                    {!isLogin && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input id="firstName" name="firstName" required onChange={handleChange} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input id="lastName" name="lastName" required onChange={handleChange} />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="businessName">Business Name</Label>
                          <Input id="businessName" name="businessName" required onChange={handleChange} placeholder="Acme Services" />
                        </div>
                      </>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" name="email" type="email" required onChange={handleChange} placeholder="you@example.com" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input id="password" name="password" type="password" required onChange={handleChange} />
                    </div>

                    <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 h-10" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {isLogin ? "Logging in..." : "Creating account..."}
                        </>
                      ) : (
                        isLogin ? "Login" : "Create Account"
                      )}
                    </Button>
                  </form>
                </CardContent>
                <CardFooter className="justify-center border-t border-purple-50 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setError(null);
                    }}
                    className="text-sm text-purple-600 hover:text-purple-800 hover:underline transition-all"
                  >
                    {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
                  </button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="container mx-auto px-6 pb-20 mt-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-purple-950 mb-4">Everything you need</h2>
            <p className="text-purple-700 max-w-2xl mx-auto">
              A complete toolkit to manage your service business from end to end.
            </p>
          </div>

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
    <Card className="bg-white/60 backdrop-blur-sm border-purple-100 hover:shadow-xl hover:shadow-purple-500/10 transition-all hover:-translate-y-1 group">
      <CardHeader>
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform shadow-lg shadow-purple-500/30">
          {icon}
        </div>
        <CardTitle className="text-purple-950">{title}</CardTitle>
        <CardDescription className="text-purple-700/80">{description}</CardDescription>
      </CardHeader>
    </Card>
  );
}
