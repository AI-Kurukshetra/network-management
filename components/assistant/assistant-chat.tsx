"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import type { AiChatMessage, DiagnosisPayload } from "@/types";

const starterPrompts = [
  "Why is latency high?",
  "Show network alerts",
  "Which slice has problems?",
  "Explain network health"
];

export function AssistantChat() {
  const [messages, setMessages] = useState<AiChatMessage[]>([
    {
      role: "assistant",
      content:
        "Ask about latency spikes, slice degradation, alert posture, or general network health and I will diagnose the current state."
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const submit = async (question: string) => {
    if (!question.trim()) return;

    const nextMessages: AiChatMessage[] = [...messages, { role: "user", content: question }];
    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);

    const response = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: nextMessages })
    });

    setIsLoading(false);

    if (!response.ok) {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: "I could not complete the diagnosis. Check the API configuration and try again."
        }
      ]);
      return;
    }

    const diagnosis = (await response.json()) as DiagnosisPayload;
    setMessages((current) => [
      ...current,
      { role: "assistant", content: diagnosis.answer }
    ]);
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
      <Card>
        <CardHeader>
          <CardTitle>Prompts</CardTitle>
          <CardDescription>Use preset troubleshooting questions to inspect the simulated network.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {starterPrompts.map((prompt) => (
            <Button key={prompt} variant="outline" className="w-full justify-start" onClick={() => submit(prompt)}>
              {prompt}
            </Button>
          ))}
        </CardContent>
      </Card>

      <Card className="min-h-[680px]">
        <CardHeader>
          <CardTitle>AI Network Assistant</CardTitle>
          <CardDescription>Telecom-grade diagnosis based on live slices, functions, metrics, and alerts.</CardDescription>
        </CardHeader>
        <CardContent className="flex h-[calc(100%-96px)] flex-col gap-4">
          <div className="flex-1 space-y-4 overflow-y-auto rounded-3xl bg-white/60 p-4">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={message.role === "assistant" ? "mr-10 rounded-3xl bg-white p-4" : "ml-10 rounded-3xl bg-primary p-4 text-primary-foreground"}
              >
                <p className="mb-2 text-xs uppercase tracking-[0.2em] opacity-70">{message.role}</p>
                <p className="whitespace-pre-wrap text-sm leading-6">{message.content}</p>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            <Textarea
              placeholder="Ask about slice performance, alerts, or root cause..."
              value={input}
              onChange={(event) => setInput(event.target.value)}
            />
            <Button className="w-full" disabled={isLoading} onClick={() => submit(input)}>
              {isLoading ? "Diagnosing..." : "Send"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
