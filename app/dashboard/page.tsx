import { LiveDashboard } from "@/components/dashboard/live-dashboard";
import { requireUser } from "@/lib/auth";
import { getDashboardPayload } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  await requireUser();
  const payload = await getDashboardPayload();

  return <LiveDashboard initialPayload={payload} />;
}
