"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface GoalsBarChartProps {
  data: { name: string; code: string; goals: number }[];
}

export function GoalsBarChart({ data }: GoalsBarChartProps) {
  const chartData = data.map((d) => ({ name: d.code, goles: d.goals }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip
          contentStyle={{ borderRadius: "8px", fontSize: "12px" }}
          formatter={(value) => [value, "Goles"]}
        />
        <Bar dataKey="goles" fill="#3b82f6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
