import {
  LayoutDashboard,
  CreditCard,
  Target,
  PiggyBank,
  Bell,
  QrCode,
  User,
  LogOut,
  TrendingUp,
  CalendarDays,
  Gauge
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";

const items = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Transactions", url: "/transactions", icon: CreditCard },
  { title: "Budget Management", url: "/budget", icon: Target },
  { title: "Savings Goals", url: "/savings", icon: PiggyBank },
  { title: "Bill Reminders", url: "/reminders", icon: CalendarDays },
  { title: "Readings", url: "/readings", icon: Gauge },
  { title: "Alerts & Notifications", url: "/alerts", icon: Bell },
  { title: "QR Payment", url: "/qr-payment", icon: QrCode },
  { title: "Profile", url: "/profile", icon: User },
];

export function AppSidebar() {
  const { state, setOpen } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const { user, signOut } = useAuth();
  const collapsed = state === 'collapsed';

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const isActive = (path: string) => currentPath === path;

  return (
    <Sidebar
      collapsible="icon"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      className="border-r border-sidebar-border/50 transition-all duration-300 ease-in-out group"
      style={{
        width: collapsed ? "var(--sidebar-width-icon)" : "var(--sidebar-width)"
      }}
    >
      <SidebarContent className="flex flex-col h-full bg-background text-foreground border-r border-border/50">
        {/* FinAI Logo */}
        <div className={`flex items-center overflow-hidden h-14 border-b border-sidebar-border/50 shrink-0 transition-all duration-300 ${collapsed ? 'justify-center w-full' : 'px-4 gap-3'}`}>
          <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-accent/10 rounded-sm border border-accent/20">
            <img
              src="/lovable-uploads/8eaa0ed2-ead7-405f-ba7f-5ddd5ba7e661.png"
              alt="FinAI Logo"
              className="w-5 h-5 object-contain grayscale opacity-90"
            />
          </div>
          {!collapsed && (
            <div className="flex flex-col whitespace-nowrap opacity-100 transition-opacity duration-300 justify-center">
              <span className="text-xl font-serif font-bold tracking-tight text-accent leading-none">FinAI</span>
              <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-muted-foreground mt-1 leading-none">Premium Wealth</span>
            </div>
          )}
        </div>

        <SidebarGroup className="px-2">
          {!collapsed && (
            <SidebarGroupLabel className="px-2 text-[10px] font-mono text-muted-foreground uppercase tracking-[0.2em] mb-4">
              Core Platform
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              {items.map((item) => {
                const isItemActive = currentPath === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isItemActive}>
                      <NavLink
                        to={item.url}
                        className={
                          `flex items-center gap-3 px-3 py-2 rounded-none transition-all duration-200 group/item ${isItemActive
                            ? "bg-muted/50 text-foreground border-l-[3px] border-primary font-medium"
                            : "text-muted-foreground hover:bg-muted/30 hover:text-foreground font-normal border-l-[3px] border-transparent"
                          }`
                        }
                      >
                        <>
                          <item.icon className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${isItemActive ? "text-primary" : "text-muted-foreground group-hover/item:text-foreground"}`} />
                          {!collapsed && (
                            <span className="text-sm whitespace-nowrap opacity-100 transition-opacity duration-300">
                              {item.title}
                            </span>
                          )}
                        </>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Logout Button */}
        <div className="mt-auto px-2 pb-6">
          <SidebarMenuButton asChild>
            <button
              className="flex items-center gap-3 px-3 py-2 rounded-none transition-all duration-200 text-muted-foreground hover:bg-destructive/5 hover:text-destructive hover:border-l-[3px] hover:border-destructive border-l-[3px] border-transparent w-full"
              onClick={handleSignOut}
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {!collapsed && (
                <span className="text-sm whitespace-nowrap opacity-100 transition-opacity duration-300">
                  Exit System
                </span>
              )}
            </button>
          </SidebarMenuButton>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
