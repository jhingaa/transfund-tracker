"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const data = [
  { name: "Mon", donations: 120 },
  { name: "Tue", donations: 300 },
  { name: "Wed", donations: 200 },
  { name: "Thu", donations: 450 },
  { name: "Fri", donations: 380 },
  { name: "Sat", donations: 600 },
  { name: "Sun", donations: 500 },
];

export default function DonationChart() {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border">
      <h3 className="font-semibold mb-4">Donation Activity</h3>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="donations"
              stroke="#000"
              strokeWidth={2}
              dot={{ r: 4 }}
              animationDuration={1200}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}