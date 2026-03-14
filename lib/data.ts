import { randomUUID } from "crypto";

import { getSupabaseClient } from "@/lib/supabase";
import type {
  Alert,
  DashboardPayload,
  MetricSnapshot,
  NetworkFunction,
  NetworkFunctionStatus,
  Slice
} from "@/types";

type InMemoryStore = {
  slices: Slice[];
  functions: NetworkFunction[];
  alerts: Alert[];
  metrics: MetricSnapshot[];
  lastSimulationAt: number;
};

function nowIso() {
  return new Date().toISOString();
}

function toFiniteNumber(value: unknown, fallback = 0) {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : fallback;

  return Number.isFinite(parsed) ? parsed : fallback;
}

function inferThroughput(cpuUsage: unknown) {
  const cpu = toFiniteNumber(cpuUsage, 35);
  return Number(Math.max(100, Math.min(1200, cpu * 10 + 120)).toFixed(1));
}

function normalizeFunction(item: Partial<NetworkFunction>): NetworkFunction {
  const cpu_usage = Number(toFiniteNumber(item.cpu_usage, 0).toFixed(1));
  const latency = Number(toFiniteNumber(item.latency, 0).toFixed(1));
  const packet_loss = Number(toFiniteNumber(item.packet_loss, 0).toFixed(2));
  const throughput = Number(
    toFiniteNumber(item.throughput, inferThroughput(item.cpu_usage)).toFixed(1)
  );

  return {
    ...(item as NetworkFunction),
    cpu_usage,
    latency,
    packet_loss,
    throughput,
    status: item.status ?? statusFromMetrics(cpu_usage, latency)
  };
}

function normalizeMetricSnapshot(item: Partial<MetricSnapshot> & { throughput?: unknown }) {
  const avg_latency = Number(toFiniteNumber(item.avg_latency, 0).toFixed(1));
  const avg_cpu_usage = Number(toFiniteNumber(item.avg_cpu_usage, 0).toFixed(1));
  const avg_packet_loss = Number(toFiniteNumber(item.avg_packet_loss, 0).toFixed(2));
  const avg_throughput = Number(
    toFiniteNumber(item.avg_throughput, item.throughput ?? 0).toFixed(1)
  );

  return {
    ...(item as MetricSnapshot),
    avg_latency,
    avg_cpu_usage,
    avg_packet_loss,
    avg_throughput,
    throughput: avg_throughput,
    health_score: Number(toFiniteNumber(item.health_score, 0).toFixed(1))
  };
}

function normalizeAlert(item: Partial<Alert>): Alert {
  return {
    ...(item as Alert),
    resolved: Boolean(item.resolved),
    resolution_comment: item.resolution_comment ?? null,
    resolved_at: item.resolved_at ?? null,
    network_function_id: item.network_function_id ?? null,
    slice_id: item.slice_id ?? null
  };
}

function seedSlices(): Slice[] {
  return [
    {
      id: randomUUID(),
      name: "Gaming",
      latency_target: 15,
      bandwidth: 500,
      created_at: nowIso()
    },
    {
      id: randomUUID(),
      name: "Video Streaming",
      latency_target: 30,
      bandwidth: 800,
      created_at: nowIso()
    },
    {
      id: randomUUID(),
      name: "IoT",
      latency_target: 45,
      bandwidth: 250,
      created_at: nowIso()
    }
  ];
}

function statusFromMetrics(cpu: number, latency: number): NetworkFunctionStatus {
  if (cpu > 95 || latency > 90) {
    return "down";
  }
  if (cpu > 85 || latency > 50) {
    return "degraded";
  }
  return "healthy";
}

function seedFunctions(slices: Slice[]): NetworkFunction[] {
  const types = ["AMF", "SMF", "UPF"] as const;
  return Array.from({ length: 10 }, (_, index) => {
    const cpu = 40 + Math.random() * 40;
    const latency = 15 + Math.random() * 20;
    return {
      id: randomUUID(),
      name: `${types[index % 3]}-${String(index + 1).padStart(2, "0")}`,
      type: types[index % 3],
      status: statusFromMetrics(cpu, latency),
      cpu_usage: Number(cpu.toFixed(1)),
      latency: Number(latency.toFixed(1)),
      packet_loss: Number((Math.random() * 2).toFixed(2)),
      throughput: Number((250 + Math.random() * 600).toFixed(1)),
      slice_id: slices[index % slices.length].id,
      updated_at: nowIso()
    };
  });
}

function computeHealthScore(functions: NetworkFunction[], alerts: Alert[]) {
  const avgCpu =
    functions.reduce((sum, item) => sum + item.cpu_usage, 0) / Math.max(functions.length, 1);
  const avgLatency =
    functions.reduce((sum, item) => sum + item.latency, 0) / Math.max(functions.length, 1);
  const avgPacketLoss =
    functions.reduce((sum, item) => sum + item.packet_loss, 0) / Math.max(functions.length, 1);
  const alertPenalty = alerts.filter((item) => !item.resolved).length * 3;
  const score = 100 - avgCpu * 0.25 - avgLatency * 0.5 - avgPacketLoss * 8 - alertPenalty;
  return Math.max(0, Math.min(100, Number(score.toFixed(1))));
}

function createMetricSnapshot(functions: NetworkFunction[], alerts: Alert[]): MetricSnapshot {
  const length = Math.max(functions.length, 1);
  const avg_latency = functions.reduce((sum, item) => sum + item.latency, 0) / length;
  const avg_cpu_usage = functions.reduce((sum, item) => sum + item.cpu_usage, 0) / length;
  const avg_packet_loss = functions.reduce((sum, item) => sum + item.packet_loss, 0) / length;
  const avg_throughput = functions.reduce((sum, item) => sum + item.throughput, 0) / length;

  return {
    id: randomUUID(),
    timestamp: nowIso(),
    avg_latency: Number(avg_latency.toFixed(1)),
    avg_cpu_usage: Number(avg_cpu_usage.toFixed(1)),
    avg_packet_loss: Number(avg_packet_loss.toFixed(2)),
    avg_throughput: Number(avg_throughput.toFixed(1)),
    throughput: Number(avg_throughput.toFixed(1)),
    health_score: computeHealthScore(functions, alerts)
  };
}

function createInitialStore(): InMemoryStore {
  const slices = seedSlices();
  const functions = seedFunctions(slices);
  const alerts: Alert[] = [];
  const metrics = Array.from({ length: 12 }, (_, index) => {
    const timestamp = new Date(Date.now() - (11 - index) * 5_000).toISOString();
    return {
      ...createMetricSnapshot(functions, alerts),
      timestamp
    };
  });
  return {
    slices,
    functions,
    alerts,
    metrics,
    lastSimulationAt: Date.now()
  };
}

const memoryStore = globalThis as typeof globalThis & { __aiNocStore?: InMemoryStore };

function getMemoryStore() {
  if (!memoryStore.__aiNocStore) {
    memoryStore.__aiNocStore = createInitialStore();
  }

  return memoryStore.__aiNocStore;
}

async function safeQuery<T>(query: PromiseLike<{ data: T | null; error: { message: string } | null }>) {
  const result = await query;
  if (result.error) {
    throw new Error(result.error.message);
  }
  return result.data;
}

function shouldFallbackToMemory(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  return (
    error.message.includes("schema cache") ||
    error.message.includes("Could not find the table") ||
    error.message.includes("relation") ||
    error.message.includes("does not exist")
  );
}

async function withSupabaseFallback<T>(query: () => Promise<T>, fallback: () => T | Promise<T>) {
  try {
    return await query();
  } catch (error) {
    if (shouldFallbackToMemory(error)) {
      return fallback();
    }

    throw error;
  }
}

export async function listSlices() {
  const client = getSupabaseClient();
  if (!client) {
    return getMemoryStore().slices;
  }

  return withSupabaseFallback(
    async () =>
      (((await safeQuery(
        client.from("network_slices").select("*").order("created_at", { ascending: true })
      )) ?? []) as Slice[]),
    () => getMemoryStore().slices
  );
}

export async function createSlice(input: Pick<Slice, "name" | "latency_target" | "bandwidth">) {
  const client = getSupabaseClient();
  if (!client) {
    const slice: Slice = {
      id: randomUUID(),
      created_at: nowIso(),
      ...input
    };
    getMemoryStore().slices.push(slice);
    return slice;
  }

  const data = await withSupabaseFallback(
    async () => safeQuery(client.from("network_slices").insert(input).select().single()),
    async () => {
      const slice: Slice = {
        id: randomUUID(),
        created_at: nowIso(),
        ...input
      };
      getMemoryStore().slices.push(slice);
      return slice;
    }
  );
  return data as Slice;
}

export async function updateSlice(id: string, input: Pick<Slice, "name" | "latency_target" | "bandwidth">) {
  const client = getSupabaseClient();
  if (!client) {
    const store = getMemoryStore();
    store.slices = store.slices.map((slice) => (slice.id === id ? { ...slice, ...input } : slice));
    return store.slices.find((slice) => slice.id === id) ?? null;
  }

  const data = await withSupabaseFallback(
    async () => safeQuery(client.from("network_slices").update(input).eq("id", id).select().single()),
    async () => {
      const store = getMemoryStore();
      store.slices = store.slices.map((slice) => (slice.id === id ? { ...slice, ...input } : slice));
      return store.slices.find((slice) => slice.id === id) ?? null;
    }
  );
  return data as Slice;
}

export async function deleteSlice(id: string) {
  const client = getSupabaseClient();
  if (!client) {
    const store = getMemoryStore();
    store.slices = store.slices.filter((slice) => slice.id !== id);
    store.functions = store.functions.filter((item) => item.slice_id !== id);
    return;
  }

  await withSupabaseFallback(
    async () => safeQuery(client.from("network_slices").delete().eq("id", id)),
    async () => {
      const store = getMemoryStore();
      store.slices = store.slices.filter((slice) => slice.id !== id);
      store.functions = store.functions.filter((item) => item.slice_id !== id);
    }
  );
}

export async function listFunctions() {
  const client = getSupabaseClient();
  if (!client) {
    return getMemoryStore().functions;
  }

  return withSupabaseFallback(
    async () =>
      (((await safeQuery(
        client.from("network_functions").select("*").order("name", { ascending: true })
      )) ?? []) as NetworkFunction[]).map(normalizeFunction),
    () => getMemoryStore().functions.map(normalizeFunction)
  );
}

export async function listAlerts() {
  const client = getSupabaseClient();
  if (!client) {
    return getMemoryStore().alerts.map(normalizeAlert);
  }

  return withSupabaseFallback(
    async () =>
      (((await safeQuery(
        client.from("alerts").select("*").order("created_at", { ascending: false })
      )) ?? []) as Alert[]).map(normalizeAlert),
    () => getMemoryStore().alerts.map(normalizeAlert)
  );
}

export async function updateAlertStatus(id: string, input: { resolved: boolean; comment: string }) {
  const client = getSupabaseClient();
  const updatePayload = {
    resolved: input.resolved,
    resolution_comment: input.comment,
    resolved_at: input.resolved ? nowIso() : null
  };

  if (!client) {
    const store = getMemoryStore();
    store.alerts = store.alerts.map((alert) =>
      alert.id === id ? normalizeAlert({ ...alert, ...updatePayload }) : normalizeAlert(alert)
    );
    return;
  }

  await withSupabaseFallback(
    async () => safeQuery(client.from("alerts").update(updatePayload).eq("id", id)),
    async () => {
      const store = getMemoryStore();
      store.alerts = store.alerts.map((alert) =>
        alert.id === id ? normalizeAlert({ ...alert, ...updatePayload }) : normalizeAlert(alert)
      );
    }
  );
}

export async function listMetrics() {
  const client = getSupabaseClient();
  if (!client) {
    return getMemoryStore().metrics.slice(-12);
  }

  const data =
    ((await withSupabaseFallback(
      async () =>
        safeQuery(client.from("metric_snapshots").select("*").order("timestamp", { ascending: false }).limit(12)),
      async () => getMemoryStore().metrics.slice(-12).reverse()
    )) as MetricSnapshot[] | null) ?? [];

  return data.reverse().map(normalizeMetricSnapshot);
}

export async function getDashboardPayload(): Promise<DashboardPayload> {
  const [slices, functions, alerts, metrics] = await Promise.all([
    listSlices(),
    listFunctions(),
    listAlerts(),
    listMetrics()
  ]);

  const unresolvedAlerts = alerts.filter((alert) => !alert.resolved);
  const latestSnapshot =
    metrics[metrics.length - 1] ?? createMetricSnapshot(functions, unresolvedAlerts);

  return {
    summary: {
      totalSlices: slices.length,
      activeFunctions: functions.filter((item) => item.status !== "down").length,
      activeAlerts: unresolvedAlerts.length,
      healthScore: latestSnapshot.health_score
    },
    slices,
    functions,
    alerts,
    metrics
  };
}

export async function getSimulationState() {
  const [slices, functions, alerts, metrics] = await Promise.all([
    listSlices(),
    listFunctions(),
    listAlerts(),
    listMetrics()
  ]);

  return { slices, functions, alerts, metrics };
}

export async function persistSimulationResults(input: {
  functions: NetworkFunction[];
  alerts: Alert[];
  snapshot: MetricSnapshot;
}) {
  const client = getSupabaseClient();
  if (!client) {
    const store = getMemoryStore();
    store.functions = input.functions;
    const unresolvedIds = new Set(store.alerts.filter((item) => !item.resolved).map((item) => item.id));
    const newAlerts = input.alerts.filter((item) => !unresolvedIds.has(item.id));
    store.alerts = [...newAlerts, ...store.alerts].slice(0, 30);
    store.metrics = [...store.metrics, input.snapshot].slice(-12);
    store.lastSimulationAt = Date.now();
    return;
  }

  await withSupabaseFallback(
    async () => {
      for (const networkFunction of input.functions) {
        await safeQuery(
          client
            .from("network_functions")
            .update({
              cpu_usage: networkFunction.cpu_usage,
              latency: networkFunction.latency,
              packet_loss: networkFunction.packet_loss,
              throughput: networkFunction.throughput,
              status: networkFunction.status,
              updated_at: networkFunction.updated_at
            })
            .eq("id", networkFunction.id)
        );
      }

      if (input.alerts.length > 0) {
        await safeQuery(client.from("alerts").insert(input.alerts));
      }

      await safeQuery(client.from("metric_snapshots").insert(input.snapshot));
    },
    async () => {
      const store = getMemoryStore();
      store.functions = input.functions;
      const unresolvedIds = new Set(store.alerts.filter((item) => !item.resolved).map((item) => item.id));
      const newAlerts = input.alerts.filter((item) => !unresolvedIds.has(item.id));
      store.alerts = [...newAlerts, ...store.alerts].slice(0, 30);
      store.metrics = [...store.metrics, input.snapshot].slice(-12);
      store.lastSimulationAt = Date.now();
    }
  );
}
