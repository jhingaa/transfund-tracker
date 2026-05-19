"use client";

import { useEffect, useState } from "react";
import { getCampaignUpdates, deleteCampaignUpdate, fileUrl, fmtDate } from "@/lib/api";
import { Paperclip, Megaphone, Trash2 } from "lucide-react";

type Update = {
  id: number;
  campaign_id: number;
  title: string;
  body: string;
  file_url: string | null;
  posted_by: string;
  created_at: string;
};

export default function CampaignUpdatesFeed({
  campaignId,
  refreshKey = 0,
  canDelete = false,
}: {
  campaignId: number;
  refreshKey?: number;
  canDelete?: boolean;
}) {
  const [updates, setUpdates] = useState<Update[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    getCampaignUpdates(campaignId)
      .then(setUpdates)
      .catch(() => setUpdates([]))
      .finally(() => setLoading(false));
  }, [campaignId, refreshKey]);

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await deleteCampaignUpdate(id);
      setUpdates((prev) => prev.filter((u) => u.id !== id));
    } catch {
      // silently keep the update if delete fails
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-50 flex items-center gap-2">
        <Megaphone size={18} className="text-[#00b964]" />
        <h3 className="font-extrabold text-gray-900">Campaign Updates</h3>
        <span className="ml-auto bg-green-100 text-[#00b964] text-xs font-bold px-2.5 py-1 rounded-full">
          {updates.length}
        </span>
      </div>

      {loading ? (
        <div className="p-6 space-y-3 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="h-20 bg-gray-50 rounded-2xl" />
          ))}
        </div>
      ) : updates.length === 0 ? (
        <div className="text-center py-12 px-6">
          <div className="text-4xl mb-2">📭</div>
          <p className="font-bold text-gray-600 mb-1">No updates yet</p>
          <p className="text-xs text-gray-400">
            The organizer hasn't posted any updates for this campaign.
          </p>
        </div>
      ) : (
        <div className="p-6 space-y-4">
          {updates.map((u) => (
            <div key={u.id} className="relative pl-6 border-l-2 border-green-100">
              <div className="absolute -left-[7px] top-1 w-3 h-3 rounded-full bg-[#00b964] ring-4 ring-green-50" />
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <h4 className="font-bold text-gray-900">{u.title}</h4>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-gray-400">{fmtDate(u.created_at)}</span>
                    {canDelete && (
                      confirmId === u.id ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleDelete(u.id)}
                            disabled={deletingId === u.id}
                            className="text-xs font-bold text-white bg-red-500 hover:bg-red-600 px-2.5 py-1 rounded-lg transition disabled:opacity-60"
                          >
                            {deletingId === u.id ? "Deleting…" : "Confirm"}
                          </button>
                          <button
                            onClick={() => setConfirmId(null)}
                            className="text-xs font-semibold text-gray-500 hover:text-gray-700 px-2 py-1 rounded-lg border border-gray-200 hover:bg-gray-100 transition"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmId(u.id)}
                          title="Delete update"
                          className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition"
                        >
                          <Trash2 size={14} />
                        </button>
                      )
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
                  {u.body}
                </p>
                {u.file_url && (
                  <a
                    href={fileUrl(u.file_url)}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    <Paperclip size={12} /> View attachment
                  </a>
                )}
                <p className="text-xs text-gray-400 mt-2">— Posted by {u.posted_by}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
