"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getCampaigns, deleteCampaign, getStoredUser, fmtINR } from "@/lib/api";
import { PlusCircle, CheckCircle, Clock, ArrowRight, Trash2 } from "lucide-react";

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
  id: number;
  title: string;
  description: string;
  category: string;
  goal_amount: number;
  raised_amount: number;
  status: string;
  image_url: string | null;
  created_at: string;
};

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState<"all" | "active" | "completed">("all");
  const [deleting, setDeleting]   = useState<number | null>(null);

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Delete this campaign? This cannot be undone.")) return;
    setDeleting(id);
    try {
      await deleteCampaign(id);
      setCampaigns((prev) => prev.filter((c) => c.id !== id));
    } catch {
      alert("Failed to delete campaign.");
    } finally {
      setDeleting(null);
    }
  };

  useEffect(() => {
    const user = getStoredUser();
    getCampaigns(user?.email ? { organizer_email: user.email } : undefined)
      .then(setCampaigns)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered  = campaigns.filter((c) => filter === "all" ? true : c.status === filter);
  const active    = campaigns.filter((c) => c.status === "active").length;
  const completed = campaigns.filter((c) => c.status === "completed").length;

  return (
    <div className="space-y-6 pb-10">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-[#00b964] font-semibold mb-0.5">Organizer Panel</p>
          <h1 className="text-2xl font-extrabold text-gray-900">My Campaigns</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            <span className="text-green-600 font-semibold">{active}</span> active ·{" "}
            <span className="text-gray-500 font-semibold">{completed}</span> completed
          </p>
        </div>
        <Link
          href="/organizer/create"
          className="inline-flex items-center gap-2 text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all hover:-translate-y-0.5"
          style={{ background: "linear-gradient(135deg,#00b964,#00d4aa)", boxShadow: "0 6px 16px rgba(0,185,100,0.35)" }}
        >
          <PlusCircle size={15} /> New Campaign
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(["all", "active", "completed"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all capitalize ${
              filter === f
                ? "text-white shadow-md"
                : "bg-white border-2 border-gray-100 text-gray-500 hover:border-[#00b964] hover:text-[#00b964]"
            }`}
            style={filter === f ? { background: "linear-gradient(135deg,#00b964,#00d4aa)" } : {}}
          >
            {f === "all" ? `All (${campaigns.length})` : f === "active" ? `Active (${active})` : `Completed (${completed})`}
          </button>
        ))}
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1,2,3].map(i => (
            <div key={i} className="bg-white rounded-3xl overflow-hidden animate-pulse">
              <div className="h-44 bg-gray-100" />
              <div className="p-5 space-y-3">
                <div className="h-4 bg-gray-100 rounded-full w-3/4" />
                <div className="h-3 bg-gray-100 rounded-full w-full" />
                <div className="h-3 bg-gray-100 rounded-full w-2/3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div className="text-center py-20">
          <div className="text-5xl mb-3">📭</div>
          <p className="font-bold text-gray-700 mb-1">
            No {filter !== "all" ? filter : ""} campaigns yet
          </p>
          <p className="text-sm text-gray-400 mb-5">Create your first campaign and start raising funds</p>
          <Link href="/organizer/create"
            className="inline-flex items-center gap-2 text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all"
            style={{ background: "linear-gradient(135deg,#00b964,#00d4aa)" }}>
            <PlusCircle size={14} /> Create Campaign
          </Link>
        </div>
      )}

      {/* Cards grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((c) => {
          const pct      = c.goal_amount > 0 ? Math.min(100, Math.round((c.raised_amount / c.goal_amount) * 100)) : 0;
          const isActive = c.status === "active";
          const meta     = CATEGORY_META[c.category] || CATEGORY_META["General"];

          return (
            <Link key={c.id} href={`/organizer/campaigns/${c.id}`} className="block group">
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 overflow-hidden flex flex-col">

                {/* ── Cover image / gradient banner ── */}
                <div className="h-44 relative overflow-hidden shrink-0">
                  {c.image_url ? (
                    <img
                      src={`http://localhost:8000${c.image_url}`}
                      alt={c.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${meta.gradient} flex items-center justify-center text-6xl`}>
                      {meta.emoji}
                    </div>
                  )}
                  {/* Overlay gradient for text legibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                  {/* Status badge */}
                  <span className={`absolute top-3 left-3 inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-bold backdrop-blur-sm ${
                    isActive ? "bg-green-500/90 text-white" : "bg-black/50 text-white"
                  }`}>
                    {isActive ? <Clock size={10} /> : <CheckCircle size={10} />}
                    {isActive ? "Active" : "Completed"}
                  </span>

                  {/* Category badge */}
                  <span className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs px-2.5 py-1 rounded-full font-semibold">
                    {meta.emoji} {c.category}
                  </span>
                </div>

                {/* ── Card body ── */}
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-extrabold text-gray-900 text-base mb-1 line-clamp-1 group-hover:text-[#00b964] transition-colors">
                    {c.title}
                  </h3>
                  <p className="text-sm text-gray-400 mb-4 line-clamp-2 flex-1">{c.description}</p>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="font-bold text-[#00b964]">{fmtINR(c.raised_amount)} raised</span>
                      <span className="text-gray-400">{pct}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-1.5 rounded-full transition-all duration-700"
                        style={{
                          width: `${pct}%`,
                          background: pct >= 75 ? "linear-gradient(90deg,#00b964,#00d4aa)" :
                                      pct >= 40 ? "linear-gradient(90deg,#f59e0b,#f97316)" :
                                                  "linear-gradient(90deg,#3b82f6,#6366f1)",
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">of {fmtINR(c.goal_amount)} goal</p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-50">
                    <span>ID #{c.id}</span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => handleDelete(e, c.id)}
                        disabled={deleting === c.id}
                        className="flex items-center gap-1 text-red-400 hover:text-red-600 font-bold transition-colors disabled:opacity-50"
                      >
                        <Trash2 size={12} />
                        {deleting === c.id ? "Deleting…" : "Delete"}
                      </button>
                      <span className="flex items-center gap-1 text-[#00b964] font-bold group-hover:gap-2 transition-all">
                        View Details <ArrowRight size={11} />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
