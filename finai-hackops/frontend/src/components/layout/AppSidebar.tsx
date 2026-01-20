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
      <SidebarContent className="flex flex-col h-full bg-[#0F172A] text-white">
        {/* FinAI Logo */}
        <div className="p-4 flex items-center gap-3 overflow-hidden h-20">
          <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-white/10 rounded-lg">
            <img
              src="/lovable-uploads/8eaa0ed2-ead7-405f-ba7f-5ddd5ba7e661.png"
              alt="FinAI Logo"
              className="w-6 h-6 object-contain"
            />
          </div>
          {!collapsed && (
            <div className="flex flex-col whitespace-nowrap opacity-100 transition-opacity duration-300">
              <span className="text-lg font-bold tracking-tight">FinAI</span>
              <span className="text-[10px] uppercase tracking-widest text-slate-400">Secure Assets</span>
            </div>
          )}
        </div>

        <SidebarGroup className="px-2">
          {!collapsed && (
            <SidebarGroupLabel className="px-2 text-[10px] font-semibold text-slate-500 uppercase tracking-[0.2em] mb-4">
              Core Platform
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group/item ${isActive
                          ? "bg-primary/20 text-primary border-l-2 border-primary"
                          : "text-slate-300 hover:bg-white/10 hover:text-white"
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <item.icon className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${isActive ? "text-white scale-110" : "text-slate-300 group-hover/item:text-white group-hover/item:scale-110"}`} />
                          {!collapsed && (
                            <span className="font-medium text-sm whitespace-nowrap opacity-100 transition-opacity duration-300">
                              {item.title}
                            </span>
                          )}
                        </>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Logout Button */}
        <div className="mt-auto px-2 pb-6">
          <SidebarMenuButton asChild>
            <button
              className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-slate-400 hover:bg-destructive/10 hover:text-destructive-foreground w-full"
              onClick={handleSignOut}
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {!collapsed && (
                <span className="font-medium text-sm whitespace-nowrap opacity-100 transition-opacity duration-300">
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
