"use client";

import { ChartsPanel } from "@/components/dashboard/charts-panel";
import { HealthCards } from "@/components/dashboard/health-card";
import { MetricsOverview } from "@/components/dashboard/metrics-overview";
import { useNetworkData } from "@/hooks/use-network-data";
import type { DashboardPayload } from "@/types";

export function LiveDashboard({ initialPayload }: { initialPayload: DashboardPayload }) {
  const { data, isRefreshing, error } = useNetworkData(initialPayload);

  return (
    <div className="space-y-6">
      <section className="grid-panel rounded-[2rem] border border-white/70 p-8 shadow-panel">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.32em] text-muted-foreground">Operations Overview</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight">AI Network Operations Center</h2>
            <p className="mt-4 max-w-3xl text-base text-muted-foreground">
              Monitor 5G network slices, analyze AMF/SMF/UPF behavior, and investigate faults with AI-assisted diagnosis.
            </p>
          </div>
          <div className="rounded-2xl bg-white/70 px-4 py-3 text-sm text-muted-foreground">
            {error ? `Refresh issue: ${error}` : isRefreshing ? "Refreshing telemetry..." : "Telemetry auto-refresh active"}
          </div>
        </div>
      </section>
      <HealthCards summary={data.summary} />
      <MetricsOverview payload={data} />
      <ChartsPanel metrics={data.metrics} />
    </div>
  );
}
