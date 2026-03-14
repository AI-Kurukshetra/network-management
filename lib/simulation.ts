import { randomUUID } from "crypto";

import { getSimulationState, persistSimulationResults } from "@/lib/data";
import type { Alert, NetworkFunction } from "@/types";

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function computeStatus(cpu: number, latency: number) {
  if (cpu > 95 || latency > 90) {
    return "down" as const;
  }
  if (cpu > 85 || latency > 50) {
    return "degraded" as const;
  }
  return "healthy" as const;
}

function createAlert(networkFunction: NetworkFunction): Alert[] {
  const alerts: Alert[] = [];
  if (networkFunction.cpu_usage > 90) {
    alerts.push({
      id: randomUUID(),
      message: `${networkFunction.name} CPU saturation at ${networkFunction.cpu_usage.toFixed(1)}%.`,
      severity: networkFunction.cpu_usage > 96 ? "critical" : "medium",
      resolved: false,
      created_at: new Date().toISOString(),
      network_function_id: networkFunction.id,
      slice_id: networkFunction.slice_id
    });
  }

  if (networkFunction.latency > 50) {
    alerts.push({
      id: randomUUID(),
      message: `${networkFunction.name} latency exceeded threshold at ${networkFunction.latency.toFixed(1)} ms.`,
      severity: networkFunction.latency > 75 ? "critical" : "medium",
      resolved: false,
      created_at: new Date().toISOString(),
      network_function_id: networkFunction.id,
      slice_id: networkFunction.slice_id
    });
  }

  return alerts;
}

function buildSnapshot(functions: NetworkFunction[], alerts: Alert[]) {
  const length = Math.max(functions.length, 1);
  const avgLatency = functions.reduce((sum, item) => sum + item.latency, 0) / length;
  const avgCpu = functions.reduce((sum, item) => sum + item.cpu_usage, 0) / length;
  const avgPacketLoss = functions.reduce((sum, item) => sum + item.packet_loss, 0) / length;
  const avgThroughput = functions.reduce((sum, item) => sum + item.throughput, 0) / length;
  const unresolvedAlerts = alerts.filter((item) => !item.resolved).length;
  const healthScore = clamp(100 - avgLatency * 0.5 - avgCpu * 0.25 - avgPacketLoss * 8 - unresolvedAlerts * 3, 0, 100);

  return {
    id: randomUUID(),
    timestamp: new Date().toISOString(),
    avg_latency: Number(avgLatency.toFixed(1)),
    avg_cpu_usage: Number(avgCpu.toFixed(1)),
    avg_packet_loss: Number(avgPacketLoss.toFixed(2)),
    avg_throughput: Number(avgThroughput.toFixed(1)),
    throughput: Number(avgThroughput.toFixed(1)),
    health_score: Number(healthScore.toFixed(1))
  };
}

export async function runSimulationTick() {
  const { functions, alerts } = await getSimulationState();
  const nextFunctions = functions.map((item, index) => {
    const burst = Math.random() > 0.92 || index === Math.floor(Math.random() * functions.length);
    const cpuDelta = burst ? 15 + Math.random() * 12 : Math.random() * 12 - 6;
    const latencyDelta = burst ? 18 + Math.random() * 16 : Math.random() * 10 - 5;
    const packetLossDelta = burst ? Math.random() * 2.5 : Math.random() * 0.4 - 0.2;
    const targetThroughput = clamp((item.cpu_usage + cpuDelta) * 10 + 120 + (Math.random() * 90 - 45), 100, 1200);
    const throughputDelta = burst ? -(Math.random() * 120) : targetThroughput - item.throughput;

    const cpu_usage = clamp(Number((item.cpu_usage + cpuDelta).toFixed(1)), 12, 99);
    const latency = clamp(Number((item.latency + latencyDelta).toFixed(1)), 5, 130);
    const packet_loss = clamp(Number((item.packet_loss + packetLossDelta).toFixed(2)), 0, 8);
    const throughput = clamp(Number((item.throughput + throughputDelta).toFixed(1)), 80, 1200);

    return {
      ...item,
      cpu_usage,
      latency,
      packet_loss,
      throughput,
      status: computeStatus(cpu_usage, latency),
      updated_at: new Date().toISOString()
    };
  });

  const generatedAlerts = nextFunctions.flatMap(createAlert);
  const snapshot = buildSnapshot(nextFunctions, [...generatedAlerts, ...alerts]);

  await persistSimulationResults({
    functions: nextFunctions,
    alerts: generatedAlerts,
    snapshot
  });

  return {
    functions: nextFunctions,
    alerts: generatedAlerts,
    snapshot
  };
}
