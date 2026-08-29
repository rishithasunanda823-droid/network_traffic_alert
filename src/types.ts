// Core domain types for the AI-Based Network Attack Forecasting & Protection System.
// All data here is synthetic and lives entirely inside the controlled demo environment.

export type ThreatLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type TrafficIntensity = "Normal" | "Elevated" | "High" | "Critical";

export interface TrafficSample {
  /** Monotonic tick index. */
  t: number;
  /** Wall-clock time of the sample. */
  time: number;
  /** Total requests in this 1s window (normal + injected). */
  requests: number;
  /** Requests identified as normal/baseline. */
  normal: number;
  /** Requests identified as suspicious (above baseline). */
  suspicious: number;
  /** Active sessions observed. */
  sessions: number;
  /** Data transfer rate in KB/s. */
  dataRate: number;
}

export interface TrafficStats {
  requestsPerSecond: number;
  activeSessions: number;
  dataRateKBps: number;
  normalRps: number;
  suspiciousRps: number;
}

export interface AiAssessment {
  /** Learned normal traffic baseline (requests/sec). */
  baseline: number;
  /** Standard deviation of the learned baseline. */
  baselineStd: number;
  /** 0..100 — how far current traffic deviates from baseline. */
  anomalyScore: number;
  /** 0..100 — composite attack risk score. */
  riskScore: number;
  threatLevel: ThreatLevel;
  /** Human-readable forecast message. */
  forecast: string;
  /** Short machine reason for the current assessment. */
  reason: string;
  /** Whether the model has finished learning the baseline. */
  baselineReady: boolean;
}

export interface SecurityAlert {
  id: string;
  time: number;
  reason: string;
  riskScore: number;
  threatLevel: ThreatLevel;
  /** True once an admin clears it. */
  acknowledged: boolean;
}

export type DataStatus = "UNLOCKED" | "LOCKED";

export interface SensitiveRecord {
  id: string;
  label: string;
  category: string;
  value: string;
  status: DataStatus;
  lockedAt: number | null;
  lockedReason: string | null;
}

export interface TrafficLogEntry {
  id: string;
  time: number;
  source: string;
  path: string;
  method: string;
  status: number;
  bytes: number;
  suspicious: boolean;
}
