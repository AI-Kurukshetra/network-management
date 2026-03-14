import { AssistantChat } from "@/components/assistant/assistant-chat";
import { requireUser } from "@/lib/auth";

export default async function AssistantPage() {
  await requireUser();
  return (
    <div className="space-y-6">
      <section className="grid-panel rounded-[2rem] border border-white/70 p-8 shadow-panel">
        <p className="text-sm uppercase tracking-[0.32em] text-muted-foreground">AI Diagnostics</p>
        <h2 className="mt-3 text-3xl font-semibold">Telecom root-cause assistant</h2>
      </section>
      <AssistantChat />
    </div>
  );
}
