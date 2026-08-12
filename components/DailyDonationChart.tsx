"use client";

import React, { useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Calendar } from "lucide-react";

type DataPoint = {
  date: string;
  amount: number;
  donors: number;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;

  const amountItem = payload.find((p: any) => p.dataKey === "amount");
  const donorsItem = payload.find((p: any) => p.dataKey === "donors");

  return (
    <div className="bg-white p-3 rounded-xl shadow-lg border border-gray-100 text-sm">
      <div className="font-semibold text-gray-900 mb-2">{label}</div>
      <div className="flex items-center justify-between gap-4 mb-1">
        <span className="text-gray-500">Amount</span>
        <span className="font-bold text-blue-600">₹{amountItem?.value}</span>
      </div>
      <div className="flex items-center justify-between gap-4">
        <span className="text-gray-500">Donors</span>
        <span className="font-semibold text-gray-900">{donorsItem?.value}</span>
      </div>
    </div>
  );
};

export default function DailyDonationChart({ data = [] }: { data?: DataPoint[] }) {
  const [range, setRange] = useState<"7d" | "30d" | "all">("all");

  const filteredData = React.useMemo(() => {
    if (data.length === 0) return [];
    const now = new Date().getTime();
    
    return data.filter(d => {
      if (range === "all") return true;
      const dTime = new Date(d.date).getTime();
      const daysDiff = (now - dTime) / (1000 * 3600 * 24);
      if (range === "7d") return daysDiff <= 7;
      if (range === "30d") return daysDiff <= 30;
      return true;
    });
  }, [data, range]);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-semibold text-gray-900">Donation Volume</h3>
        
        {/* Date Range Picker */}
        <div className="flex bg-gray-50 p-1 rounded-lg border border-gray-200">
          <button 
            onClick={() => setRange("7d")}
            className={`px-3 py-1 text-xs font-medium rounded-md transition ${range === "7d" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
          >
            7D
          </button>
          <button 
            onClick={() => setRange("30d")}
            className={`px-3 py-1 text-xs font-medium rounded-md transition ${range === "30d" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
          >
            30D
          </button>
          <button 
            onClick={() => setRange("all")}
            className={`px-3 py-1 text-xs font-medium rounded-md transition ${range === "all" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
          >
            All
          </button>
        </div>
      </div>

      <div className="w-full relative" style={{ minHeight: 300 }}>
        {filteredData.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
            <Calendar size={32} className="mb-2 opacity-20" />
            <p className="text-sm">No data available for this range</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={filteredData} margin={{ top: 8, right: 0, left: -20, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              
              <XAxis 
                dataKey="date" 
                tickLine={false} 
                axisLine={false}
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                dy={10}
              />
              
              <YAxis
                yAxisId="left"
                orientation="left"
                tickFormatter={(v) => v >= 1000 ? `₹${v/1000}k` : `₹${v}`}
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                dx={-10}
              />

              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />

              <Bar
                dataKey="amount"
                name="Raised (₹)"
                yAxisId="left"
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
                barSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
