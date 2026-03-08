"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { LayoutDashboard, Users, Heart, Brain, Building2, LogOut, Menu, X } from "lucide-react";

interface DashboardNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "candidates", label: "Candidates", icon: Users },
  { id: "shortlisted", label: "Shortlisted", icon: Heart },
  { id: "insights", label: "AI Insights", icon: Brain },
  { id: "profile", label: "Company Profile", icon: Building2 },
];

const DashboardNav = ({ activeTab, onTabChange }: DashboardNavProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const { employerProfile, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    router.push("/auth/login");
  };

  const initials = employerProfile?.name
    ? employerProfile.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "EP";

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <span className="font-heading font-bold text-lg text-foreground">FOOMO</span>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`nav-item ${activeTab === item.id ? "nav-item-active" : "nav-item-inactive"}`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-semibold">
              {initials}
            </div>
            <button onClick={handleLogout} className="nav-item nav-item-inactive">
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-1 animate-fade-in">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { onTabChange(item.id); setMobileOpen(false); }}
                className={`nav-item w-full ${activeTab === item.id ? "nav-item-active" : "nav-item-inactive"}`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
};

export default DashboardNav;
