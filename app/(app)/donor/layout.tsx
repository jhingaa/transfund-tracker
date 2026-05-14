"use client";

import Logo from "@/components/Logo";
import { useRouter, usePathname } from "next/navigation";
import { clearStoredUser } from "@/lib/api";
import { LogOut } from "lucide-react";

export default function DonorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    clearStoredUser();
    router.push("/login");
  };

  return (
    <div className="relative min-h-screen overflow-hidden">

      {/* Global Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[#fdf6f0]" />
        <div className="absolute top-[-80px] left-[-80px] w-80 h-80 rounded-full bg-[#00b964]/10 blur-3xl" />
        <div className="absolute bottom-[-60px] right-[-60px] w-72 h-72 rounded-full bg-emerald-200/20 blur-3xl" />
      </div>

      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-4 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm sticky top-0 z-40">
        <Logo size={34} href="/donor/home" />

        <div className="flex items-center gap-6 text-sm font-medium text-gray-600">
          <a href="/donor/home"
            className={`hover:text-[#00b964] transition ${pathname === "/donor/home" ? "text-[#00b964] font-bold" : ""}`}>
            Explore
          </a>
          <a href="/donor/dashboard"
            className={`hover:text-[#00b964] transition ${pathname === "/donor/dashboard" ? "text-[#00b964] font-bold" : ""}`}>
            Dashboard
          </a>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full border-2 border-gray-200 hover:border-red-400 hover:text-red-500 hover:bg-red-50 text-gray-600 transition-all duration-200 text-sm font-semibold"
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6">
        {children}
      </main>

    </div>
  );
}