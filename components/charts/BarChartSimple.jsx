"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

/** props.data: [{ label: string, value: number }] */
export default function BarChartSimple({ data }) {
  const rows = (data || []).map(d => ({ label: d.label, value: d.value }));
  const maxV = Math.max(1, ...rows.map(r => r.value || 0));
  return (
    <div style={{ width: "100%", height: 280 }}>
      <ResponsiveContainer>
        <BarChart data={rows} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
          <CartesianGrid stroke="#fdebd3" />
          <XAxis dataKey="label" tick={{ fill: "#7c2d12", fontSize: 12 }} />
          <YAxis
            domain={[0, Math.ceil(maxV * 1.1)]}
            allowDecimals={false}
            tick={{ fill: "#7c2d12", fontSize: 12 }}
          />
          <Tooltip />
          <Bar dataKey="value" fill="#fb923c" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
