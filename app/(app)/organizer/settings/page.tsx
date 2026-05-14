"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getStoredUser, clearStoredUser, upsertUser } from "@/lib/api";

export default function SettingsPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const u = getStoredUser();
    if (u) { setName(u.name); setEmail(u.email); }
  }, []);

  const handleSave = async () => {
    const u = getStoredUser();
    if (!u || !name.trim()) return;
    setSaving(true);
    try {
      const { user } = await upsertUser({ role: u.role as "donor" | "organizer", name: name.trim(), email: u.email });
      import("@/lib/api").then(({ setStoredUser }) =>
        setStoredUser({ email: user.email, name: user.name, role: user.role })
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
    finally { setSaving(false); }
  };

  const handleLogout = () => {
    clearStoredUser();
    router.push("/login");
  };

  return (
    <div className="max-w-xl space-y-6">

      <h1 className="text-2xl font-semibold">Settings</h1>

      <div className="bg-white/70 backdrop-blur-xl p-6 rounded-2xl border shadow-sm space-y-4">

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Organization Name"
          className="w-full border p-3 rounded-lg text-sm focus:outline-none focus:border-blue-400"
        />

        <input
          value={email}
          readOnly
          placeholder="Email"
          className="w-full border p-3 rounded-lg text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
        />

        {saved && <p className="text-green-600 text-sm">Saved!</p>}

        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-5 py-2 rounded-lg text-sm hover:opacity-90 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>

          <button
            onClick={handleLogout}
            className="flex-none bg-white border border-red-300 text-red-600 px-4 py-2 rounded-lg text-sm hover:bg-red-50 transition"
          >
            Logout
          </button>
        </div>

      </div>
    </div>
  );
}