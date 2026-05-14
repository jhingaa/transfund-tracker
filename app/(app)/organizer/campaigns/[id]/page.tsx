"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getCampaign, getCampaignDonations, closeCampaign, fmtINR, fmtDate } from "@/lib/api";
import { ArrowLeft, Users, Target, Clock, CheckCircle, TrendingUp, XCircle, ShieldOff } from "lucide-react";
import Link from "next/link";

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
  image_url: string | null; created_at: string; close_reason?: string | null;
  daily_donor_limit?: number | null;
};

type Donation = {
  id: number; donor_name: string; donor_email: string; amount: number; donated_at: string;
};

export default function CampaignDetail() {
  const { id } = useParams();
  const [campaign, setCampaign]   = useState<Campaign | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading]     = useState(true);

  const [showEndModal, setShowEndModal]   = useState(false);
  const [closeReason, setCloseReason]     = useState("");
  const [closing, setClosing]             = useState(false);
  const [endSuccess, setEndSuccess]       = useState(false);

  const loadData = () => {
    if (!id) return;
    Promise.all([getCampaign(Number(id)), getCampaignDonations(Number(id))])
      .then(([c, d]) => { setCampaign(c); setDonations(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, [id]);

  const handleEndCampaign = async () => {
    if (!closeReason.trim()) return;
    setClosing(true);
    try {
      await closeCampaign(Number(id), closeReason.trim());
      setEndSuccess(true);
      setTimeout(() => {
        setShowEndModal(false);
        setEndSuccess(false);
        setCloseReason("");
        loadData();
      }, 1800);
    } catch {
      // keep modal open on error
    } finally {
      setClosing(false);
    }
  };

  if (loading) return (
    <div className="space-y-5 max-w-5xl animate-pulse">
      <div className="h-8 w-40 bg-gray-100 rounded-full" />
      <div className="h-28 bg-white rounded-3xl" />
      <div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-24 bg-white rounded-2xl" />)}</div>
      <div className="h-64 bg-white rounded-3xl" />
    </div>
  );

  if (!campaign) return (
    <div className="text-center py-20">
      <div className="text-5xl mb-3">😕</div>
      <p className="text-gray-400 mb-4">Campaign not found</p>
      <Link href="/organizer/campaigns"
        className="inline-flex items-center gap-2 bg-[#00b964] text-white font-bold px-5 py-2.5 rounded-full text-sm hover:bg-[#00a356] transition">
        <ArrowLeft size={14} /> Back to campaigns
      </Link>
    </div>
  );

  const pct         = campaign.goal_amount > 0 ? Math.min(100, Math.round((campaign.raised_amount / campaign.goal_amount) * 100)) : 0;
  const isActive    = campaign.status === "active";
  const totalDonors = new Set(donations.map(d => d.donor_email)).size;
  const meta        = CATEGORY_META[campaign.category] || CATEGORY_META["General"];

  return (
    <div className="space-y-6 max-w-5xl pb-12">

      {/* Back */}
      <Link href="/organizer/campaigns"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#00b964] font-medium transition">
        <ArrowLeft size={15} /> Back to Campaigns
      </Link>

      {/* ── Header card ── */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="h-1.5" style={{ background: "linear-gradient(90deg,#00b964,#00d4aa,#0069ff)" }} />

        <div className="p-6 flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            {/* Category icon */}
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${meta.gradient} flex items-center justify-center text-2xl shrink-0`}>
              {meta.emoji}
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-gray-900 mb-1">{campaign.title}</h1>
              <p className="text-sm text-gray-400 line-clamp-2 max-w-lg">{campaign.description}</p>
              {!isActive && campaign.close_reason && (
                <div className="mt-2 inline-flex items-center gap-1.5 bg-red-50 text-red-600 px-3 py-1.5 rounded-xl text-xs border border-red-100 font-medium">
                  <XCircle size={12} /> Ended: {campaign.close_reason}
                </div>
              )}
              {campaign.daily_donor_limit && (
                <div className="mt-2 inline-flex items-center gap-1.5 bg-green-50 text-[#00b964] px-3 py-1.5 rounded-xl text-xs border border-green-100 font-medium">
                  🛡 Daily limit: {fmtINR(campaign.daily_donor_limit)}/donor
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-bold ${
              isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
            }`}>
              {isActive ? <Clock size={11} /> : <CheckCircle size={11} />}
              {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
            </span>

            {isActive && (
              <button
                onClick={() => setShowEndModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border-2 border-red-200 text-red-600 bg-red-50 hover:bg-red-100 hover:border-red-300 transition-all"
              >
                <ShieldOff size={14} /> End Campaign
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Raised",        value: fmtINR(campaign.raised_amount), icon: TrendingUp, bg: "bg-green-50",  iconCls: "bg-green-100 text-[#00b964]",  text: "text-[#00b964]" },
          { label: "Goal",          value: fmtINR(campaign.goal_amount),   icon: Target,     bg: "bg-blue-50",   iconCls: "bg-blue-100 text-blue-600",    text: "text-blue-700" },
          { label: "Progress",      value: `${pct}%`,                      icon: CheckCircle,bg: "bg-amber-50",  iconCls: "bg-amber-100 text-amber-600",  text: "text-amber-700" },
          { label: "Unique Donors", value: `${totalDonors}`,               icon: Users,      bg: "bg-purple-50", iconCls: "bg-purple-100 text-purple-600",text: "text-purple-700" },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className={`${s.bg} p-5 rounded-2xl border border-white shadow-sm`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${s.iconCls}`}>
                <Icon size={16} />
              </div>
              <p className="text-xs text-gray-500 font-medium">{s.label}</p>
              <p className={`text-2xl font-extrabold mt-0.5 ${s.text}`}>{s.value}</p>
            </div>
          );
        })}
      </div>

      {/* ── Progress bar ── */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-bold text-gray-800">{pct}% funded</span>
          <span className="text-gray-400">
            {campaign.raised_amount < campaign.goal_amount
              ? `${fmtINR(campaign.goal_amount - campaign.raised_amount)} to go`
              : "Goal reached! 🎉"}
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
          <div className="h-3 rounded-full transition-all duration-700"
            style={{
              width: `${pct}%`,
              background: pct >= 75 ? "linear-gradient(90deg,#00b964,#00d4aa)" :
                          pct >= 40 ? "linear-gradient(90deg,#f59e0b,#f97316)" :
                                      "linear-gradient(90deg,#3b82f6,#6366f1)",
            }} />
        </div>
      </div>

      {/* ── Donation Ledger ── */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">💳</span>
            <h3 className="font-extrabold text-gray-900">Donation History</h3>
          </div>
          <span className="bg-green-100 text-[#00b964] text-xs font-bold px-2.5 py-1 rounded-full">
            {donations.length} donations
          </span>
        </div>

        {donations.length === 0 ? (
          <div className="text-center py-16 px-6">
            <div className="text-5xl mb-3">💤</div>
            <p className="font-bold text-gray-600 mb-1">No donations yet</p>
            <p className="text-xs text-gray-400">Share your campaign to start receiving donations</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs text-gray-400 uppercase tracking-wider bg-gray-50/50">
                  <th className="px-6 py-3 font-semibold">#</th>
                  <th className="px-6 py-3 font-semibold">Donor</th>
                  <th className="px-6 py-3 font-semibold">Email</th>
                  <th className="px-6 py-3 font-semibold">Amount</th>
                  <th className="px-6 py-3 font-semibold">Date</th>
                  <th className="px-6 py-3 font-semibold">Time</th>
                </tr>
              </thead>
              <tbody>
                {donations.map((d, i) => {
                  const dt = new Date(d.donated_at);
                  return (
                    <tr key={d.id} className="border-b border-gray-50 hover:bg-green-50/30 transition group">
                      <td className="px-6 py-4 text-gray-300 font-mono text-xs">{i + 1}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0"
                            style={{ background: `hsl(${(i * 53) % 360},65%,55%)` }}>
                            {d.donor_name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-semibold text-gray-900 group-hover:text-[#00b964] transition-colors">{d.donor_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-xs">{d.donor_email}</td>
                      <td className="px-6 py-4 font-extrabold text-[#00b964]">{fmtINR(d.amount)}</td>
                      <td className="px-6 py-4 text-gray-500">{fmtDate(d.donated_at)}</td>
                      <td className="px-6 py-4 text-gray-300 text-xs">
                        {dt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Meta footer */}
      <div className="flex items-center gap-4 text-xs text-gray-400 px-1">
        <span>Category: <span className="font-semibold text-gray-600">{campaign.category}</span></span>
        <span>•</span>
        <span>Created: <span className="font-semibold text-gray-600">{fmtDate(campaign.created_at)}</span></span>
        <span>•</span>
        <span>Campaign ID: <span className="font-semibold text-gray-600">#{campaign.id}</span></span>
      </div>

      {/* ── End Campaign Modal ── */}
      {showEndModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden"
            style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.15)" }}>
            <div className="h-1.5 w-full" style={{ background: "linear-gradient(90deg,#ef4444,#f97316)" }} />

            <div className="p-8">
              {endSuccess ? (
                <div className="text-center py-4">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={36} className="text-[#00b964]" />
                  </div>
                  <h3 className="text-xl font-extrabold text-gray-900 mb-1">Campaign Ended</h3>
                  <p className="text-gray-400 text-sm">No more donations will be accepted.</p>
                </div>
              ) : (
                <>
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center shrink-0">
                      <ShieldOff size={22} className="text-red-500" />
                    </div>
                    <div>
                      <h3 className="text-xl font-extrabold text-gray-900 mb-1">End Campaign?</h3>
                      <p className="text-sm text-gray-400">
                        This will stop accepting donations immediately. This action cannot be undone.
                      </p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Reason for ending <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      value={closeReason}
                      onChange={(e) => setCloseReason(e.target.value)}
                      placeholder="e.g. Goal reached, funds sufficient, or circumstances changed…"
                      rows={3}
                      className="w-full border-2 border-gray-100 bg-gray-50 p-3.5 rounded-2xl text-sm focus:outline-none focus:border-red-300 focus:bg-white transition-all resize-none"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => { setShowEndModal(false); setCloseReason(""); }}
                      className="flex-1 py-3 rounded-2xl text-sm font-bold text-gray-500 border-2 border-gray-100 hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleEndCampaign}
                      disabled={closing || !closeReason.trim()}
                      className="flex-1 py-3 rounded-2xl text-sm font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      style={{ background: "linear-gradient(135deg,#ef4444,#f97316)", boxShadow: "0 8px 20px rgba(239,68,68,0.3)" }}
                    >
                      {closing
                        ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Ending…</>
                        : <><ShieldOff size={15} /> End Campaign</>
                      }
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
