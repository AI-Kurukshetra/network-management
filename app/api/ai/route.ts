import { NextResponse } from "next/server";

import { getDashboardPayload } from "@/lib/data";
import { getOpenAIClient } from "@/lib/openai";
import type { AiChatMessage, DiagnosisPayload } from "@/types";

const SYSTEM_PROMPT = `You are a telecom network operations assistant.
You analyze network metrics, alerts, and system health.
Your job is to diagnose network issues and suggest solutions.`;

function buildFallbackAnswer(question: string, payload: Awaited<ReturnType<typeof getDashboardPayload>>) {
  const topLatency = [...payload.functions].sort((a, b) => b.latency - a.latency)[0];
  const topCpu = [...payload.functions].sort((a, b) => b.cpu_usage - a.cpu_usage)[0];
  const criticalAlerts = payload.alerts.filter((alert) => !alert.resolved && alert.severity === "critical");
  const impactedSlice = payload.slices.find((slice) => slice.id === topLatency?.slice_id);

  return [
    `Question: ${question}`,
    "",
    "Root Cause:",
    `${topLatency?.name ?? "UPF"} is showing elevated latency at ${topLatency?.latency.toFixed(1) ?? "0"} ms while ${topCpu?.name ?? "UPF"} CPU is ${topCpu?.cpu_usage.toFixed(1) ?? "0"}%.`,
    "",
    "Impact:",
    `${impactedSlice?.name ?? "Unknown"} slice is the most exposed. There are ${criticalAlerts.length} critical active alerts and the current health score is ${payload.summary.healthScore.toFixed(1)}.`,
    "",
    "Recommendation:",
    "Scale the affected UPF or SMF tier, rebalance traffic across slices, and resolve active threshold breaches before latency cascades into packet loss."
  ].join("\n");
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { messages?: AiChatMessage[] };
    const messages = body.messages ?? [];
    const latestUserMessage = [...messages].reverse().find((item) => item.role === "user");

    if (!latestUserMessage) {
      return NextResponse.json({ error: "At least one user message is required." }, { status: 400 });
    }

    const payload = await getDashboardPayload();
    const openai = getOpenAIClient();

    if (!openai) {
      const response: DiagnosisPayload = {
        answer: buildFallbackAnswer(latestUserMessage.content, payload),
        source: "fallback"
      };
      return NextResponse.json(response);
    }

    const context = {
      summary: payload.summary,
      slices: payload.slices,
      functions: payload.functions,
      alerts: payload.alerts.filter((item) => !item.resolved).slice(0, 20),
      recentMetrics: payload.metrics.slice(-6)
    };

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "system",
          content: `Current network state:\n${JSON.stringify(context, null, 2)}`
        },
        ...messages.map((item) => ({
          role: item.role,
          content: item.content
        }))
      ]
    });

    const answer = completion.choices[0]?.message?.content ?? buildFallbackAnswer(latestUserMessage.content, payload);
    const response: DiagnosisPayload = {
      answer,
      source: "openai"
    };
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate diagnosis." },
      { status: 500 }
    );
  }
}
