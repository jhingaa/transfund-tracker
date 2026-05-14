"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Mon", donated: 200 },
  { name: "Tue", donated: 500 },
  { name: "Wed", donated: 300 },
  { name: "Thu", donated: 700 },
  { name: "Fri", donated: 400 },
  { name: "Sat", donated: 900 },
  { name: "Sun", donated: 650 },
];

export default function DonorChart() {
  return (
    <div className="bg-white/80 backdrop-blur border rounded-2xl p-5">
      <h3 className="font-semibold mb-4">Your Donation Activity</h3>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="donated"
              stroke="#7c3aed"
              strokeWidth={3}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}