import { AlertsTable } from "@/components/alerts/alerts-table";
import { requireUser } from "@/lib/auth";
import { getDashboardPayload } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AlertsPage() {
  await requireUser();
  const payload = await getDashboardPayload();

  return (
    <div className="space-y-6">
      <section className="grid-panel rounded-[2rem] border border-white/70 p-8 shadow-panel">
        <p className="text-sm uppercase tracking-[0.32em] text-muted-foreground">Alert Operations</p>
        <h2 className="mt-3 text-3xl font-semibold">Investigate and resolve threshold breaches</h2>
      </section>
      <AlertsTable initialAlerts={payload.alerts} />
    </div>
  );
}
