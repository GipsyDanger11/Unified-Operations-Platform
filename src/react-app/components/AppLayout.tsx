import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard,
  MessageSquare,
  Calendar,
  FileText,
  Package,
  Users,
  Settings,
  Zap,
  Bell,
  ChevronDown,
  Search,
  Menu,
  X,
  LogOut
} from "lucide-react";
import { Button } from "@/react-app/components/ui/button";
import { Badge } from "@/react-app/components/ui/badge";
import { Avatar, AvatarFallback } from "@/react-app/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/react-app/components/ui/dropdown-menu";
import WaveBackground from "@/react-app/components/WaveBackground";
import { api } from "@/react-app/lib/api";

interface AppLayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Inbox", href: "/inbox", icon: MessageSquare, badge: 12 },
  { name: "Bookings", href: "/bookings", icon: Calendar, badge: 3 },
  { name: "Forms", href: "/forms", icon: FileText, badge: 5 },
  { name: "Inventory", href: "/inventory", icon: Package },
  { name: "Team", href: "/team", icon: Users },
  { name: "Automation", href: "/automation", icon: Zap },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  useEffect(() => {
    fetchUser();
    fetchAlerts();
  }, []);

  const fetchUser = async () => {
    try {
      const data = await api.getMe();
      if (data?.user) {
        setUser(data.user);
      }
    } catch (error) {
      console.error("Failed to fetch user profile", error);
    }
  };

  const fetchAlerts = async () => {
    try {
      const data = await api.getDashboardAlerts();
      if (data?.alerts) {
        setAlerts(data.alerts);
      }
    } catch (error) {
      console.error("Failed to fetch alerts", error);
    }
  };

  const handleLogout = () => {
    api.logout();
    navigate("/");
  };

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length > 2) {
      try {
        const data = await api.search(query);
        setSearchResults(data.results || []);
        setShowSearchResults(true);
      } catch (error) {
        console.error("Search failed", error);
      }
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  const handleSearchResultClick = (link: string) => {
    setShowSearchResults(false);
    setSearchQuery("");
    navigate(link);
  };

  return (
    <div className="min-h-screen relative">
      <WaveBackground />

      <div className="relative z-10 flex h-screen">
        {/* Sidebar */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-50 w-64 bg-white/90 backdrop-blur-xl border-r border-purple-200 
            transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            shadow-xl shadow-purple-500/5
          `}
        >
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center justify-between h-16 px-6 border-b border-purple-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <span className="font-bold text-lg text-purple-950">Unified Ops</span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 hover:bg-purple-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-purple-700" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      flex items-center justify-between px-4 py-3 rounded-xl transition-all group
                      ${isActive
                        ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/30"
                        : "text-purple-700 hover:bg-purple-50 hover:text-purple-900"
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 ${isActive ? "" : "group-hover:scale-110 transition-transform"}`} />
                      <span className="font-medium">{item.name}</span>
                    </div>
                    {item.badge ? (
                      <Badge
                        variant={isActive ? "secondary" : "default"}
                        className={`
                          ${isActive ? "bg-white/20 text-white" : "bg-purple-500 text-white"}
                          min-w-[24px] h-6 flex items-center justify-center
                        `}
                      >
                        {item.badge}
                      </Badge>
                    ) : null}
                  </Link>
                );
              })}
            </nav>

            {/* Bottom section */}
            <div className="p-4 border-t border-purple-200">
              <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
                <p className="text-sm font-medium text-purple-900 mb-1">Need help?</p>
                <p className="text-xs text-purple-700 mb-3">Check our documentation and guides</p>
                <Button size="sm" variant="outline" className="w-full text-xs bg-white hover:bg-purple-50">
                  View Docs
                </Button>
              </div>
            </div>
          </div>
        </aside>

        {/* Main content area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top bar */}
          <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-purple-200 shadow-sm shadow-purple-500/5">
            <div className="h-full px-6 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 hover:bg-purple-100 rounded-lg transition-colors"
                >
                  <Menu className="w-5 h-5 text-purple-700" />
                </button>

                {/* Workspace switcher */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2 bg-white hover:bg-purple-50 border-purple-200">
                      <span className="font-medium text-purple-900">Acme Services</span>
                      <ChevronDown className="w-4 h-4 text-purple-600" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-64">
                    <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                        AS
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">Acme Services</div>
                        <div className="text-xs text-muted-foreground">Active</div>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Create new workspace</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Search */}
                <div className="hidden md:block relative z-50">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-50 border border-purple-200 text-purple-600 w-[300px]">
                    <Search className="w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search..."
                      className="bg-transparent border-none outline-none text-sm w-full placeholder:text-purple-400 text-purple-900"
                      value={searchQuery}
                      onChange={handleSearch}
                      onFocus={() => searchQuery.length > 2 && setShowSearchResults(true)}
                    />
                    <kbd className="px-2 py-0.5 text-xs bg-white rounded border border-purple-200">⌘K</kbd>
                  </div>

                  {showSearchResults && searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg border border-purple-200 shadow-xl overflow-hidden max-h-[300px] overflow-y-auto">
                      {searchResults.map((result, idx) => (
                        <div
                          key={`${result.type}-${result.id}-${idx}`}
                          className="p-3 hover:bg-purple-50 cursor-pointer border-b border-purple-50 last:border-0"
                          onClick={() => handleSearchResultClick(result.link)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="font-medium text-purple-900 text-sm">{result.title}</div>
                            <Badge variant="outline" className="text-[10px] uppercase">{result.type}</Badge>
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">{result.subtitle}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Alert center */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative hover:bg-purple-50">
                      <Bell className="w-5 h-5 text-purple-700" />
                      {alerts.length > 0 && (
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    <DropdownMenuLabel>System Alerts ({alerts.length})</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <div className="max-h-64 overflow-y-auto">
                      {alerts.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">No new alerts</div>
                      ) : (
                        alerts.map((alert, i) => (
                          <DropdownMenuItem key={i} className="flex flex-col items-start gap-1 p-3 cursor-pointer" onClick={() => navigate(alert.link)}>
                            <div className="flex items-center gap-2 w-full">
                              <div
                                className={`w-2 h-2 rounded-full ${alert.type === "urgent" || alert.type === "error"
                                  ? "bg-red-500"
                                  : alert.type === "warning"
                                    ? "bg-yellow-500"
                                    : "bg-blue-500"
                                  }`}
                              />
                              <span className="text-sm flex-1">{alert.message}</span>
                            </div>
                          </DropdownMenuItem>
                        ))
                      )}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* User profile */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-2 hover:bg-purple-50 px-2">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-purple-600 text-white text-sm font-medium">
                          {user ? `${user.firstName[0]}${user.lastName[0]}` : 'JD'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden md:inline font-medium text-purple-900">
                        {user ? `${user.firstName} ${user.lastName}` : 'Loading...'}
                      </span>
                      <ChevronDown className="w-4 h-4 text-purple-600" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div>{user ? `${user.firstName} ${user.lastName}` : 'John Doe'}</div>
                      <div className="text-xs font-normal text-muted-foreground">
                        {user ? user.email : 'john@acme.com'}
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Profile settings</DropdownMenuItem>
                    <DropdownMenuItem>Billing</DropdownMenuItem>
                    <DropdownMenuItem>Help & support</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600 cursor-pointer" onClick={handleLogout}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
