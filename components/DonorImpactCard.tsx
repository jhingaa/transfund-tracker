"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getDonorImpact, fileUrl, fmtINR, fmtDate } from "@/lib/api";
import { Sparkles, FileText, ChevronDown, ChevronUp } from "lucide-react";

type ImpactBreakdown = {
  utilization_id: number;
  description: string;
  category: string;
  utilization_amount: number;
  your_share: number;
  proof_url: string | null;
  created_at: string;
};

type Impact = {
  campaign_id: number;
  campaign_title: string;
  campaign_status: string;
  your_donation: number;
  campaign_raised: number;
  share_percent: number;
  your_utilized: number;
  your_unspent: number;
  breakdown: ImpactBreakdown[];
};

export default function DonorImpactCard({ donorEmail }: { donorEmail: string }) {
  const [impacts, setImpacts] = useState<Impact[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (!donorEmail) return;
    getDonorImpact(donorEmail)
      .then(setImpacts)
      .catch(() => setImpacts([]))
      .finally(() => setLoading(false));
  }, [donorEmail]);

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 animate-pulse">
        <div className="h-5 bg-gray-100 rounded-full w-40 mb-4" />
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-24 bg-gray-50 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (impacts.length === 0) return null;

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-50 flex items-center gap-2">
        <Sparkles size={18} className="text-[#00b964]" />
        <h3 className="font-extrabold text-gray-900">Where Your Money Went</h3>
        <span className="ml-auto bg-green-100 text-[#00b964] text-xs font-bold px-2.5 py-1 rounded-full">
          {impacts.length} campaign{impacts.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="p-6 space-y-4">
        {impacts.map((imp) => {
          const isOpen = !!expanded[imp.campaign_id];
          const pctUsed =
            imp.your_donation > 0
              ? Math.min(100, Math.round((imp.your_utilized / imp.your_donation) * 100))
              : 0;

          return (
            <div
              key={imp.campaign_id}
              className="border-2 border-gray-100 rounded-2xl p-5 hover:border-[#00b964]/30 transition-colors"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <Link
                    href={`/donor/campaign/${imp.campaign_id}`}
                    className="font-bold text-gray-900 hover:text-[#00b964] transition-colors line-clamp-1"
                  >
                    {imp.campaign_title}
                  </Link>
                  <p className="text-xs text-gray-400 mt-0.5">
                    You gave {fmtINR(imp.your_donation)} · {imp.share_percent}% of campaign
                  </p>
                </div>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                    imp.campaign_status === "active"
                      ? "bg-green-50 text-[#00b964]"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {imp.campaign_status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-green-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 font-medium">Used so far</p>
                  <p className="text-lg font-extrabold text-[#00b964]">
                    {fmtINR(imp.your_utilized)}
                  </p>
                </div>
                <div className="bg-amber-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 font-medium">Not yet utilized</p>
                  <p className="text-lg font-extrabold text-amber-700">
                    {fmtINR(imp.your_unspent)}
                  </p>
                </div>
              </div>

              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden mb-3">
                <div
                  className="h-2 rounded-full transition-all duration-700"
                  style={{
                    width: `${pctUsed}%`,
                    background: "linear-gradient(90deg,#00b964,#00d4aa)",
                  }}
                />
              </div>

              {imp.breakdown.length > 0 && (
                <>
                  <button
                    onClick={() =>
                      setExpanded((e) => ({ ...e, [imp.campaign_id]: !isOpen }))
                    }
                    className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-[#00b964] transition py-1"
                  >
                    {isOpen ? "Hide breakdown" : `See ${imp.breakdown.length} utilization${imp.breakdown.length !== 1 ? "s" : ""}`}
                    {isOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </button>

                  {isOpen && (
                    <div className="mt-3 space-y-2">
                      {imp.breakdown.map((b) => (
                        <div
                          key={b.utilization_id}
                          className="bg-gray-50 rounded-xl p-3 border border-gray-100"
                        >
                          <div className="flex items-start justify-between gap-3 mb-1">
                            <p className="text-sm font-semibold text-gray-800 line-clamp-2">
                              {b.description}
                            </p>
                            <div className="text-right shrink-0">
                              <p className="text-sm font-extrabold text-[#00b964]">
                                {fmtINR(b.your_share)}
                              </p>
                              <p className="text-[10px] text-gray-400">
                                of {fmtINR(b.utilization_amount)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap mt-1.5">
                            <span className="capitalize bg-white text-gray-500 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-gray-200">
                              {b.category}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              {fmtDate(b.created_at)}
                            </span>
                            {b.proof_url && (
                              <a
                                href={fileUrl(b.proof_url)}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-600 hover:underline ml-auto"
                              >
                                <FileText size={10} /> View proof
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
