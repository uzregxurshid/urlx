"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

/** props.data: [{ x: "YYYY-MM-DD", y: number }] */
export default function TimeSeriesChart({ data }) {
  const rows = (data || []).map(d => ({ date: d.x, value: d.y }));
  const maxY = Math.max(1, ...rows.map(r => r.value || 0));
  return (
    <div style={{ width: "100%", height: 260 }}>
      <ResponsiveContainer>
        <LineChart data={rows} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
          <CartesianGrid stroke="#fdebd3" />
          <XAxis
            dataKey="date"
            tick={{ fill: "#7c2d12", fontSize: 12 }}
            tickMargin={8}
          />
          <YAxis
            domain={[0, Math.ceil(maxY * 1.1)]}
            allowDecimals={false}
            tick={{ fill: "#7c2d12", fontSize: 12 }}
          />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#ea580c"
            strokeWidth={2}
            dot={{ r: 2.5 }}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
