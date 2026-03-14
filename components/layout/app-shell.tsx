"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { Activity, BellRing, BotMessageSquare, Layers3, LayoutDashboard, Router } from "lucide-react";

import { LogoutButton } from "@/components/layout/logout-button";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/slices", label: "Network Slices", icon: Layers3 },
  { href: "/functions", label: "Network Functions", icon: Router },
  { href: "/alerts", label: "Alerts", icon: BellRing },
  { href: "/assistant", label: "AI Assistant", icon: BotMessageSquare }
] as const satisfies ReadonlyArray<{ href: Route; label: string; icon: typeof Activity }>;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  if (isLoginPage) {
    return <div className="min-h-screen">{children}</div>;
  }

  return (
    <div className="min-h-screen px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-[1600px] gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="grid-panel rounded-[2rem] border border-white/70 p-6 shadow-panel">
          <div className="mb-10 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">AI-NOC</p>
              <h1 className="text-lg font-semibold">5G Operations Center</h1>
            </div>
          </div>

          <nav className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                    active
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "text-muted-foreground hover:bg-white/60 hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-10 rounded-3xl bg-slate-950 px-5 py-6 text-slate-50">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-300">Live Simulation</p>
            <p className="mt-3 text-sm leading-6 text-slate-200">
              Metrics update every 5 seconds and threshold breaches create operational alerts automatically.
            </p>
          </div>

          <LogoutButton />
        </aside>

        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
