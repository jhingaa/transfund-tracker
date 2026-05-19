"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { getCampaigns, deleteCampaign, updateCampaign, getStoredUser, fmtINR, fileUrl } from "@/lib/api";
import { PlusCircle, CheckCircle, Clock, ArrowRight, Trash2, Pencil, X, ImagePlus } from "lucide-react";

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

const CATEGORIES = ["Medical", "Education", "Emergency", "Community", "NGOs", "Memorial", "Animals", "Events", "General", "Others"];

type EditForm = {
  title: string;
  description: string;
  category: string;
  goal_amount: string;
  daily_donor_limit: string;
  imageFile: File | null;
  imagePreview: string | null;
};

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState<"all" | "active" | "completed">("all");
  const [deleting, setDeleting]   = useState<number | null>(null);

  const [editTarget, setEditTarget] = useState<Campaign | null>(null);
  const [editForm, setEditForm]     = useState<EditForm | null>(null);
  const [saving, setSaving]         = useState(false);
  const [saveError, setSaveError]   = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

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

  const openEdit = (e: React.MouseEvent, c: Campaign) => {
    e.preventDefault();
    e.stopPropagation();
    setEditTarget(c);
    setEditForm({
      title: c.title,
      description: c.description,
      category: c.category,
      goal_amount: String(c.goal_amount),
      daily_donor_limit: c.daily_donor_limit != null ? String(c.daily_donor_limit) : "",
      imageFile: null,
      imagePreview: c.image_url ? fileUrl(c.image_url) : null,
    });
    setSaveError("");
  };

  const closeEdit = () => { setEditTarget(null); setEditForm(null); setSaveError(""); };

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setEditForm((f) => f ? { ...f, imageFile: file, imagePreview: URL.createObjectURL(file) } : f);
  };

  const handleSave = async () => {
    if (!editTarget || !editForm) return;
    setSaving(true);
    setSaveError("");
    try {
      const fd = new FormData();
      fd.append("title", editForm.title.trim());
      fd.append("description", editForm.description.trim());
      fd.append("category", editForm.category);
      fd.append("goal_amount", editForm.goal_amount);
      if (editForm.daily_donor_limit.trim()) fd.append("daily_donor_limit", editForm.daily_donor_limit);
      if (editForm.imageFile) fd.append("image", editForm.imageFile);
      const updated = await updateCampaign(editTarget.id, fd);
      setCampaigns((prev) => prev.map((c) => c.id === editTarget.id ? { ...c, ...updated } : c));
      closeEdit();
    } catch (err: any) {
      setSaveError(err.message || "Failed to save");
    } finally {
      setSaving(false);
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
                      src={fileUrl(c.image_url!)}
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
                        onClick={(e) => openEdit(e, c)}
                        className="flex items-center gap-1 text-blue-400 hover:text-blue-600 font-bold transition-colors"
                      >
                        <Pencil size={12} /> Edit
                      </button>
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

      {/* ── Edit Modal ── */}
      {editTarget && editForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden"
            style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.18)" }}>
            <div className="h-1.5 w-full" style={{ background: "linear-gradient(90deg,#00b964,#00d4aa,#0069ff)" }} />

            <div className="p-7">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-extrabold text-gray-900">Edit Campaign</h2>
                  <p className="text-xs text-gray-400 mt-0.5">ID #{editTarget.id}</p>
                </div>
                <button onClick={closeEdit} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
                {/* Image */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Cover Image</label>
                  <div
                    onClick={() => fileRef.current?.click()}
                    className="relative w-full h-36 rounded-2xl overflow-hidden border-2 border-dashed border-gray-200 hover:border-[#00b964] cursor-pointer transition group"
                  >
                    {editForm.imagePreview ? (
                      <img src={editForm.imagePreview} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gray-50">
                        <ImagePlus size={28} className="text-gray-300 group-hover:text-[#00b964] transition" />
                        <span className="text-xs text-gray-400 group-hover:text-[#00b964] transition">Click to upload new image</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition flex items-center justify-center">
                      {editForm.imagePreview && (
                        <span className="opacity-0 group-hover:opacity-100 transition text-white text-xs font-bold bg-black/50 px-3 py-1 rounded-full">
                          Change image
                        </span>
                      )}
                    </div>
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImagePick} />
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Title</label>
                  <input
                    value={editForm.title}
                    onChange={(e) => setEditForm((f) => f ? { ...f, title: e.target.value } : f)}
                    className="w-full border-2 border-gray-100 bg-gray-50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#00b964] focus:bg-white transition"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Description</label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm((f) => f ? { ...f, description: e.target.value } : f)}
                    rows={3}
                    className="w-full border-2 border-gray-100 bg-gray-50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#00b964] focus:bg-white transition resize-none"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Category</label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm((f) => f ? { ...f, category: e.target.value } : f)}
                    className="w-full border-2 border-gray-100 bg-gray-50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#00b964] focus:bg-white transition"
                  >
                    {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>

                {/* Goal & Limit */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Goal (₹)</label>
                    <input
                      type="number"
                      min={0}
                      value={editForm.goal_amount}
                      onChange={(e) => setEditForm((f) => f ? { ...f, goal_amount: e.target.value } : f)}
                      className="w-full border-2 border-gray-100 bg-gray-50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#00b964] focus:bg-white transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Daily Limit (₹)</label>
                    <input
                      type="number"
                      min={0}
                      placeholder="No limit"
                      value={editForm.daily_donor_limit}
                      onChange={(e) => setEditForm((f) => f ? { ...f, daily_donor_limit: e.target.value } : f)}
                      className="w-full border-2 border-gray-100 bg-gray-50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#00b964] focus:bg-white transition"
                    />
                  </div>
                </div>

                {saveError && (
                  <p className="text-xs text-red-500 font-semibold bg-red-50 px-3 py-2 rounded-xl border border-red-100">{saveError}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={closeEdit}
                  className="flex-1 py-3 rounded-2xl text-sm font-bold text-gray-500 border-2 border-gray-100 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !editForm.title.trim() || !editForm.description.trim()}
                  className="flex-1 py-3 rounded-2xl text-sm font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{ background: "linear-gradient(135deg,#00b964,#00d4aa)", boxShadow: "0 8px 20px rgba(0,185,100,0.3)" }}
                >
                  {saving
                    ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Saving…</>
                    : <><Pencil size={14} /> Save Changes</>
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
