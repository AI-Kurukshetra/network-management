"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatTimestamp } from "@/lib/utils";
import type { MetricSnapshot } from "@/types";

const chartConfig = [
  { key: "avg_latency", label: "Latency", color: "#0f766e", unit: "ms" },
  { key: "avg_cpu_usage", label: "CPU Usage", color: "#b45309", unit: "%" },
  { key: "avg_packet_loss", label: "Packet Loss", color: "#dc2626", unit: "%" },
  { key: "throughput", label: "Throughput", color: "#2563eb", unit: "Mbps" }
] as const;

export function ChartsPanel({ metrics }: { metrics: MetricSnapshot[] }) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {chartConfig.map((chart) => (
        <Card key={chart.key}>
          <CardHeader>
            <CardTitle>{chart.label} Over Time</CardTitle>
            <CardDescription>Rolling telemetry sampled from the network simulation engine.</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics}>
                <CartesianGrid stroke="#d7e6eb" strokeDasharray="4 4" />
                <XAxis dataKey="timestamp" tickFormatter={formatTimestamp} stroke="#5d7680" />
                <YAxis stroke="#5d7680" />
                <Tooltip
                  labelFormatter={(value) => formatTimestamp(String(value))}
                  formatter={(value: number) => [`${value} ${chart.unit}`, chart.label]}
                />
                <Line
                  type="monotone"
                  dataKey={chart.key}
                  stroke={chart.color}
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
