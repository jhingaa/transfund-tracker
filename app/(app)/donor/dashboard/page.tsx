"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getCampaigns, getDonorDonations, getStoredUser, fmtINR, fmtDate } from "@/lib/api";
import { ArrowRight, Heart, Target, Zap } from "lucide-react";

const CATEGORY_META: Record<string, { emoji: string; gradient: string }> = {
  Education:  { emoji: "🎓", gradient: "from-blue-400 to-indigo-500" },
  Medical:    { emoji: "🏥", gradient: "from-rose-400 to-pink-500" },
  Events:     { emoji: "🎉", gradient: "from-purple-400 to-violet-500" },
  NGOs:       { emoji: "🌍", gradient: "from-teal-400 to-cyan-500" },
  Community:  { emoji: "🤝", gradient: "from-amber-400 to-orange-500" },
  Emergency:  { emoji: "🚨", gradient: "from-orange-400 to-red-500" },
  General:    { emoji: "💡", gradient: "from-gray-400 to-slate-500" },
};

type Campaign = {
  id: number; title: string; description: string; category: string;
  goal_amount: number; raised_amount: number; status: string;
};

type Donation = {
  id: number; campaign_id: number; campaign_title: string;
  amount: number; donated_at: string;
};

export default function DonorDashboard() {
  const [user, setUser]               = useState<{ name: string; email: string } | null>(null);
  const [campaigns, setCampaigns]     = useState<Campaign[]>([]);
  const [myDonations, setMyDonations] = useState<Donation[]>([]);
  const [totalDonated, setTotalDonated] = useState(0);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    const stored = getStoredUser();
    if (stored) setUser(stored);

    getCampaigns()
      .then((data) => setCampaigns(data.filter((c: Campaign) => c.status === "active").slice(0, 4)))
      .catch(() => {});

    if (stored?.email) {
      getDonorDonations(stored.email)
        .then((data: Donation[]) => {
          setMyDonations(data.slice(0, 6));
          setTotalDonated(data.reduce((s: number, d: Donation) => s + d.amount, 0));
        })
        .catch(() => {});
    }

    setLoading(false);
  }, []);

  const uniqueCampaigns = new Set(myDonations.map((d) => d.campaign_id)).size;

  return (
    <div className="space-y-8 pb-12">

      {/* ── Hero banner ── */}
      <div className="relative rounded-3xl overflow-hidden"
        style={{ background: "linear-gradient(135deg,#00b964,#00d4aa 55%,#0069ff)" }}>
        {/* dot grid texture */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        {/* glow blobs */}
        <div className="absolute top-[-40px] right-[-40px] w-48 h-48 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute bottom-[-30px] left-1/3 w-40 h-40 rounded-full bg-white/10 blur-2xl" />

        <div className="relative z-10 px-8 py-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p className="text-green-100 text-sm font-medium mb-1">Your Impact Dashboard</p>
            <h1 className="text-3xl font-extrabold text-white mb-2">
              {user?.name ? `Hey, ${user.name.split(" ")[0]}! 👋` : "Welcome back! 👋"}
            </h1>
            <p className="text-green-100 text-sm max-w-sm">
              Track your donations, explore campaigns, and see the difference you're making.
            </p>
            <Link href="/donor/home"
              className="mt-5 inline-flex items-center gap-2 bg-white text-[#00b964] font-bold px-5 py-2.5 rounded-full text-sm hover:-translate-y-0.5 transition-all shadow-lg"
              style={{ transition: "all 0.2s ease" }}>
              Explore Campaigns <ArrowRight size={14} />
            </Link>
          </div>

          {/* Mini stats */}
          <div className="flex gap-3 shrink-0">
            {[
              { icon: "💰", label: "Total Donated",       value: fmtINR(totalDonated) },
              { icon: "🎯", label: "Campaigns Supported", value: uniqueCampaigns },
            ].map((s) => (
              <div key={s.label} className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl px-5 py-4 text-center min-w-[110px]">
                <div className="text-2xl mb-1">{s.icon}</div>
                <p className="text-xl font-extrabold text-white">{s.value}</p>
                <p className="text-green-100 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          {
            icon: Heart,
            label: "Total Donated",
            value: fmtINR(totalDonated),
            sub: "across all campaigns",
            gradient: "from-[#00b964] to-[#00d4aa]",
            iconBg: "bg-green-50 text-[#00b964]",
          },
          {
            icon: Target,
            label: "Campaigns Supported",
            value: uniqueCampaigns,
            sub: "unique campaigns",
            gradient: "from-blue-500 to-indigo-500",
            iconBg: "bg-blue-50 text-blue-600",
          },
          {
            icon: Zap,
            label: "Active Campaigns",
            value: campaigns.length,
            sub: "live right now",
            gradient: "from-amber-500 to-orange-500",
            iconBg: "bg-amber-50 text-amber-600",
          },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i}
              className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 overflow-hidden relative group">
              <div className={`absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r ${s.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              <div className={`inline-flex p-3 rounded-2xl mb-4 ${s.iconBg}`}>
                <Icon size={20} />
              </div>
              <p className="text-sm text-gray-500 font-medium mb-1">{s.label}</p>
              <p className="text-3xl font-extrabold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-400 mt-1">{s.sub}</p>
            </div>
          );
        })}
      </div>

      {/* ── Main grid ── */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* My Donations */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">💳</span>
              <h3 className="font-extrabold text-gray-900">My Donations</h3>
            </div>
            <Link href="/donor/tracking" className="text-xs font-semibold text-[#00b964] hover:underline">
              View all →
            </Link>
          </div>

          <div className="divide-y divide-gray-50">
            {loading && [1,2,3].map(i => (
              <div key={i} className="px-6 py-4 flex justify-between animate-pulse">
                <div className="space-y-2 flex-1">
                  <div className="h-3.5 bg-gray-100 rounded-full w-3/4" />
                  <div className="h-3 bg-gray-100 rounded-full w-1/3" />
                </div>
                <div className="h-4 bg-gray-100 rounded-full w-16 ml-4" />
              </div>
            ))}

            {!loading && myDonations.length === 0 && (
              <div className="text-center py-12 px-6">
                <div className="text-5xl mb-3">🎯</div>
                <p className="font-bold text-gray-700 mb-1">No donations yet</p>
                <p className="text-sm text-gray-400 mb-4">Start making a difference today</p>
                <Link href="/donor/home"
                  className="inline-flex items-center gap-1.5 bg-[#00b964] text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-[#00a356] transition">
                  Explore Campaigns <ArrowRight size={12} />
                </Link>
              </div>
            )}

            {myDonations.map((d, i) => (
              <div key={d.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition group">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm shrink-0"
                    style={{ background: `hsl(${(i * 47) % 360},70%,92%)` }}>
                    {["💚","💙","💜","🧡","❤️","💛"][i % 6]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800 line-clamp-1 group-hover:text-[#00b964] transition-colors">
                      {d.campaign_title}
                    </p>
                    <p className="text-xs text-gray-400">{fmtDate(d.donated_at)}</p>
                  </div>
                </div>
                <span className="text-sm font-extrabold text-[#00b964] whitespace-nowrap ml-3">
                  {fmtINR(d.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Active Campaigns */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">🔥</span>
              <h3 className="font-extrabold text-gray-900">Active Campaigns</h3>
            </div>
            <Link href="/donor/home" className="text-xs font-semibold text-[#00b964] hover:underline">
              See all →
            </Link>
          </div>

          <div className="p-4 space-y-3">
            {loading && [1,2,3].map(i => (
              <div key={i} className="rounded-2xl p-4 animate-pulse bg-gray-50 h-20" />
            ))}

            {!loading && campaigns.length === 0 && (
              <div className="text-center py-10">
                <p className="text-gray-400 text-sm">No active campaigns yet</p>
              </div>
            )}

            {campaigns.map((c) => {
              const pct  = c.goal_amount > 0 ? Math.min(100, Math.round((c.raised_amount / c.goal_amount) * 100)) : 0;
              const meta = CATEGORY_META[c.category] || CATEGORY_META["General"];
              return (
                <Link key={c.id} href={`/donor/campaign/${c.id}`}>
                  <div className="group rounded-2xl border-2 border-gray-100 hover:border-[#00b964] p-4 transition-all duration-200 hover:bg-green-50/30 cursor-pointer">
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${meta.gradient} flex items-center justify-center text-lg shrink-0`}>
                        {meta.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 line-clamp-1 group-hover:text-[#00b964] transition-colors">
                          {c.title}
                        </p>
                        <p className="text-xs text-gray-400">{c.category}</p>
                      </div>
                      <span className="text-xs font-extrabold text-[#00b964] shrink-0">{pct}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div className="h-1.5 rounded-full transition-all duration-700"
                        style={{
                          width: `${pct}%`,
                          background: pct >= 75 ? "linear-gradient(90deg,#00b964,#00d4aa)" :
                                      pct >= 40 ? "linear-gradient(90deg,#f59e0b,#f97316)" :
                                                  "linear-gradient(90deg,#3b82f6,#6366f1)",
                        }} />
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-1.5">
                      <span className="font-semibold text-[#00b964]">{fmtINR(c.raised_amount)} raised</span>
                      <span>of {fmtINR(c.goal_amount)}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

      </div>

      {/* ── Impact card ── */}
      {totalDonated > 0 && (
        <div className="rounded-3xl overflow-hidden relative"
          style={{ background: "linear-gradient(135deg,#00b964,#00d4aa 50%,#0069ff)" }}>
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
          <div className="relative z-10 px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-green-100 text-sm mb-1 font-medium">✨ Your total impact</p>
              <p className="text-5xl font-extrabold text-white mb-2">{fmtINR(totalDonated)}</p>
              <p className="text-green-100 text-sm">
                Donated across <span className="text-white font-bold">{uniqueCampaigns}</span> campaign{uniqueCampaigns !== 1 ? "s" : ""}.
                Every rupee is tracked transparently.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-5xl border-4 border-white/30 shadow-xl">
                🌟
              </div>
              <p className="text-white/80 text-xs mt-2 font-semibold">Impact Star</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
