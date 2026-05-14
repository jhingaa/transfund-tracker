"use client";

import { useState } from "react";
import { createCampaign, getStoredUser } from "@/lib/api";
import { UploadCloud, Image as ImageIcon, X, PlusCircle, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";

const CATEGORIES = ["Education", "Medical", "Events", "NGOs", "Community", "Emergency"];

const CATEGORY_META: Record<string, { emoji: string }> = {
  Education: { emoji: "🎓" },
  Medical:   { emoji: "🏥" },
  Events:    { emoji: "🎉" },
  NGOs:      { emoji: "🌍" },
  Community: { emoji: "🤝" },
  Emergency: { emoji: "🚨" },
};

export default function CreateCampaignPage() {
  const router = useRouter();
  const [title, setTitle]             = useState("");
  const [description, setDescription] = useState("");
  const [goal, setGoal]               = useState("");
  const [category, setCategory]       = useState("Education");
  const [image, setImage]             = useState<File | null>(null);
  const [previewUrl, setPreviewUrl]   = useState<string | null>(null);
  const [limitEnabled, setLimitEnabled] = useState(false);
  const [dailyLimit, setDailyLimit]   = useState("");
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImage(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const user = getStoredUser();
    if (!user || user.role !== "organizer") return setError("You must be logged in as an organizer.");
    if (!title.trim() || !description.trim() || !goal) return setError("Please fill in all required fields.");
    if (limitEnabled && (!dailyLimit || parseFloat(dailyLimit) <= 0)) return setError("Enter a valid daily donation limit.");

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("category", category);
      formData.append("goal_amount", goal);
      formData.append("organizer_email", user.email);
      if (limitEnabled && dailyLimit) formData.append("daily_donor_limit", dailyLimit);
      if (image) formData.append("image", image);

      await createCampaign(formData);
      router.push("/organizer/campaigns");
    } catch {
      setError("Failed to create campaign. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">

      {/* Header */}
      <div>
        <p className="text-sm text-[#00b964] font-semibold mb-1">Organizer Panel</p>
        <h1 className="text-2xl font-extrabold text-gray-900">Create New Campaign</h1>
        <p className="text-gray-400 text-sm mt-1">Share your cause and start raising funds transparently.</p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Green top bar */}
        <div className="h-1.5" style={{ background: "linear-gradient(90deg,#00b964,#00d4aa,#0069ff)" }} />

        <form onSubmit={handleSubmit} className="p-8 space-y-6">

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Campaign Image <span className="text-gray-400 font-normal">(optional)</span></label>
            {previewUrl ? (
              <div className="relative w-full h-56 rounded-2xl overflow-hidden border-2 border-gray-100 group">
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  <button type="button" onClick={removeImage}
                    className="bg-white/20 hover:bg-red-500 text-white rounded-full p-3 backdrop-blur transition">
                    <X size={22} />
                  </button>
                </div>
              </div>
            ) : (
              <label className="w-full h-56 border-2 border-dashed border-gray-200 bg-gray-50 hover:bg-green-50/40 hover:border-[#00b964] rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all group">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-3 shadow-sm group-hover:scale-105 transition">
                  <ImageIcon className="text-[#00b964]" size={26} />
                </div>
                <p className="font-bold text-gray-700 text-sm">Upload a cover image</p>
                <p className="text-xs text-gray-400 mt-1">JPEG, PNG up to 5MB</p>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            )}
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-gray-700">Campaign Title <span className="text-red-400">*</span></label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Save the Local Library"
              className="w-full border-2 border-gray-100 bg-gray-50 p-3.5 rounded-2xl text-sm focus:outline-none focus:border-[#00b964] focus:bg-white transition-all"
            />
          </div>

          {/* Goal + Category */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-gray-700">Goal Amount (₹) <span className="text-red-400">*</span></label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-sm">₹</span>
                <input
                  type="number"
                  min="100"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="10,000"
                  className="w-full pl-8 pr-4 border-2 border-gray-100 bg-gray-50 p-3.5 rounded-2xl text-sm focus:outline-none focus:border-[#00b964] focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-gray-700">Category</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base pointer-events-none">
                  {CATEGORY_META[category]?.emoji}
                </span>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full pl-10 pr-4 border-2 border-gray-100 bg-gray-50 p-3.5 rounded-2xl text-sm focus:outline-none focus:border-[#00b964] focus:bg-white transition-all appearance-none"
                >
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-gray-700">Description <span className="text-red-400">*</span></label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell the story of why you are raising funds..."
              rows={5}
              className="w-full border-2 border-gray-100 bg-gray-50 p-3.5 rounded-2xl text-sm focus:outline-none focus:border-[#00b964] focus:bg-white transition-all resize-y"
            />
          </div>

          {/* ── Daily Donor Limit ── */}
          <div className="rounded-2xl border-2 border-gray-100 overflow-hidden">
            {/* Toggle header */}
            <button
              type="button"
              onClick={() => setLimitEnabled(!limitEnabled)}
              className={`w-full flex items-center justify-between px-5 py-4 transition-all ${
                limitEnabled ? "bg-green-50" : "bg-gray-50 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${limitEnabled ? "bg-green-100 text-[#00b964]" : "bg-gray-100 text-gray-400"}`}>
                  <ShieldCheck size={16} />
                </div>
                <div className="text-left">
                  <p className={`text-sm font-bold ${limitEnabled ? "text-gray-900" : "text-gray-500"}`}>
                    Daily Donation Limit per Donor
                  </p>
                  <p className="text-xs text-gray-400">Cap how much a single donor can give per day</p>
                </div>
              </div>
              {/* Toggle pill */}
              <div className={`w-11 h-6 rounded-full relative transition-all duration-200 ${limitEnabled ? "bg-[#00b964]" : "bg-gray-200"}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${limitEnabled ? "left-6" : "left-1"}`} />
              </div>
            </button>

            {/* Limit input (expands when enabled) */}
            {limitEnabled && (
              <div className="px-5 pb-5 pt-3 bg-green-50 border-t border-green-100">
                <label className="block text-xs font-bold text-gray-600 mb-1.5">Maximum amount per donor per day (₹)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-sm">₹</span>
                  <input
                    type="number"
                    min="1"
                    value={dailyLimit}
                    onChange={(e) => setDailyLimit(e.target.value)}
                    placeholder="e.g., 5000"
                    className="w-full pl-8 pr-4 py-3 border-2 border-green-200 bg-white rounded-xl text-sm focus:outline-none focus:border-[#00b964] transition-all"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1.5">
                  Donors who hit this limit will see a popup and cannot donate again until midnight.
                </p>
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <span className="text-xs">⚠️</span>
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 rounded-2xl text-gray-500 font-semibold hover:bg-gray-50 border-2 border-gray-100 transition text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-8 py-3 rounded-2xl font-bold text-white text-sm disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              style={{
                background: loading ? "#9ca3af" : "linear-gradient(135deg,#00b964,#00d4aa)",
                boxShadow: loading ? "none" : "0 8px 20px rgba(0,185,100,0.35)",
              }}
            >
              {loading
                ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Publishing…</>
                : <><UploadCloud size={16} /> Publish Campaign</>
              }
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
