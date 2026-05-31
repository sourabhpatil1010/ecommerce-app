import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { 
  LayoutDashboard, 
  Package, 
  Tags, 
  Users,
  LogOut,
  Home,
  ShieldCheck,
  Truck,
  Inbox,
  Ticket
} from "lucide-react";

const getNavItems = (role: string | undefined, isSuperuser: boolean) => {
  if (role === "SUPER_ADMIN" || (isSuperuser && role === "CUSTOMER")) {
    return [
      { name: "Dashboard", href: "/admin/super/dashboard", icon: LayoutDashboard },
      { name: "Products", href: "/admin/products", icon: Package },
      { name: "Categories", href: "/admin/categories", icon: Tags },
      { name: "Users", href: "/admin/users", icon: Users },
      { name: "Coupons", href: "/admin/coupons", icon: Ticket },
      { name: "Admins", href: "/admin/super/admins", icon: ShieldCheck },
    ];
  }
  if (role === "PRODUCT_ADMIN") {
    return [
      { name: "Dashboard", href: "/admin/product/dashboard", icon: LayoutDashboard },
      { name: "Products", href: "/admin/products", icon: Package },
      { name: "Categories", href: "/admin/categories", icon: Tags },
      { name: "Coupons", href: "/admin/coupons", icon: Ticket },
    ];
  }
  if (role === "SHIPPING_ADMIN") {
    return [
      { name: "Dashboard", href: "/admin/shipping/dashboard", icon: LayoutDashboard },
      { name: "Shipping Queue", href: "/admin/shipping/dashboard#queue", icon: Inbox },
    ];
  }
  if (role === "DELIVERY_ADMIN") {
    return [
      { name: "Dashboard", href: "/admin/delivery/dashboard", icon: LayoutDashboard },
      { name: "Delivery Queue", href: "/admin/delivery/dashboard#queue", icon: Truck },
    ];
  }
  return [];
};

export function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = getNavItems(user?.role, !!user?.is_superuser);

  return (
    <div className="flex h-screen bg-[#F8F9FA] dark:bg-gray-950 font-sans">
      {/* Sidebar */}
      <aside className="w-[260px] flex-shrink-0 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 hidden md:flex md:flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10">
        <div className="flex items-center h-[72px] px-6">
          <Link to="/admin" data-testid="admin-logo-link" className="flex items-center gap-3 group">
            <div className="flex items-center justify-center h-8 w-8 bg-black dark:bg-white rounded-lg group-hover:scale-105 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white dark:text-black">
                <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm0 1.5a8.25 8.25 0 1 0 0 16.5 8.25 8.25 0 0 0 0-16.5ZM12 7a.75.75 0 0 1 .75.75v3.5h3.5a.75.75 0 0 1 0 1.5h-3.5v3.5a.75.75 0 0 1-1.5 0v-3.5h-3.5a.75.75 0 0 1 0-1.5h3.5v-3.5A.75.75 0 0 1 12 7Z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">Admin Console</span>
          </Link>
        </div>
        
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                to={item.href}
                data-testid={`admin-sidebar-link-${item.name.toLowerCase().replace(" ", "-")}`}
                className={`flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group relative ${
                  isActive 
                    ? "bg-gray-100/80 text-black dark:bg-gray-800 dark:text-white" 
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800/50 dark:hover:text-gray-200"
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-black dark:bg-white rounded-r-full shadow-[0_0_8px_rgba(0,0,0,0.5)] dark:shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
                )}
                <Icon className={`h-[18px] w-[18px] mr-3 transition-colors ${
                  isActive ? "text-black dark:text-white" : "text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300"
                }`} />
                <span className="text-sm font-medium tracking-wide">{item.name}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 space-y-2">
          <Link
            to="/products"
            data-testid="admin-storefront-link"
            className="flex items-center px-3 py-2 text-xs font-semibold text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors rounded-lg hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm"
          >
            <Home className="h-4 w-4 mr-2.5" />
            Return to Storefront
          </Link>
          <button
            onClick={handleLogout}
            data-testid="admin-logout-btn"
            className="flex items-center w-full px-3 py-2 text-xs font-semibold text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 hover:shadow-sm"
          >
            <LogOut className="h-4 w-4 mr-2.5" />
            Sign Out Securely
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Header */}
        <header className="bg-white/80 backdrop-blur-md dark:bg-gray-900/80 border-b border-gray-100 dark:border-gray-800 h-[72px] flex items-center justify-between px-8 shrink-0 z-10 sticky top-0">
          <div className="md:hidden">
            <span className="text-lg font-bold tracking-tight text-black dark:text-white">Admin Console</span>
          </div>
          
          <div className="hidden md:flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 font-medium tracking-wide">
            {location.pathname.includes("dashboard") && (
              <span className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Live Updates Enabled
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex flex-col text-right hidden sm:flex">
              <span className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                {user?.full_name || user?.email}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                {user?.role?.replace("_", " ")}
              </span>
            </div>
            <div className="h-10 w-10 rounded-full bg-black dark:bg-white flex items-center justify-center text-white dark:text-black font-bold shadow-md ring-2 ring-gray-100 dark:ring-gray-800">
              {user?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "A"}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar">
          <div className="max-w-[1200px] mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
      
      {/* Scrollbar styling */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(107, 114, 128, 0.5);
        }
      `}</style>
    </div>
  );
}
