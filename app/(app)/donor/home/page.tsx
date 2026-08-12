"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal, X, TrendingUp, Clock, Star, ChevronDown } from "lucide-react";
import { getCampaigns, fmtINR, getStoredUser, fileUrl } from "@/lib/api";

const CATEGORIES = ["All", "Education", "Medical", "Events", "NGOs", "Community", "Emergency", "Others"];

const CATEGORY_META: Record<string, { emoji: string; gradient: string; badge: string }> = {
  Education:  { emoji: "🎓", gradient: "from-blue-400 to-indigo-500",   badge: "bg-blue-50 text-blue-700 border-blue-200" },
  Medical:    { emoji: "🏥", gradient: "from-rose-400 to-pink-500",     badge: "bg-rose-50 text-rose-700 border-rose-200" },
  Events:     { emoji: "🎉", gradient: "from-purple-400 to-violet-500", badge: "bg-purple-50 text-purple-700 border-purple-200" },
  NGOs:       { emoji: "🌍", gradient: "from-teal-400 to-cyan-500",     badge: "bg-teal-50 text-teal-700 border-teal-200" },
  Community:  { emoji: "🤝", gradient: "from-amber-400 to-orange-500",  badge: "bg-amber-50 text-amber-700 border-amber-200" },
  Emergency:  { emoji: "🚨", gradient: "from-orange-400 to-red-500",    badge: "bg-orange-50 text-orange-700 border-orange-200" },
  General:    { emoji: "💡", gradient: "from-gray-400 to-slate-500",    badge: "bg-gray-50 text-gray-700 border-gray-200" },
  Others:     { emoji: "✨", gradient: "from-slate-400 to-indigo-400",  badge: "bg-slate-50 text-slate-700 border-slate-200" },
};

const SORT_OPTIONS = [
  { label: "Newest First",     value: "newest" },
  { label: "Most Funded",      value: "most_funded" },
  { label: "Closest to Goal",  value: "closest" },
  { label: "Highest Goal",     value: "highest_goal" },
];

type Campaign = {
  id: number; title: string; description: string; category: string;
  goal_amount: number; raised_amount: number; status: string;
  image_url: string | null; created_at: string;
};

export default function DonorHome() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [filtered, setFiltered]   = useState<Campaign[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [search, setSearch]       = useState("");
  const [category, setCategory]   = useState("All");
  const [sortBy, setSortBy]       = useState("newest");
  const [showSort, setShowSort]   = useState(false);

  const user = getStoredUser();

  useEffect(() => {
    getCampaigns()
      .then((d) => { setCampaigns(d); setFiltered(d); })
      .catch(() => setError("Could not reach the server. Is the backend running?"))
      .finally(() => setLoading(false));
  }, []);

  const applyFilters = useCallback(() => {
    let r = [...campaigns];
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter((c) => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q));
    }
    if (category !== "All") r = r.filter((c) => c.category === category);
    if (sortBy === "most_funded")  r.sort((a, b) => b.raised_amount - a.raised_amount);
    else if (sortBy === "closest") r.sort((a, b) => (b.raised_amount / b.goal_amount) - (a.raised_amount / a.goal_amount));
    else if (sortBy === "highest_goal") r.sort((a, b) => b.goal_amount - a.goal_amount);
    else r.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    setFiltered(r);
  }, [campaigns, search, category, sortBy]);

  useEffect(() => { applyFilters(); }, [applyFilters]);

  const featured = filtered.slice(0, 3);
  const trending = [...filtered].sort((a, b) => b.raised_amount - a.raised_amount).slice(0, 3);
  const recent   = [...filtered].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 3);

  return (
    <div className="space-y-8 pb-12">

      {/* ── Welcome Banner ── */}
      <div className="rounded-3xl overflow-hidden relative"
        style={{ background: "linear-gradient(135deg,#00b964,#00d4aa 60%,#0069ff)" }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="relative px-8 py-8 flex items-center justify-between">
          <div>
            <p className="text-green-100 text-sm font-medium mb-1">
              {user ? `Welcome back, ${user.name.split(" ")[0]} 👋` : "Welcome 👋"}
            </p>
            <h1 className="text-2xl font-extrabold text-white mb-1">Explore Campaigns</h1>
            <p className="text-green-100 text-sm">Find a cause you care about and make a difference today.</p>
          </div>
          <div className="hidden md:flex gap-4 text-center">
            <div className="bg-white/20 backdrop-blur rounded-2xl px-5 py-3">
              <p className="text-2xl font-extrabold text-white">{campaigns.length}</p>
              <p className="text-green-100 text-xs mt-0.5">Live Campaigns</p>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-2xl px-5 py-3">
              <p className="text-2xl font-extrabold text-white">0%</p>
              <p className="text-green-100 text-xs mt-0.5">Platform Fee</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Search + Sort ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex gap-3 items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            id="search-campaigns"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search campaigns by name or keyword…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-gray-100 bg-gray-50 text-sm focus:outline-none focus:border-[#00b964] focus:bg-white transition-all duration-200"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Sort dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowSort(!showSort)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-gray-100 bg-gray-50 hover:border-[#00b964] text-sm font-medium text-gray-700 transition-all duration-200 whitespace-nowrap"
          >
            <SlidersHorizontal size={15} />
            {SORT_OPTIONS.find(o => o.value === sortBy)?.label}
            <ChevronDown size={13} className={`transition-transform duration-200 ${showSort ? "rotate-180" : ""}`} />
          </button>
          {showSort && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-30">
              {SORT_OPTIONS.map((o) => (
                <button key={o.value} onClick={() => { setSortBy(o.value); setShowSort(false); }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition ${sortBy === o.value ? "text-[#00b964] font-bold bg-green-50" : "text-gray-700 hover:bg-gray-50"}`}>
                  {o.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Category Pills ── */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map((cat) => {
          const meta = CATEGORY_META[cat];
          const active = category === cat;
          return (
            <button key={cat} onClick={() => setCategory(cat)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all duration-200 ${
                active
                  ? "text-white border-transparent shadow-md"
                  : "bg-white border-gray-100 text-gray-600 hover:border-[#00b964] hover:text-[#00b964]"
              }`}
              style={active ? { background: "linear-gradient(135deg,#00b964,#00d4aa)", boxShadow: "0 4px 12px rgba(0,185,100,0.3)" } : {}}>
              {meta ? meta.emoji : "✨"} {cat}
            </button>
          );
        })}
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 text-red-700 rounded-2xl p-4 text-sm flex items-center gap-2">
          ⚠️ {error}
        </div>
      )}

      {/* ── Loading skeletons ── */}
      {loading && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-sm animate-pulse">
              <div className="h-44 bg-gray-100" />
              <div className="p-5 space-y-3">
                <div className="h-4 bg-gray-100 rounded-full w-3/4" />
                <div className="h-3 bg-gray-100 rounded-full w-full" />
                <div className="h-3 bg-gray-100 rounded-full w-2/3" />
                <div className="h-2 bg-gray-100 rounded-full w-full mt-4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Empty state ── */}
      {!loading && !error && filtered.length === 0 && (
        <div className="text-center py-24">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-xl font-bold text-gray-700 mb-2">No campaigns found</p>
          <p className="text-sm text-gray-400">Try adjusting your search or pick a different category</p>
        </div>
      )}

      {/* ── Featured ── */}
      {!loading && featured.length > 0 && (
        <Section title="Featured Campaigns" emoji="⭐" color="text-amber-500">
          {featured.map((c) => <CampaignCard key={c.id} campaign={c} />)}
        </Section>
      )}

      {/* ── Trending ── */}
      {!loading && trending.length > 0 && (
        <Section title="Trending Now" emoji="🔥" color="text-[#00b964]">
          {trending.map((c) => <CampaignCard key={c.id} campaign={c} />)}
        </Section>
      )}

      {/* ── Recently Added ── */}
      {!loading && recent.length > 0 && (
        <Section title="Recently Added" emoji="🆕" color="text-blue-500">
          {recent.map((c) => <CampaignCard key={c.id} campaign={c} />)}
        </Section>
      )}
    </div>
  );
}

function Section({ title, emoji, color, children }: {
  title: string; emoji: string; color: string; children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2.5 mb-5">
        <span className="text-xl">{emoji}</span>
        <h2 className={`text-xl font-extrabold ${color}`}>{title}</h2>
        <div className="flex-1 h-px bg-gray-100 ml-2" />
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">{children}</div>
    </div>
  );
}

function CampaignCard({ campaign }: { campaign: Campaign }) {
  const pct  = campaign.goal_amount > 0 ? Math.min(100, Math.round((campaign.raised_amount / campaign.goal_amount) * 100)) : 0;
  const meta = CATEGORY_META[campaign.category] || CATEGORY_META["General"];

  return (
    <Link href={`/donor/campaign/${campaign.id}`}>
      <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-250 cursor-pointer h-full flex flex-col group">

        {/* Image / Placeholder */}
        <div className={`h-44 relative overflow-hidden bg-gradient-to-br ${meta.gradient}`}>
          {campaign.image_url ? (
            <img src={fileUrl(campaign.image_url!)} alt={campaign.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl opacity-60 group-hover:scale-110 transition-transform duration-300">
              {meta.emoji}
            </div>
          )}
          {/* Category badge */}
          <span className={`absolute top-3 left-3 text-xs px-3 py-1 rounded-full font-bold border ${meta.badge} backdrop-blur-sm`}>
            {meta.emoji} {campaign.category}
          </span>
          {/* Status badge */}
          {campaign.status !== "active" && (
            <span className="absolute top-3 right-3 text-xs px-3 py-1 rounded-full font-bold bg-gray-900/70 text-white backdrop-blur-sm">
              {campaign.status}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1">
          <h3 className="font-extrabold text-gray-900 mb-1.5 line-clamp-1 group-hover:text-[#00b964] transition-colors duration-200">
            {campaign.title}
          </h3>
          <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-1 leading-relaxed">
            {campaign.description}
          </p>

          {/* Progress bar */}
          <div className="w-full bg-gray-100 rounded-full h-2 mb-2.5 overflow-hidden">
            <div
              className="h-2 rounded-full transition-all duration-700"
              style={{
                width: `${pct}%`,
                background: pct >= 75 ? "linear-gradient(90deg,#00b964,#00d4aa)" :
                            pct >= 40 ? "linear-gradient(90deg,#f59e0b,#f97316)" :
                                        "linear-gradient(90deg,#3b82f6,#6366f1)",
              }}
            />
          </div>

          {/* Raised / Goal */}
          <div className="flex justify-between items-center text-xs">
            <span className="font-extrabold text-[#00b964]">{fmtINR(campaign.raised_amount)} raised</span>
            <span className="text-gray-400 font-medium">{pct}% of {fmtINR(campaign.goal_amount)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
