"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import { clearStoredUser } from "@/lib/api";
import {
  LayoutDashboard, FolderKanban, PlusCircle, Receipt, Settings, LogOut,
} from "lucide-react";

export default function OrganizerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();

  const navItems = [
    { label: "Dashboard",       href: "/organizer/dashboard", icon: LayoutDashboard },
    { label: "Campaigns",       href: "/organizer/campaigns", icon: FolderKanban },
    { label: "Create Campaign", href: "/organizer/create",    icon: PlusCircle },
    { label: "Donations",       href: "/organizer/donations", icon: Receipt },
    { label: "Settings",        href: "/organizer/settings",  icon: Settings },
  ];

  const handleLogout = () => {
    clearStoredUser();
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-[#fdf6f0]">

      {/* Background blobs */}
      <div className="fixed top-[-100px] left-[-100px] w-80 h-80 rounded-full bg-[#00b964]/10 blur-3xl pointer-events-none" />
      <div className="fixed bottom-[-80px] right-[-80px] w-72 h-72 rounded-full bg-emerald-200/15 blur-3xl pointer-events-none" />

      {/* ── SIDEBAR ── */}
      <aside className="w-64 bg-white/80 backdrop-blur-xl border-r border-gray-100 shadow-sm shrink-0 flex flex-col sticky top-0 h-screen">

        {/* Logo */}
        <div className="px-6 pt-7 pb-5 border-b border-gray-100">
          <Logo size={32} href="/organizer/dashboard" />
          <p className="text-xs text-gray-400 mt-2 pl-0.5 font-medium uppercase tracking-wider">Organizer Panel</p>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1 p-4 flex-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 ${
                  isActive
                    ? "text-white shadow-md"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`}
                style={isActive ? { background: "linear-gradient(135deg,#00b964,#00d4aa)", boxShadow: "0 4px 12px rgba(0,185,100,0.3)" } : {}}
              >
                <Icon size={17} />
                <span className="text-sm font-semibold">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-100">
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-500 hover:bg-red-50 hover:text-red-500 border-2 border-transparent hover:border-red-200 transition-all duration-200">
            <LogOut size={17} />
            <span className="text-sm font-semibold">Logout</span>
          </button>
          <p className="text-xs text-gray-400 text-center mt-3">v1.0 • TransFund Tracker</p>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}
