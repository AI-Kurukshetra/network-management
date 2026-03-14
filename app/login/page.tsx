import { redirectIfAuthenticated } from "@/lib/auth";
import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage() {
  await redirectIfAuthenticated();

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-5xl rounded-[2rem] border border-white/70 bg-white/40 p-6 shadow-panel backdrop-blur xl:grid xl:grid-cols-[1.1fr_0.9fr] xl:gap-6 xl:p-8">
        <section className="hidden rounded-[1.75rem] bg-slate-950 p-8 text-slate-50 xl:block">
          <p className="text-sm uppercase tracking-[0.32em] text-slate-300">AI-NOC</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight">Telecom operations, guarded by admin authentication.</h1>
          <p className="mt-6 text-base leading-7 text-slate-300">
            Sign in to monitor slices, inspect AMF/SMF/UPF telemetry, resolve alerts, and use the network diagnosis assistant.
          </p>
        </section>
        <section className="flex items-center">
          <LoginForm />
        </section>
      </div>
    </div>
  );
}
