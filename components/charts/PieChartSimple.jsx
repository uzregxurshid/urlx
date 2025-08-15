"use client";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

/** props.data: [{ label: string, value: number }] */
export default function PieChartSimple({ data }) {
  const rows = (data || []).map(d => ({ name: d.label, value: d.value }));
  // Orange-ish palette
  const COLORS = ["#ea580c", "#fb923c", "#fdba74", "#f97316", "#f59e0b", "#d97706"];

  return (
    <div style={{ width: "100%", height: 280 }}>
      <ResponsiveContainer>
        <PieChart>
          <Tooltip />
          <Legend />
          <Pie
            data={rows}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={90}
            label
          >
            {rows.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
