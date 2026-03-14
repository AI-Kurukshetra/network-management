export type Slice = {
  id: string;
  name: string;
  latency_target: number;
  bandwidth: number;
  created_at: string;
};

export type NetworkFunctionType = "AMF" | "SMF" | "UPF";
export type NetworkFunctionStatus = "healthy" | "degraded" | "down";

export type NetworkFunction = {
  id: string;
  name: string;
  type: NetworkFunctionType;
  status: NetworkFunctionStatus;
  cpu_usage: number;
  latency: number;
  packet_loss: number;
  throughput: number;
  slice_id: string;
  updated_at: string;
};

export type AlertSeverity = "low" | "medium" | "critical";

export type Alert = {
  id: string;
  message: string;
  severity: AlertSeverity;
  resolved: boolean;
  created_at: string;
  network_function_id: string | null;
  slice_id: string | null;
};

export type MetricSnapshot = {
  id: string;
  timestamp: string;
  avg_latency: number;
  avg_cpu_usage: number;
  avg_packet_loss: number;
  avg_throughput: number;
  throughput: number;
  health_score: number;
};

export type DashboardSummary = {
  totalSlices: number;
  activeFunctions: number;
  activeAlerts: number;
  healthScore: number;
};

export type DashboardPayload = {
  summary: DashboardSummary;
  slices: Slice[];
  functions: NetworkFunction[];
  alerts: Alert[];
  metrics: MetricSnapshot[];
};

export type AiChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type DiagnosisPayload = {
  answer: string;
  source: "openai" | "fallback";
};
