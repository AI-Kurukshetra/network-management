import { ArrowRight, GaugeCircle, Radar, ShieldAlert } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatLatency, formatPercent, formatThroughput } from "@/lib/utils";
import type { DashboardPayload } from "@/types";

export function MetricsOverview({ payload }: { payload: DashboardPayload }) {
  const latest = payload.metrics[payload.metrics.length - 1];
  const topAlert = payload.alerts.find((item) => !item.resolved);
  const mostStressedFunction = [...payload.functions].sort((a, b) => b.cpu_usage - a.cpu_usage)[0];

  return (
    <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Network Pulse</CardTitle>
          <CardDescription>Current operational averages across the simulated 5G control and user plane.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl bg-white/70 p-4">
            <p className="text-sm text-muted-foreground">Average Latency</p>
            <p className="mt-2 text-2xl font-semibold">{formatLatency(latest?.avg_latency ?? 0)}</p>
          </div>
          <div className="rounded-2xl bg-white/70 p-4">
            <p className="text-sm text-muted-foreground">CPU Usage</p>
            <p className="mt-2 text-2xl font-semibold">{formatPercent(latest?.avg_cpu_usage ?? 0)}</p>
          </div>
          <div className="rounded-2xl bg-white/70 p-4">
            <p className="text-sm text-muted-foreground">Packet Loss</p>
            <p className="mt-2 text-2xl font-semibold">{formatPercent(latest?.avg_packet_loss ?? 0)}</p>
          </div>
          <div className="rounded-2xl bg-white/70 p-4">
            <p className="text-sm text-muted-foreground">Throughput</p>
            <p className="mt-2 text-2xl font-semibold">{formatThroughput(latest?.avg_throughput ?? 0)}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Operations Brief</CardTitle>
          <CardDescription>Fast context for triage and escalation.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3 rounded-2xl bg-white/70 p-4">
            <ShieldAlert className="mt-1 h-5 w-5 text-red-600" />
            <div>
              <p className="font-medium">Latest Alert</p>
              <p className="text-sm text-muted-foreground">{topAlert?.message ?? "No unresolved alerts."}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-2xl bg-white/70 p-4">
            <GaugeCircle className="mt-1 h-5 w-5 text-amber-600" />
            <div>
              <p className="font-medium">Most Stressed Function</p>
              <p className="text-sm text-muted-foreground">
                {mostStressedFunction
                  ? `${mostStressedFunction.name} at ${formatPercent(mostStressedFunction.cpu_usage)} CPU`
                  : "No function telemetry available."}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-2xl bg-white/70 p-4">
            <Radar className="mt-1 h-5 w-5 text-teal-700" />
            <div>
              <p className="font-medium">AI Guidance</p>
              <p className="text-sm text-muted-foreground">
                Use the assistant to correlate slices, latency spikes, and alert severity.
              </p>
              <Badge className="mt-3 gap-2" variant="outline">
                Investigate <ArrowRight className="h-3 w-3" />
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
