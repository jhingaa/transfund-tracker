"use client";

import { useState, useEffect, use } from "react";
import { getCampaign, makeDonation, getCampaignDonations, getStoredUser, fmtINR, fmtDate } from "@/lib/api";
import { ArrowLeft, Users, Heart, CheckCircle, Target, TrendingUp, Clock } from "lucide-react";
import Link from "next/link";
import CampaignUpdatesFeed from "@/components/CampaignUpdatesFeed";

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

type Donation = {
  id: number;
  donor_name: string;
  donor_email: string;
  amount: number;
  donated_at: string;
};

const QUICK_AMOUNTS = [500, 1000, 2000, 5000];

export default function DonorCampaignDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [donateAmount, setDonateAmount] = useState("");
  const [donating, setDonating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [donateError, setDonateError] = useState("");
  const [limitPopup, setLimitPopup] = useState<{ limit: string; remaining: string } | null>(null);

  const user = getStoredUser();

  const loadData = async () => {
    try {
      const [c, d] = await Promise.all([
        getCampaign(Number(id)),
        getCampaignDonations(Number(id)),
      ]);
      setCampaign(c);
      setDonations(d);
    } catch {
      setError("Campaign not found or server unavailable.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [id]);

  const handleDonate = async () => {
    const amount = parseFloat(donateAmount);
    if (!amount || amount <= 0) return setDonateError("Enter a valid amount");
    if (!user) return setDonateError("Please log in to donate");

    setDonating(true);
    setDonateError("");
    try {
      await makeDonation({
        campaign_id: Number(id),
        donor_name: user.name,
        donor_email: user.email,
        amount,
      });
      setSuccess(true);
      setDonateAmount("");
      await loadData();
      setTimeout(() => { setSuccess(false); setShowModal(false); }, 2000);
    } catch (err: any) {
      const msg: string = err?.message || "";
      if (msg.startsWith("DAILY_LIMIT_REACHED|")) {
        const [, limit, remaining] = msg.split("|");
        setShowModal(false);
        setLimitPopup({ limit, remaining });
      } else {
        setDonateError(msg || "Failed to process donation. Try again.");
      }
    } finally {
      setDonating(false);
    }
  };

  if (loading) return (
    <div className="space-y-6 max-w-4xl mx-auto animate-pulse">
      <div className="h-8 bg-gray-100 rounded-full w-32" />
      <div className="h-72 bg-white rounded-3xl shadow-sm" />
      <div className="h-40 bg-white rounded-3xl shadow-sm" />
    </div>
  );

  if (error || !campaign) return (
    <div className="max-w-4xl mx-auto text-center py-20">
      <div className="text-6xl mb-4">😕</div>
      <p className="text-gray-500 text-lg mb-4">{error || "Campaign not found"}</p>
      <Link href="/donor/home"
        className="inline-flex items-center gap-2 bg-[#00b964] text-white font-bold px-5 py-2.5 rounded-full text-sm hover:bg-[#00a356] transition">
        <ArrowLeft size={14} /> Back to campaigns
      </Link>
    </div>
  );

  const pct  = campaign.goal_amount > 0 ? Math.min(100, Math.round((campaign.raised_amount / campaign.goal_amount) * 100)) : 0;
  const meta = CATEGORY_META[campaign.category] || CATEGORY_META["General"];
  const isActive = campaign.status === "active";

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">

      {/* Back */}
      <Link href="/donor/home"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#00b964] font-medium transition">
        <ArrowLeft size={15} /> Back to campaigns
      </Link>

      {/* ── Hero Card ── */}
      <div className="bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100">

        {/* Image / Banner */}
        <div className="h-64 relative overflow-hidden">
          {campaign.image_url ? (
            <img
              src={`http://localhost:8000${campaign.image_url}`}
              alt={campaign.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${meta.gradient} flex items-center justify-center text-8xl`}>
              {meta.emoji}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

          {/* Category badge */}
          <span className="absolute bottom-4 left-6 bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full font-semibold border border-white/30">
            {meta.emoji} {campaign.category}
          </span>

          {/* Status badge */}
          <span className={`absolute top-4 right-4 text-xs px-3 py-1.5 rounded-full font-bold flex items-center gap-1.5 ${
            isActive
              ? "bg-green-500 text-white"
              : "bg-gray-700 text-white"
          }`}>
            {isActive ? <Clock size={10} /> : <CheckCircle size={10} />}
            {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
          </span>
        </div>

        {/* Body */}
        <div className="p-8">
          <h1 className="text-2xl font-extrabold text-gray-900 mb-3">{campaign.title}</h1>
          <p className="text-gray-500 leading-relaxed mb-7">{campaign.description}</p>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 mb-7">
            {[
              { icon: TrendingUp, label: "Raised",  value: fmtINR(campaign.raised_amount), bg: "bg-green-50",  text: "text-[#00b964]",  iconBg: "bg-green-100 text-[#00b964]" },
              { icon: Target,     label: "Goal",    value: fmtINR(campaign.goal_amount),   bg: "bg-blue-50",   text: "text-blue-700",   iconBg: "bg-blue-100 text-blue-600" },
              { icon: Users,      label: "Donors",  value: donations.length,               bg: "bg-amber-50",  text: "text-amber-700",  iconBg: "bg-amber-100 text-amber-600" },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className={`text-center p-4 ${s.bg} rounded-2xl`}>
                  <div className={`inline-flex p-2 rounded-xl mb-2 ${s.iconBg}`}>
                    <Icon size={16} />
                  </div>
                  <p className={`text-xl font-extrabold ${s.text}`}>{s.value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
                </div>
              );
            })}
          </div>

          {/* Progress bar */}
          <div className="mb-7">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-bold text-gray-800">{pct}% funded</span>
              <span className="text-gray-400">
                {campaign.raised_amount < campaign.goal_amount
                  ? `${fmtINR(campaign.goal_amount - campaign.raised_amount)} to go`
                  : "Goal reached! 🎉"}
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
              <div
                className="h-3 rounded-full transition-all duration-700"
                style={{
                  width: `${pct}%`,
                  background: pct >= 75 ? "linear-gradient(90deg,#00b964,#00d4aa)" :
                              pct >= 40 ? "linear-gradient(90deg,#f59e0b,#f97316)" :
                                          "linear-gradient(90deg,#3b82f6,#6366f1)",
                }}
              />
            </div>
          </div>

          {/* Donate Button */}
          {isActive && (
            <button
              id="btn-donate-now"
              onClick={() => setShowModal(true)}
              className="w-full flex items-center justify-center gap-2 text-white py-4 rounded-2xl font-bold text-base hover:-translate-y-0.5 transition-all"
              style={{
                background: "linear-gradient(135deg,#00b964,#00d4aa)",
                boxShadow: "0 8px 24px rgba(0,185,100,0.35)",
                transition: "all 0.2s ease",
              }}
            >
              <Heart size={18} />
              Donate Now
            </button>
          )}
        </div>
      </div>

      {/* ── Recent Donors ── */}
      {donations.length > 0 && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-50 flex items-center gap-2">
            <span className="text-lg">💳</span>
            <h3 className="font-extrabold text-gray-900">Recent Donors</h3>
            <span className="ml-auto bg-green-100 text-[#00b964] text-xs font-bold px-2.5 py-1 rounded-full">
              {donations.length} total
            </span>
          </div>

          <div className="divide-y divide-gray-50">
            {donations.slice(0, 8).map((d, i) => (
              <div key={d.id} className="px-6 py-4 flex items-center gap-3 hover:bg-gray-50 transition group">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                  style={{ background: `hsl(${(i * 53) % 360},65%,55%)` }}
                >
                  {d.donor_name?.[0]?.toUpperCase() || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 group-hover:text-[#00b964] transition-colors">{d.donor_name}</p>
                  <p className="text-xs text-gray-400">{fmtDate(d.donated_at)}</p>
                </div>
                <span className="text-sm font-extrabold text-[#00b964] shrink-0">{fmtINR(d.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Campaign Updates Feed ── */}
      <CampaignUpdatesFeed campaignId={Number(id)} />

      {/* ── Daily Limit Popup ── */}
      {limitPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden text-center"
            style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.15)" }}>
            <div className="h-1.5 w-full" style={{ background: "linear-gradient(90deg,#f97316,#ef4444)" }} />
            <div className="p-8">
              <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4 text-3xl">
                🚫
              </div>
              <h3 className="text-xl font-extrabold text-gray-900 mb-2">Daily Limit Reached</h3>
              <p className="text-gray-500 text-sm mb-1">
                This campaign limits donors to <span className="font-bold text-gray-800">₹{parseInt(limitPopup.limit).toLocaleString("en-IN")}</span> per day.
              </p>
              {parseFloat(limitPopup.remaining) > 0 ? (
                <p className="text-gray-400 text-xs mb-6">
                  You can still donate up to <span className="font-semibold text-[#00b964]">₹{parseInt(limitPopup.remaining).toLocaleString("en-IN")}</span> today.
                </p>
              ) : (
                <p className="text-gray-400 text-xs mb-6">
                  You've reached your full daily limit. Come back tomorrow!
                </p>
              )}
              <button
                onClick={() => {
                  setLimitPopup(null);
                  if (parseFloat(limitPopup.remaining) > 0) {
                    setDonateAmount(limitPopup.remaining);
                    setShowModal(true);
                  }
                }}
                className="w-full py-3 rounded-2xl font-bold text-sm transition-all"
                style={parseFloat(limitPopup.remaining) > 0
                  ? { background: "linear-gradient(135deg,#00b964,#00d4aa)", color: "white", boxShadow: "0 8px 20px rgba(0,185,100,0.35)" }
                  : { background: "#f3f4f6", color: "#6b7280" }
                }
              >
                {parseFloat(limitPopup.remaining) > 0 ? `Donate ₹${parseInt(limitPopup.remaining).toLocaleString("en-IN")} instead` : "Got it"}
              </button>
              {parseFloat(limitPopup.remaining) > 0 && (
                <button onClick={() => setLimitPopup(null)}
                  className="mt-3 text-xs text-gray-400 hover:text-gray-600 transition">
                  Dismiss
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Donate Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden"
            style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.15), 0 8px 24px rgba(0,185,100,0.1)" }}>

            {/* Gradient top bar */}
            <div className="h-1.5 w-full" style={{ background: "linear-gradient(90deg,#00b964,#00d4aa,#0069ff)" }} />

            <div className="p-8">
              {success ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={36} className="text-[#00b964]" />
                  </div>
                  <h3 className="text-xl font-extrabold text-gray-900 mb-1">Thank you! 🎉</h3>
                  <p className="text-gray-400 text-sm">Your donation has been recorded.</p>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-xl font-extrabold text-gray-900">Make a Donation</h3>
                      <p className="text-sm text-gray-400 mt-1 line-clamp-1">{campaign.title}</p>
                    </div>
                    <button
                      onClick={() => { setShowModal(false); setDonateError(""); }}
                      className="text-gray-300 hover:text-gray-600 text-2xl font-bold leading-none transition"
                    >
                      ×
                    </button>
                  </div>

                  {/* Quick amount chips */}
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-2 tracking-wider">Quick Select</p>
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {QUICK_AMOUNTS.map((amt) => (
                      <button
                        key={amt}
                        onClick={() => setDonateAmount(String(amt))}
                        className={`py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${
                          donateAmount === String(amt)
                            ? "border-[#00b964] bg-green-50 text-[#00b964]"
                            : "border-gray-100 bg-gray-50 text-gray-600 hover:border-[#00b964] hover:text-[#00b964]"
                        }`}
                      >
                        {fmtINR(amt)}
                      </button>
                    ))}
                  </div>

                  {/* Custom amount */}
                  <div className="relative mb-4">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-sm">₹</span>
                    <input
                      id="donate-amount"
                      type="number"
                      min="1"
                      value={donateAmount}
                      onChange={(e) => setDonateAmount(e.target.value)}
                      placeholder="Enter custom amount"
                      className="w-full pl-8 pr-4 py-3 border-2 border-gray-100 bg-gray-50 rounded-2xl text-sm focus:outline-none focus:border-[#00b964] focus:bg-white transition-all"
                    />
                  </div>

                  {donateError && (
                    <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 mb-4">
                      <span className="text-xs">⚠️</span>
                      <p className="text-red-600 text-xs">{donateError}</p>
                    </div>
                  )}

                  <button
                    id="btn-confirm-donate"
                    onClick={handleDonate}
                    disabled={donating}
                    className="w-full flex items-center justify-center gap-2 text-white py-3.5 rounded-2xl font-bold text-sm disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                    style={{
                      background: donating ? "#9ca3af" : "linear-gradient(135deg,#00b964,#00d4aa)",
                      boxShadow: donating ? "none" : "0 8px 20px rgba(0,185,100,0.35)",
                    }}
                  >
                    {donating ? (
                      <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Processing…</>
                    ) : (
                      <><Heart size={15} /> {donateAmount ? `Donate ${fmtINR(parseFloat(donateAmount))}` : "Confirm Donation"}</>
                    )}
                  </button>

                  <p className="text-xs text-gray-400 text-center mt-3">
                    Donating as <span className="font-semibold text-gray-600">{user?.name || "Guest"}</span> · {user?.email}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
