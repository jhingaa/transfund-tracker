"use client";

import { useState, useEffect } from "react";
import { getCampaigns, getOrganizerDonations, getStoredUser, fmtINR, fmtDate } from "@/lib/api";
import DailyDonationChart from "@/components/DailyDonationChart";
import Link from "next/link";
import { TrendingUp, Users, Target, CheckCircle, Clock, ArrowRight, PlusCircle } from "lucide-react";

const CATEGORY_META: Record<string, { emoji: string; gradient: string }> = {
  Education:  { emoji: "🎓", gradient: "from-blue-400 to-indigo-500" },
  Medical:    { emoji: "🏥", gradient: "from-rose-400 to-pink-500" },
  Events:     { emoji: "🎉", gradient: "from-purple-400 to-violet-500" },
  NGOs:       { emoji: "🌍", gradient: "from-teal-400 to-cyan-500" },
  Community:  { emoji: "🤝", gradient: "from-amber-400 to-orange-500" },
  Emergency:  { emoji: "🚨", gradient: "from-orange-400 to-red-500" },
  General:    { emoji: "💡", gradient: "from-gray-400 to-slate-500" },
  Others:     { emoji: "✨", gradient: "from-slate-400 to-indigo-400" },
};

export default function OrganizerDashboard() {
  const [loading, setLoading]             = useState(true);
  const [stats, setStats]                 = useState({ campaigns: 0, donations: 0, raised: 0 });
  const [recentDonations, setRecentDonations] = useState<any[]>([]);
  const [campaigns, setCampaigns]         = useState<any[]>([]);
  const [chartData, setChartData]         = useState<any[]>([]);
  const [userName, setUserName]           = useState("");

  useEffect(() => {
    const user = getStoredUser();
    if (!user || user.role !== "organizer") { setLoading(false); return; }
    setUserName(user.name?.split(" ")[0] || "");

    Promise.all([
      getCampaigns({ organizer_email: user.email }),
      getOrganizerDonations(user.email),
    ]).then(([campData, donData]) => {
      setCampaigns(campData);

      const allDonations: any[] = [];
      let totalRaised = 0;
      donData.forEach((c: any) => {
        c.donations.forEach((d: any) => {
          allDonations.push({ ...d, campaign_title: c.campaign_title });
          totalRaised += d.amount;
        });
      });
      allDonations.sort((a, b) => new Date(b.donated_at).getTime() - new Date(a.donated_at).getTime());

      setStats({ campaigns: campData.length, donations: allDonations.length, raised: totalRaised });
      setRecentDonations(allDonations.slice(0, 6));

      const dailyMap: Record<string, { amount: number; donors: number }> = {};
      allDonations.forEach((d) => {
        const dateStr = new Date(d.donated_at).toISOString().split("T")[0];
        if (!dailyMap[dateStr]) dailyMap[dateStr] = { amount: 0, donors: 0 };
        dailyMap[dateStr].amount  += d.amount;
        dailyMap[dateStr].donors  += 1;
      });
      setChartData(
        Object.entries(dailyMap)
          .map(([date, data]) => ({ date, ...data }))
          .sort((a, b) => a.date.localeCompare(b.date))
      );
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-7 pb-10">

      {/* ── Hero banner ── */}
      <div className="relative rounded-3xl overflow-hidden"
        style={{ background: "linear-gradient(135deg,#00b964,#00d4aa 55%,#0069ff)" }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        <div className="absolute top-[-40px] right-[-40px] w-48 h-48 rounded-full bg-white/10 blur-2xl" />

        <div className="relative z-10 px-8 py-7 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div>
            <p className="text-green-100 text-sm font-medium mb-1">Organizer Dashboard</p>
            <h1 className="text-3xl font-extrabold text-white mb-2">
              {userName ? `Hey, ${userName}! 👋` : "Welcome back! 👋"}
            </h1>
            <p className="text-green-100 text-sm max-w-sm">
              Your real-time donation and campaign analytics — all in one place.
            </p>
            <Link href="/organizer/create"
              className="mt-5 inline-flex items-center gap-2 bg-white text-[#00b964] font-bold px-5 py-2.5 rounded-full text-sm hover:-translate-y-0.5 shadow-lg transition-all"
              style={{ transition: "all 0.2s ease" }}>
              <PlusCircle size={15} /> New Campaign
            </Link>
          </div>

          <div className="flex gap-3 shrink-0">
            {[
              { icon: "📣", label: "Campaigns",  value: stats.campaigns },
              { icon: "💰", label: "Total Raised", value: fmtINR(stats.raised) },
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
          { label: "Total Campaigns", value: stats.campaigns,     icon: Target,    gradient: "from-[#00b964] to-[#00d4aa]", iconBg: "bg-green-50 text-[#00b964]",   sub: "created by you" },
          { label: "Total Donations", value: stats.donations,     icon: Users,     gradient: "from-blue-500 to-indigo-500",  iconBg: "bg-blue-50 text-blue-600",     sub: "from all donors" },
          { label: "Funds Raised",    value: fmtINR(stats.raised), icon: TrendingUp, gradient: "from-amber-500 to-orange-500", iconBg: "bg-amber-50 text-amber-600", sub: "across all campaigns" },
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

      {/* ── Chart + campaigns + donations ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left col: chart + campaigns */}
        <div className="lg:col-span-2 space-y-6">

          {/* Chart */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <DailyDonationChart data={chartData} />
          </div>

          {/* Campaigns */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">📣</span>
                <h3 className="font-extrabold text-gray-900">Recent Campaigns</h3>
              </div>
              <Link href="/organizer/campaigns"
                className="text-xs font-semibold text-[#00b964] hover:underline flex items-center gap-1">
                View all <ArrowRight size={12} />
              </Link>
            </div>

            <div className="p-4 space-y-3">
              {loading && [1,2,3].map(i => (
                <div key={i} className="rounded-2xl p-4 animate-pulse bg-gray-50 h-20" />
              ))}

              {!loading && campaigns.length === 0 && (
                <div className="text-center py-10">
                  <div className="text-4xl mb-2">📭</div>
                  <p className="text-gray-400 text-sm mb-3">No campaigns yet</p>
                  <Link href="/organizer/create"
                    className="inline-flex items-center gap-1.5 bg-[#00b964] text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-[#00a356] transition">
                    <PlusCircle size={12} /> Create one
                  </Link>
                </div>
              )}

              {campaigns.slice(0, 4).map((c) => {
                const pct      = c.goal_amount > 0 ? Math.min(100, Math.round((c.raised_amount / c.goal_amount) * 100)) : 0;
                const isActive = c.status === "active";
                const meta     = CATEGORY_META[c.category] || CATEGORY_META["General"];
                return (
                  <Link key={c.id} href={`/organizer/campaigns/${c.id}`} className="block group">
                    <div className="p-4 rounded-2xl border-2 border-gray-100 hover:border-[#00b964] hover:bg-green-50/30 transition-all duration-200">
                      <div className="flex items-start gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${meta.gradient} flex items-center justify-center text-lg shrink-0`}>
                          {meta.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <h4 className="font-bold text-gray-900 group-hover:text-[#00b964] transition-colors text-sm line-clamp-1">{c.title}</h4>
                            <span className="text-sm font-extrabold text-[#00b964] shrink-0">{fmtINR(c.raised_amount)}</span>
                          </div>
                          <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-semibold ${
                            isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                          }`}>
                            {isActive ? <Clock size={10} /> : <CheckCircle size={10} />}
                            {c.status}
                          </span>
                        </div>
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
                      <p className="text-xs text-gray-400 mt-1.5 text-right">{pct}% of {fmtINR(c.goal_amount)}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right col: live donations */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">💳</span>
              <h3 className="font-extrabold text-gray-900">Live Donations</h3>
            </div>
            <Link href="/organizer/donations"
              className="text-xs font-semibold text-[#00b964] hover:underline flex items-center gap-1">
              Ledger <ArrowRight size={12} />
            </Link>
          </div>

          <div className="divide-y divide-gray-50 flex-1">
            {loading && [1,2,3,4].map(i => (
              <div key={i} className="px-5 py-4 flex justify-between animate-pulse">
                <div className="space-y-2 flex-1">
                  <div className="h-3.5 bg-gray-100 rounded-full w-3/4" />
                  <div className="h-3 bg-gray-100 rounded-full w-1/2" />
                </div>
                <div className="h-4 bg-gray-100 rounded-full w-14 ml-4" />
              </div>
            ))}

            {!loading && recentDonations.length === 0 && (
              <div className="text-center py-16 px-6">
                <div className="text-5xl mb-3">💤</div>
                <p className="font-bold text-gray-700 mb-1">No donations yet</p>
                <p className="text-xs text-gray-400">Share your campaigns to start receiving donations</p>
              </div>
            )}

            {recentDonations.map((d, i) => (
              <div key={d.id} className="px-5 py-4 hover:bg-gray-50 transition group flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm shrink-0 font-bold text-white"
                  style={{ background: `hsl(${(i * 53) % 360},65%,55%)` }}>
                  {d.donor_name?.[0]?.toUpperCase() || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 group-hover:text-[#00b964] transition-colors">{d.donor_name}</p>
                  <p className="text-xs text-gray-400 line-clamp-1">→ {d.campaign_title}</p>
                  <p className="text-xs text-gray-300 mt-0.5">{fmtDate(d.donated_at)}</p>
                </div>
                <span className="text-sm font-extrabold text-[#00b964] shrink-0">{fmtINR(d.amount)}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
