"use client";

import { useRouter } from "next/navigation";
import React from "react";
import Logo from "@/components/Logo";

export default function Navbar() {
  const router = useRouter();

  const handleLogout = () => {
    try {
      // clear common auth storage (adjust keys if your app uses different storage)
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      sessionStorage.clear();
    } catch (e) {
      // ignore in environments without storage
    }

    // redirect to login page
    router.push("/login");
  };

  return (
    <div className="flex justify-between items-center px-6 py-4 bg-white shadow">
      <Logo size={34} />

      <div>
        <button
          onClick={handleLogout}
          className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
}