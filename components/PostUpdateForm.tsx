"use client";

import { useRef, useState } from "react";
import { createCampaignUpdate } from "@/lib/api";
import { Send, Paperclip, X } from "lucide-react";

export default function PostUpdateForm({
  campaignId,
  postedBy,
  onPosted,
}: {
  campaignId: number;
  postedBy: string;
  onPosted?: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const reset = () => {
    setTitle("");
    setBody("");
    setFile(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!title.trim() || !body.trim()) {
      setError("Title and body are required.");
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("campaign_id", String(campaignId));
      fd.append("title", title.trim());
      fd.append("body", body.trim());
      fd.append("posted_by", postedBy);
      if (file) fd.append("file", file);
      await createCampaignUpdate(fd);
      reset();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
      onPosted?.();
    } catch (err: any) {
      setError(err?.message || "Failed to post update");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4"
    >
      <div className="flex items-center gap-2">
        <span className="text-lg">📣</span>
        <h3 className="font-extrabold text-gray-900">Post an Update</h3>
      </div>
      <p className="text-xs text-gray-400 -mt-2">
        Share progress, milestones, or proof with your donors. Any file type
        accepted (image, PDF, Word, etc.).
      </p>

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Update title (e.g. Week 2 progress)"
        className="w-full border-2 border-gray-100 bg-gray-50 px-4 py-3 rounded-2xl text-sm focus:outline-none focus:border-[#00b964] focus:bg-white transition-all"
      />

      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="What did you do this week? Any photos, receipts, or stories to share?"
        rows={4}
        className="w-full border-2 border-gray-100 bg-gray-50 px-4 py-3 rounded-2xl text-sm focus:outline-none focus:border-[#00b964] focus:bg-white transition-all resize-none"
      />

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <label className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 cursor-pointer hover:text-[#00b964] transition">
          <Paperclip size={15} />
          <span>{file ? "Change file" : "Attach file (optional)"}</span>
          <input
            ref={fileRef}
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="hidden"
          />
        </label>
        {file && (
          <div className="flex items-center gap-2 bg-green-50 text-[#00b964] text-xs font-semibold px-3 py-1.5 rounded-full">
            <span className="truncate max-w-[180px]">{file.name}</span>
            <button
              type="button"
              onClick={() => {
                setFile(null);
                if (fileRef.current) fileRef.current.value = "";
              }}
              className="hover:text-red-500"
            >
              <X size={12} />
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 text-red-600 text-xs">
          ⚠️ {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-3 py-2.5 text-[#00b964] text-xs font-semibold">
          ✅ Update posted successfully.
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full flex items-center justify-center gap-2 text-white py-3 rounded-2xl font-bold text-sm disabled:opacity-60 transition-all"
        style={{
          background: submitting ? "#9ca3af" : "linear-gradient(135deg,#00b964,#00d4aa)",
          boxShadow: submitting ? "none" : "0 8px 20px rgba(0,185,100,0.35)",
        }}
      >
        {submitting ? (
          <>
            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            Posting…
          </>
        ) : (
          <>
            <Send size={15} /> Post Update
          </>
        )}
      </button>
    </form>
  );
}
