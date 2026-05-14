"use client";

import { useState, type FormEvent } from "react";
import { User, Briefcase, Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { setStoredUser, loginUser } from "@/lib/api";
import Logo from "@/components/Logo";

export default function Login() {
  const router = useRouter();

  const [role, setRole] = useState<"donor" | "organizer">("donor");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const validateEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const handleEmailChange = (v: string) => {
    setEmail(v);
    setError(v.length > 0 && !validateEmail(v) ? "Invalid email format" : "");
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) return setError("Enter a valid email");
    if (name.trim().length < 2) return setError("Enter your name");
    if (!password) return setError("Enter your password");
    setError("");
    setSubmitting(true);
    try {
      const { user } = await loginUser({ role, name: name.trim(), email: email.trim().toLowerCase(), password });
      setStoredUser({ email: user.email, name: user.name, role: user.role });
      router.push(user.role === "donor" ? "/donor/home" : "/organizer/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center relative overflow-hidden bg-[#fdf6f0]">

      {/* ── Background blobs ── */}
      <div className="fixed top-[-100px] left-[-100px] w-96 h-96 rounded-full bg-[#00b964]/20 blur-3xl pointer-events-none" />
      <div className="fixed bottom-[-80px] right-[-80px] w-96 h-96 rounded-full bg-emerald-300/25 blur-3xl pointer-events-none" />
      <div className="fixed top-1/2 right-1/4 w-64 h-64 rounded-full bg-teal-200/25 blur-2xl pointer-events-none" />
      <div className="fixed bottom-1/3 left-1/4 w-56 h-56 rounded-full bg-[#00b964]/15 blur-2xl pointer-events-none" />
      <div className="fixed top-1/4 left-1/2 w-48 h-48 rounded-full bg-emerald-200/20 blur-2xl pointer-events-none" />

      {/* ── Floating emoji circles (background decoration) ── */}
      {[
        { emoji: "💚", size: "w-14 h-14", top: "8%",  left: "6%",  delay: "0s",    from: "from-emerald-300", to: "to-teal-400" },
        { emoji: "🏥", size: "w-12 h-12", top: "15%", right: "8%", delay: "0.5s",  from: "from-blue-300",    to: "to-blue-500" },
        { emoji: "🎓", size: "w-10 h-10", bottom: "20%", left: "5%", delay: "1s",  from: "from-purple-300",  to: "to-purple-500" },
        { emoji: "🤝", size: "w-12 h-12", bottom: "12%", right: "6%", delay: "0.7s", from: "from-amber-300", to: "to-orange-400" },
        { emoji: "🌍", size: "w-10 h-10", top: "55%", left: "3%",  delay: "1.3s",  from: "from-teal-300",    to: "to-cyan-500" },
        { emoji: "🛡️", size: "w-10 h-10", top: "40%", right: "4%", delay: "0.3s",  from: "from-rose-300",    to: "to-pink-400" },
      ].map((c, i) => (
        <div
          key={i}
          className={`fixed ${c.size} rounded-full bg-gradient-to-br ${c.from} ${c.to} flex items-center justify-center text-lg shadow-lg opacity-80 pointer-events-none`}
          style={{ top: c.top, left: (c as any).left, right: (c as any).right, bottom: (c as any).bottom, animation: `float ${3.5 + i * 0.3}s ease-in-out ${c.delay} infinite` }}
        >
          {c.emoji}
        </div>
      ))}

      {/* ── Floating card ── */}
      <div
        className="relative z-10 w-full max-w-md mx-4 bg-white rounded-3xl shadow-2xl overflow-hidden"
        style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.12), 0 8px 24px rgba(0,185,100,0.08)" }}
      >

        {/* Green top bar */}
        <div className="h-1.5 w-full" style={{ background: "linear-gradient(90deg, #00b964, #00d4aa, #0069ff)" }} />

        <div className="px-8 py-8">

          {/* Logo */}
          <div className="flex items-center justify-center mb-7">
            <Logo size={38} href="/" />
          </div>

          {/* Heading */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Welcome back</h1>
            <p className="text-gray-400 text-sm">Sign in to continue</p>
          </div>

          {/* Role toggle */}
          <div className="grid grid-cols-2 gap-2 mb-6 p-1 bg-gray-100 rounded-2xl">
            <button
              type="button"
              id="role-donor"
              onClick={() => setRole("donor")}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                role === "donor" ? "bg-white text-[#00b964] shadow-md" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <User size={15} /> Donor
            </button>
            <button
              type="button"
              id="role-organizer"
              onClick={() => setRole("organizer")}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                role === "organizer" ? "bg-white text-[#00b964] shadow-md" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Briefcase size={15} /> Organizer
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-3">

            <div className="relative">
              <User size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                id="input-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                className="w-full pl-10 pr-4 py-3 rounded-2xl border-2 border-gray-100 bg-gray-50 focus:bg-white focus:border-[#00b964] focus:outline-none text-sm transition-all duration-200"
              />
            </div>

            <div className="relative">
              <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                id="input-email"
                type="email"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                placeholder="Email address"
                className={`w-full pl-10 pr-4 py-3 rounded-2xl border-2 bg-gray-50 focus:bg-white focus:outline-none text-sm transition-all duration-200 ${
                  error.includes("email") ? "border-red-400 bg-red-50" : "border-gray-100 focus:border-[#00b964]"
                }`}
              />
            </div>

            <div className="relative">
              <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                id="input-password"
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full pl-10 pr-11 py-3 rounded-2xl border-2 border-gray-100 bg-gray-50 focus:bg-white focus:border-[#00b964] focus:outline-none text-sm transition-all duration-200"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
                <span className="text-xs">⚠️</span>
                <p className="text-red-600 text-xs">{error}</p>
              </div>
            )}

            <button
              id="btn-login"
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-white text-sm disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background: submitting ? "#9ca3af" : "linear-gradient(135deg, #00b964, #00d4aa)",
                boxShadow: submitting ? "none" : "0 8px 20px rgba(0,185,100,0.35)",
                transition: "all 0.2s ease",
                transform: submitting ? "none" : undefined,
              }}
              onMouseEnter={e => { if (!submitting) (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; }}
            >
              {submitting ? (
                <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Signing in…</>
              ) : (
                <>Sign in as {role === "donor" ? "Donor" : "Organizer"} <ArrowRight size={15} /></>
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-sm text-gray-500 mt-5">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-bold text-[#00b964] hover:underline">
              Sign up free
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}
