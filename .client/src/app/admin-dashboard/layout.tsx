"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Home, Building2, Users, CreditCard, BarChart2, 
  FileText, Banknote, Ticket, ScrollText, Bell, 
  Settings, Menu, X, Command,
  Zap
} from "lucide-react";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/admin-dashboard", icon: Home },
  { name: "Companies", href: "/admin-dashboard/companies", icon: Building2 },
  { name: "Users", href: "/admin-dashboard/users", icon: Users },
  { name: "Subscriptions", href: "/admin-dashboard/subscriptions", icon: CreditCard },
  { name: "Analytics", href: "/admin-dashboard/analytics", icon: BarChart2 },
  { name: "Invoices", href: "/admin-dashboard/invoices", icon: FileText },
  { name: "Payroll", href: "/admin-dashboard/payroll", icon: Banknote },
  { name: "Support", href: "/admin-dashboard/tickets", icon: Ticket },
  { name: "Audit", href: "/admin-dashboard/audit", icon: ScrollText },
  { name: "Alerts", href: "/admin-dashboard/notifications", icon: Bell },
  { name: "Settings", href: "/admin-dashboard/settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    } else {
      setAuthorized(true);
    }
  }, [router]);

  const handleExit = (e: React.MouseEvent) => {
    e.preventDefault();
    localStorage.removeItem("token");
    router.push("/login");
  };

  if (!authorized) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <span className="font-display-lg text-lg uppercase tracking-widest text-[#FACC15] animate-pulse">
          Authenticating...
        </span>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#050505] text-white selection:bg-[#FACC15] selection:text-black overflow-hidden font-body-md">
      
      {/* Sidebar - Sleek Ultra-Premium Glassmorphism (No Brutalism) */}
      <aside
        className={`
          relative h-full bg-white/[0.02] border-r border-white/[0.05] flex flex-col z-20 shrink-0 backdrop-blur-xl
          transition-all duration-300 ease-in-out
          ${isSidebarOpen ? "w-[260px]" : "w-[80px]"}
        `}
      >
        <div className="h-20 flex items-center justify-between px-5 shrink-0 border-b border-white/[0.05]">
          <div className={`flex items-center gap-3 overflow-hidden transition-all duration-300 ${isSidebarOpen ? "w-full opacity-100" : "w-0 opacity-0"}`}>
            <div className="w-8 h-8 rounded-lg bg-[#FACC15] flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(250,204,21,0.5)]">
              <Zap size={18} className="text-black" />
            </div>
            <span className="font-display-lg text-lg uppercase font-black tracking-widest whitespace-nowrap text-white">
              ADMIN
            </span>
          </div>
          
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`
              w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors
              ${isSidebarOpen ? "text-white/50 hover:text-white hover:bg-white/10" : "text-white bg-white/10 shadow-[0_0_10px_rgba(255,255,255,0.1)] absolute left-1/2 -translate-x-1/2"}
            `}
          >
            <Menu size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-3 flex flex-col gap-2 no-scrollbar">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  relative flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-200 overflow-hidden group
                  ${isActive 
                    ? "bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]" 
                    : "text-white/60 hover:bg-white/5 hover:text-white"}
                `}
                title={!isSidebarOpen ? item.name : undefined}
              >
                {/* Active Indicator Glow */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#FACC15] rounded-r-full shadow-[0_0_10px_#FACC15]"></div>
                )}
                
                <div className="shrink-0 flex items-center justify-center w-6 h-6">
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 2} className={isActive ? "text-[#FACC15]" : "group-hover:scale-110 transition-transform"} />
                </div>
                
                <span className={`font-label-caps uppercase font-bold text-xs tracking-wider transition-opacity duration-300 whitespace-nowrap ${isSidebarOpen ? "opacity-100" : "opacity-0"}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
        
        <div className="p-4 border-t border-white/[0.05] shrink-0">
          <button 
            onClick={handleExit}
            className="w-full flex items-center gap-4 px-3 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all overflow-hidden group cursor-pointer text-left bg-transparent border-0 outline-none"
          >
            <div className="shrink-0 flex items-center justify-center w-6 h-6 group-hover:scale-110 transition-transform">
              <X size={22} strokeWidth={2.5} />
            </div>
            <span className={`font-label-caps uppercase font-bold text-xs tracking-wider transition-opacity duration-300 whitespace-nowrap ${isSidebarOpen ? "opacity-100" : "opacity-0"}`}>
              Exit System
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 h-full overflow-y-auto overflow-x-hidden relative">
        <div className="absolute inset-0 pattern-grid opacity-10 pointer-events-none fixed"></div>
        <div className="relative z-10 p-6 sm:p-8 lg:p-12">
          {children}
        </div>
      </main>
    </div>
  );
}
