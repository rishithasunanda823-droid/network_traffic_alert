import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import type {
  AiAssessment,
  SecurityAlert,
  SensitiveRecord,
  TrafficLogEntry,
  TrafficSample,
  TrafficStats,
} from "@/types";
import {
  assessTraffic,
  createAiEngine,
  createSimulatorState,
  generateSample,
  intensityFromSlider,
  resetEngine,
  sliderFromIntensity,
  type AiEngineState,
  type SimulatorState,
} from "@/engine";

const MAX_SAMPLES = 60; // 60s rolling window on the chart
const MAX_LOGS = 40;
const TICK_MS = 1000;

const DEMO_PATHS = [
  "/",
  "/login",
  "/dashboard",
  "/profile",
  "/documents",
  "/api/v1/users",
  "/api/v1/records",
  "/api/v1/auth/verify",
];
const DEMO_METHODS = ["GET", "POST", "PUT", "DELETE"];
const SUSPICIOUS_PATHS = [
  "/admin/exec",
  "/.env",
  "/wp-admin",
  "/api/v1/records?dump=true",
  "/cgi-bin/sh",
];

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

function initialRecords(): SensitiveRecord[] {
  return [
    {
      id: "REC-1001",
      label: "Customer PII — Account Profiles",
      category: "Personally Identifiable Information",
      value: "12,480 records (dummy)",
      status: "UNLOCKED",
      lockedAt: null,
      lockedReason: null,
    },
    {
      id: "REC-1002",
      label: "Payment Card Tokens",
      category: "Financial Data",
      value: "3,210 dummy card tokens",
      status: "UNLOCKED",
      lockedAt: null,
      lockedReason: null,
    },
    {
      id: "REC-1003",
      label: "Employee HR Records",
      category: "Internal HR",
      value: "642 dummy employee files",
      status: "UNLOCKED",
      lockedAt: null,
      lockedReason: null,
    },
    {
      id: "REC-1004",
      label: "Health Records (Synthetic)",
      category: "Protected Health Data",
      value: "8,905 synthetic records",
      status: "UNLOCKED",
      lockedAt: null,
      lockedReason: null,
    },
    {
      id: "REC-1005",
      label: "API Keys Vault (Demo)",
      category: "Credentials",
      value: "38 demo API keys",
      status: "UNLOCKED",
      lockedAt: null,
      lockedReason: null,
    },
    {
      id: "REC-1006",
      label: "Internal Memos",
      category: "Confidential Documents",
      value: "127 dummy memos",
      status: "UNLOCKED",
      lockedAt: null,
      lockedReason: null,
    },
  ];
}

function randomLog(suspicious: boolean): TrafficLogEntry {
  const path = suspicious
    ? SUSPICIOUS_PATHS[Math.floor(Math.random() * SUSPICIOUS_PATHS.length)]
    : DEMO_PATHS[Math.floor(Math.random() * DEMO_PATHS.length)];
  const method = suspicious
    ? ["POST", "PUT", "DELETE"][Math.floor(Math.random() * 3)]
    : DEMO_METHODS[Math.floor(Math.random() * DEMO_METHODS.length)];
  const status = suspicious
    ? [401, 403, 429, 500][Math.floor(Math.random() * 4)]
    : [200, 200, 200, 304][Math.floor(Math.random() * 4)];
  return {
    id: uid(),
    time: Date.now(),
    source: suspicious
      ? `203.0.113.${Math.floor(Math.random() * 254 + 1)}`
      : `10.0.${Math.floor(Math.random() * 20)}.${Math.floor(Math.random() * 254 + 1)}`,
    path,
    method,
    status,
    bytes: Math.round(200 + Math.random() * 4800),
    suspicious,
  };
}

interface StoreValue {
  samples: TrafficSample[];
  stats: TrafficStats;
  ai: AiAssessment;
  alerts: SecurityAlert[];
  records: SensitiveRecord[];
  logs: TrafficLogEntry[];
  simulator: SimulatorState;
  baselineReady: boolean;
  setIntensity: (i: SimulatorState["intensity"]) => void;
  setSlider: (v: number) => void;
  increaseTraffic: () => void;
  decreaseTraffic: () => void;
  clearThreat: () => void;
  acknowledgeAlert: (id: string) => void;
  unlockRecord: (id: string) => void;
  unlockAll: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [samples, setSamples] = useState<TrafficSample[]>([]);
  const [ai, setAi] = useState<AiAssessment>({
    baseline: 0,
    baselineStd: 0,
    anomalyScore: 0,
    riskScore: 0,
    threatLevel: "LOW",
    forecast: "Learning normal traffic baseline…",
    reason: "Calibrating baseline from live traffic.",
    baselineReady: false,
  });
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [records, setRecords] = useState<SensitiveRecord[]>(initialRecords());
  const [logs, setLogs] = useState<TrafficLogEntry[]>([]);
  const [simulator, setSimulator] = useState<SimulatorState>(createSimulatorState());

  const engineRef = useRef<AiEngineState>(createAiEngine());
  const tickRef = useRef(0);
  const lastThreatRef = useRef<string>("LOW");
  const lastAlertRef = useRef<number>(0);
  // Mirror simulator in a ref so the tick loop reads the latest intensity/jitter
  // without nesting setState updaters (which StrictMode would double-invoke).
  const simRef = useRef<SimulatorState>(simulator);
  useEffect(() => {
    simRef.current = simulator;
  }, [simulator]);

  // Main 1s tick loop: generate a sample, run the AI engine, react to threat.
  useEffect(() => {
    const interval = setInterval(() => {
      tickRef.current += 1;
      const t = tickRef.current;
      const now = Date.now();

      // Jitter the suspicious burst a little each tick.
      simRef.current = {
        ...simRef.current,
        jitter: 0.7 + Math.random() * 0.6,
      };
      setSimulator(simRef.current);

      const sample = generateSample(simRef.current, t, now);
      const assessment = assessTraffic(engineRef.current, sample);

      setSamples((prev) => {
        const next = [...prev, sample];
        if (next.length > MAX_SAMPLES) next.shift();
        return next;
      });
      setAi(assessment);

      // Generate a few log lines reflecting this tick's traffic mix.
      const newLogs: TrafficLogEntry[] = [];
      const susCount = Math.min(6, Math.round(sample.suspicious / 18));
      const normCount = Math.min(4, Math.max(1, Math.round(sample.normal / 14)));
      for (let i = 0; i < susCount; i++) newLogs.push(randomLog(true));
      for (let i = 0; i < normCount; i++) newLogs.push(randomLog(false));
      if (newLogs.length) {
        setLogs((prev) => [...newLogs.reverse(), ...prev].slice(0, MAX_LOGS));
      }

      // Threat reaction: escalate alerts + lock data on HIGH/CRITICAL.
      const level = assessment.threatLevel;
      const prevLevel = lastThreatRef.current;
      const becameHighOrWorse =
        (level === "HIGH" || level === "CRITICAL") &&
        (prevLevel === "LOW" || prevLevel === "MEDIUM");

      if (becameHighOrWorse && now - lastAlertRef.current > 4000) {
        lastAlertRef.current = now;
        setAlerts((prev) => [
          {
            id: uid(),
            time: now,
            reason: assessment.reason,
            riskScore: assessment.riskScore,
            threatLevel: level,
            acknowledged: false,
          },
          ...prev,
        ]);
        setRecords((recs) =>
          recs.map((r) =>
            r.status === "UNLOCKED"
              ? {
                  ...r,
                  status: "LOCKED",
                  lockedAt: now,
                  lockedReason: `Auto-locked: ${assessment.reason}`,
                }
              : r,
          ),
        );
      }
      lastThreatRef.current = level;
    }, TICK_MS);

    return () => clearInterval(interval);
  }, []);

  const stats: TrafficStats = useMemo(() => {
    const last = samples[samples.length - 1];
    if (!last) {
      return {
        requestsPerSecond: 0,
        activeSessions: 0,
        dataRateKBps: 0,
        normalRps: 0,
        suspiciousRps: 0,
      };
    }
    return {
      requestsPerSecond: last.requests,
      activeSessions: last.sessions,
      dataRateKBps: last.dataRate,
      normalRps: last.normal,
      suspiciousRps: last.suspicious,
    };
  }, [samples]);

  const setIntensity = (i: SimulatorState["intensity"]) => {
    setSimulator((s) => {
      const next = { ...s, intensity: i, slider: sliderFromIntensity(i) };
      simRef.current = next;
      return next;
    });
  };

  const setSlider = (v: number) => {
    setSimulator((s) => {
      const next = { ...s, slider: v, intensity: intensityFromSlider(v) };
      simRef.current = next;
      return next;
    });
  };

  const increaseTraffic = () => {
    setSimulator((s) => {
      const nextSlider = clampSlider(s.slider + 20);
      const next = {
        ...s,
        slider: nextSlider,
        intensity: intensityFromSlider(nextSlider),
      };
      simRef.current = next;
      return next;
    });
  };

  const decreaseTraffic = () => {
    setSimulator((s) => {
      const nextSlider = clampSlider(s.slider - 20);
      const next = {
        ...s,
        slider: nextSlider,
        intensity: intensityFromSlider(nextSlider),
      };
      simRef.current = next;
      return next;
    });
  };

  const clearThreat = () => {
    // Admin clears the simulated threat: drop traffic to normal and acknowledge
    // active alerts. Records stay locked until the admin explicitly unlocks them.
    const next = {
      ...simRef.current,
      intensity: "Normal" as SimulatorState["intensity"],
      slider: sliderFromIntensity("Normal"),
    };
    simRef.current = next;
    setSimulator(next);
    setAlerts((prev) => prev.map((a) => ({ ...a, acknowledged: true })));
    resetEngine(engineRef.current);
    lastThreatRef.current = "LOW";
  };

  const acknowledgeAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a)),
    );
  };

  const unlockRecord = (id: string) => {
    setRecords((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status: "UNLOCKED", lockedAt: null, lockedReason: null }
          : r,
      ),
    );
  };

  const unlockAll = () => {
    setRecords((prev) =>
      prev.map((r) => ({
        ...r,
        status: "UNLOCKED",
        lockedAt: null,
        lockedReason: null,
      })),
    );
  };

  const value: StoreValue = {
    samples,
    stats,
    ai,
    alerts,
    records,
    logs,
    simulator,
    baselineReady: ai.baselineReady,
    setIntensity,
    setSlider,
    increaseTraffic,
    decreaseTraffic,
    clearThreat,
    acknowledgeAlert,
    unlockRecord,
    unlockAll,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

function clampSlider(n: number): number {
  return Math.max(0, Math.min(100, n));
}
