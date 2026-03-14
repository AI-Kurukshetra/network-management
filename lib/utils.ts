import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function toDisplayNumber(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

export function formatPercent(value: number | null | undefined) {
  return `${toDisplayNumber(value).toFixed(1)}%`;
}

export function formatLatency(value: number | null | undefined) {
  return `${toDisplayNumber(value).toFixed(1)} ms`;
}

export function formatThroughput(value: number | null | undefined) {
  return `${toDisplayNumber(value).toFixed(1)} Mbps`;
}

export function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }).format(new Date(value));
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "UTC"
  }).format(new Date(value));
}
