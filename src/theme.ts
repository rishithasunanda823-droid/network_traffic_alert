import type { ThreatLevel } from "@/types";

export const THREAT_COLORS: Record<
  ThreatLevel,
  { text: string; bg: string; border: string; ring: string; dot: string }
> = {
  LOW: {
    text: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    ring: "ring-emerald-500/40",
    dot: "bg-emerald-400",
  },
  MEDIUM: {
    text: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    ring: "ring-amber-500/40",
    dot: "bg-amber-400",
  },
  HIGH: {
    text: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/40",
    ring: "ring-orange-500/50",
    dot: "bg-orange-400",
  },
  CRITICAL: {
    text: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/40",
    ring: "ring-red-500/60",
    dot: "bg-red-400",
  },
};

export function riskColor(score: number): string {
  if (score >= 75) return "#ef4444";
  if (score >= 55) return "#f97316";
  if (score >= 30) return "#f59e0b";
  return "#10b981";
}

export function formatTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
