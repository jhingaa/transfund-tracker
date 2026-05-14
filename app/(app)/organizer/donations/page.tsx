"use client";

import { useState, useEffect } from "react";
import { getOrganizerDonations, getStoredUser, fmtINR, fmtDate } from "@/lib/api";
import { Receipt, Search, Download } from "lucide-react";

type Donation = {
  id: number;
  donor_name: string;
  donor_email: string;
  amount: number;
  donated_at: string;
};

type CampaignWithDonations = {
  campaign_id: number;
  campaign_title: string;
  campaign_category: string;
  campaign_status: string;
  donations: Donation[];
};

export default function DonationsPage() {
  const [data, setData] = useState<CampaignWithDonations[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const user = getStoredUser();
    if (user?.email) {
      getOrganizerDonations(user.email)
        .then(setData)
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const filteredData = data.map(campaign => ({
    ...campaign,
    donations: campaign.donations.filter(d => 
      d.donor_name.toLowerCase().includes(search.toLowerCase()) || 
      d.donor_email.toLowerCase().includes(search.toLowerCase())
    )
  })).filter(c => c.donations.length > 0 || c.campaign_title.toLowerCase().includes(search.toLowerCase()));

  const totalRaised = data.reduce((sum, c) => sum + c.donations.reduce((s, d) => s + d.amount, 0), 0);
  const totalDonors = data.reduce((sum, c) => sum + c.donations.length, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Donations Ledger</h1>
          <p className="text-gray-500 text-sm mt-1">Track all contributions across your campaigns.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Total Raised</p>
            <p className="text-xl font-bold text-blue-600">{fmtINR(totalRaised)}</p>
          </div>
          <div className="h-10 w-px bg-gray-200" />
          <div className="text-right">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Total Donors</p>
            <p className="text-xl font-bold text-indigo-600">{totalDonors}</p>
          </div>
        </div>
      </div>

      <div className="bg-white/70 backdrop-blur-xl border border-gray-100 rounded-3xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <div className="relative w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search donor or campaign..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
            />
          </div>
          <button className="flex items-center gap-2 text-sm text-gray-600 font-medium px-4 py-2 border border-gray-200 rounded-lg hover:bg-white transition">
            <Download size={16} /> Export CSV
          </button>
        </div>

        <div className="p-6 overflow-x-auto">
          {loading ? (
            <div className="space-y-4">
              {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-xl" />)}
            </div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Receipt size={48} className="mx-auto mb-4 opacity-20" />
              <p className="text-lg">No donations found</p>
              {search && <p className="text-sm">Try adjusting your search</p>}
            </div>
          ) : (
            <div className="space-y-8">
              {filteredData.map(campaign => (
                <div key={campaign.campaign_id} className="border border-gray-100 rounded-2xl overflow-hidden">
                  <div className="bg-blue-50/50 px-5 py-3 border-b border-gray-100 flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-gray-900">{campaign.campaign_title}</h3>
                      <p className="text-xs text-gray-500">{campaign.campaign_category} • {campaign.donations.length} donations</p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-md font-medium ${
                      campaign.campaign_status === "active" ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-700"
                    }`}>
                      {campaign.campaign_status}
                    </span>
                  </div>
                  
                  <div className="divide-y divide-gray-100">
                    {campaign.donations.map(donation => (
                      <div key={donation.id} className="px-5 py-4 flex items-center justify-between hover:bg-gray-50/50 transition">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                            {donation.donor_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{donation.donor_name}</p>
                            <p className="text-xs text-gray-500">{donation.donor_email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-900">{fmtINR(donation.amount)}</p>
                          <p className="text-xs text-gray-400">{fmtDate(donation.donated_at)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}