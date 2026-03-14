import { SlicesTable } from "@/components/slices/slices-table";
import { requireUser } from "@/lib/auth";
import { getDashboardPayload } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function SlicesPage() {
  await requireUser();
  const payload = await getDashboardPayload();

  return (
    <div className="space-y-6">
      <section className="grid-panel rounded-[2rem] border border-white/70 p-8 shadow-panel">
        <p className="text-sm uppercase tracking-[0.32em] text-muted-foreground">Slice Management</p>
        <h2 className="mt-3 text-3xl font-semibold">Provision service slices</h2>
      </section>
      <SlicesTable initialSlices={payload.slices} />
    </div>
  );
}
