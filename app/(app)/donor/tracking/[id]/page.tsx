"use client";

import { useEffect, useState, use } from "react";
import { getCampaign, getUtilizations, getUtilizationSummary, fmtINR, fmtDate, fileUrl } from "@/lib/api";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type Utilization = {
  id: number;
  campaign_id: number;
  amount: number;
  description: string;
  category: string;
  proof_url: string | null;
  created_by: string;
  created_at: string;
};

export default function Tracking({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [campaign, setCampaign] = useState<any>(null);
  const [utils, setUtils] = useState<Utilization[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      getCampaign(Number(id)),
      getUtilizations(Number(id)),
      getUtilizationSummary(Number(id)),
    ])
      .then(([c, u, s]) => { setCampaign(c); setUtils(u); setSummary(s); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-6 animate-pulse space-y-3">{[1,2,3].map(i=><div key={i} className="h-12 bg-gray-100 rounded-xl"/>)}</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6 p-6">
      <Link href="/donor/home" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black">
        <ArrowLeft size={15} /> Back
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">{campaign?.title}</h1>
        <p className="text-sm text-gray-500 mt-1">Fund utilization tracker</p>
      </div>

      {summary && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Raised", value: fmtINR(summary.total_raised), color: "text-blue-700 bg-blue-50" },
            { label: "Utilized", value: fmtINR(summary.total_utilized), color: "text-green-700 bg-green-50" },
            { label: "Remaining", value: fmtINR(summary.remaining), color: "text-amber-700 bg-amber-50" },
          ].map((s, i) => (
            <div key={i} className={`rounded-2xl p-4 ${s.color}`}>
              <p className="text-xs font-semibold opacity-70 mb-1">{s.label}</p>
              <p className="text-xl font-bold">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {utils.length === 0 ? (
        <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border">
          <p className="text-lg mb-1">No utilization records yet</p>
          <p className="text-sm">The organizer hasn&apos;t logged any fund usage.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {utils.map((u) => (
            <div key={u.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex justify-between items-start mb-1">
                <p className="font-semibold text-gray-900">{u.description}</p>
                <span className="text-blue-700 font-bold text-sm">{fmtINR(u.amount)}</span>
              </div>
              <div className="flex gap-3 text-xs text-gray-400 mt-2">
                <span className="capitalize bg-gray-100 px-2 py-0.5 rounded">{u.category}</span>
                <span>{fmtDate(u.created_at)}</span>
                {u.proof_url && (
                  <a href={fileUrl(u.proof_url!)} target="_blank" rel="noreferrer" className="text-blue-600 underline">View proof</a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}