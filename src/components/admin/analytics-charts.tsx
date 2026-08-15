"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";

export function RevenueLineChart({ data }: { data: { date: string; revenue: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#00000010" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip formatter={(value) => `₦${Number(value).toLocaleString()}`} />
        <Line type="monotone" dataKey="revenue" stroke="#c8952c" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function OrdersByStatusChart({ data }: { data: { status: string; count: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#00000010" />
        <XAxis dataKey="status" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={60} />
        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
        <Tooltip />
        <Bar dataKey="count" fill="#0a0a0a" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
