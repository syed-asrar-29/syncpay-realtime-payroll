import { Link, useLocation } from "wouter";
import { Users, Briefcase, CreditCard, Menu, X, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useWebSocket } from "@/hooks/use-websocket";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  // Initialize WebSocket for real-time updates
  useWebSocket();

  const navItems = [
    { href: "/employee", label: "Employee Portal", icon: Users },
    { href: "/manager", label: "Manager Dashboard", icon: Briefcase },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-body">
      {/* Mobile Header */}
      <div className="md:hidden bg-white p-4 flex items-center justify-between shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold">SP</div>
          <span className="font-display font-bold text-lg text-foreground">SyncPay</span>
        </div>
        <button onClick={() => setIsMobileOpen(!isMobileOpen)} className="p-2 text-muted-foreground">
          {isMobileOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={cn(
        "fixed md:sticky top-0 h-screen bg-white border-r border-border w-64 p-6 flex-col transition-transform duration-300 z-40 md:translate-x-0",
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="hidden md:flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25 flex items-center justify-center text-white font-bold text-xl">
            SP
          </div>
          <div>
            <h1 className="font-display font-bold text-xl text-foreground">SyncPay</h1>
            <p className="text-xs text-muted-foreground">HR Management</p>
          </div>
        </div>

        <nav className="space-y-2 flex-1">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-2">Menu</div>
          {navItems.map((item) => {
            const isActive = location.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href}>
                <div className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 group",
                  isActive 
                    ? "bg-primary/10 text-primary font-semibold" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}>
                  <item.icon className={cn("w-5 h-5 transition-colors", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-6 border-t border-border">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-4 text-white shadow-xl">
            <h4 className="font-display font-bold text-sm">Need Help?</h4>
            <p className="text-xs text-slate-300 mt-1 mb-3">Contact HR support for assistance.</p>
            <button className="text-xs bg-white/10 hover:bg-white/20 transition-colors w-full py-2 rounded-lg font-medium">
              Contact Support
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto">
        <div className="max-w-7xl mx-auto animate-in">
          {children}
        </div>
      </main>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </div>
  );
}
