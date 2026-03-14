import { Activity, AlertTriangle, Layers3, ServerCog } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardSummary } from "@/types";

const items = [
  {
    key: "totalSlices",
    label: "Total Slices",
    icon: Layers3
  },
  {
    key: "activeFunctions",
    label: "Active Functions",
    icon: ServerCog
  },
  {
    key: "activeAlerts",
    label: "Active Alerts",
    icon: AlertTriangle
  },
  {
    key: "healthScore",
    label: "Health Score",
    icon: Activity
  }
] as const;

export function HealthCards({ summary }: { summary: DashboardSummary }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;
        const value =
          item.key === "healthScore"
            ? `${summary[item.key].toFixed(1)}`
            : summary[item.key];

        return (
          <Card key={item.key}>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">{item.label}</CardTitle>
              <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                <Icon className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
