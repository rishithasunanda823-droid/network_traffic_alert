import type {
  AiAssessment,
  ThreatLevel,
  TrafficIntensity,
  TrafficSample,
} from "@/types";

// ---------------------------------------------------------------------------
// Traffic simulator
//
// Generates synthetic network traffic entirely inside the controlled demo
// environment. Nothing is sent to any external host. The simulator produces a
// per-second sample containing a "normal" component (drawn from the learned
// baseline distribution) plus an "injected" suspicious component whose size is
// driven by the admin's traffic-intensity setting.
// ---------------------------------------------------------------------------

export const INTENSITY_LEVELS: TrafficIntensity[] = [
  "Normal",
  "Elevated",
  "High",
  "Critical",
];

// Mean requests/sec for the normal baseline. The AI engine learns this from
// the first samples it sees, but we anchor the generator here so the demo has
// stable, reproducible numbers.
export const BASELINE_MEAN = 48;
const BASELINE_STD = 6;

// Suspicious traffic injected per intensity level (requests/sec above baseline).
const INJECTION: Record<TrafficIntensity, number> = {
  Normal: 0,
  Elevated: 45,
  High: 120,
  Critical: 240,
};

// Sessions grow with intensity to make the dashboard feel alive.
const SESSIONS: Record<TrafficIntensity, [number, number]> = {
  Normal: [120, 180],
  Elevated: [260, 360],
  High: [520, 720],
  Critical: [900, 1300],
};

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

/** Box-Muller transform for a roughly normal distribution. */
function gaussian(mean: number, std: number): number {
  const u = 1 - Math.random();
  const v = Math.random();
  return mean + std * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export interface SimulatorState {
  intensity: TrafficIntensity;
  /** 0..100 slider position; maps to an intensity bucket. */
  slider: number;
  /** Per-second suspicious burst multiplier (0.6..1.4) to avoid flat lines. */
  jitter: number;
}

export function intensityFromSlider(slider: number): TrafficIntensity {
  if (slider < 25) return "Normal";
  if (slider < 55) return "Elevated";
  if (slider < 80) return "High";
  return "Critical";
}

export function sliderFromIntensity(i: TrafficIntensity): number {
  switch (i) {
    case "Normal":
      return 10;
    case "Elevated":
      return 40;
    case "High":
      return 67;
    case "Critical":
      return 92;
  }
}

export function createSimulatorState(): SimulatorState {
  return { intensity: "Normal", slider: 10, jitter: 1 };
}

export function generateSample(
  state: SimulatorState,
  t: number,
  time: number,
): TrafficSample {
  const normal = Math.max(0, Math.round(gaussian(BASELINE_MEAN, BASELINE_STD)));
  const injected = Math.round(
    INJECTION[state.intensity] * state.jitter * (0.85 + Math.random() * 0.3),
  );
  const [sLo, sHi] = SESSIONS[state.intensity];
  const sessions = Math.round(sLo + Math.random() * (sHi - sLo));
  const total = normal + injected;
  // ~1.4 KB per request on average, with variance.
  const dataRate = Math.round(total * (1.1 + Math.random() * 0.8));
  return {
    t,
    time,
    requests: total,
    normal,
    suspicious: injected,
    sessions,
    dataRate,
  };
}

// ---------------------------------------------------------------------------
// AI / rule-based analysis engine
//
// Learns the normal traffic baseline from the first N samples (calibration
// window), then continuously scores each new sample against it. The anomaly
// score measures how far the current traffic sits above the baseline; the risk
// score blends instantaneous deviation with recent persistence so a sustained
// spike escalates the threat level over time.
// ---------------------------------------------------------------------------

const CALIBRATION_SAMPLES = 12;
const HISTORY_WINDOW = 30;

export interface AiEngineState {
  calibration: number[];
  baseline: number;
  baselineStd: number;
  recent: number[];
  /** Accumulated persistence penalty (0..40) for sustained anomalies. */
  persistence: number;
}

export function createAiEngine(): AiEngineState {
  return {
    calibration: [],
    baseline: BASELINE_MEAN,
    baselineStd: BASELINE_STD,
    recent: [],
    persistence: 0,
  };
}

function levelFromRisk(risk: number): ThreatLevel {
  if (risk >= 75) return "CRITICAL";
  if (risk >= 55) return "HIGH";
  if (risk >= 30) return "MEDIUM";
  return "LOW";
}

function forecastFor(level: ThreatLevel): string {
  switch (level) {
    case "LOW":
      return "Network activity is normal. No anomalies detected.";
    case "MEDIUM":
      return "Unusual traffic increase detected. Monitoring closely.";
    case "HIGH":
      return "Potential attack risk detected. Protection measures arming.";
    case "CRITICAL":
      return "High probability of malicious activity. Protection measures activated.";
  }
}

export function assessTraffic(
  engine: AiEngineState,
  sample: TrafficSample,
): AiAssessment {
  const { requests, suspicious } = sample;

  // Calibration phase: collect samples to learn the baseline.
  if (engine.calibration.length < CALIBRATION_SAMPLES) {
    engine.calibration.push(requests);
    if (engine.calibration.length === CALIBRATION_SAMPLES) {
      const mean =
        engine.calibration.reduce((a, b) => a + b, 0) /
        engine.calibration.length;
      const variance =
        engine.calibration.reduce((a, b) => a + (b - mean) ** 2, 0) /
        engine.calibration.length;
      engine.baseline = mean;
      engine.baselineStd = Math.max(2, Math.sqrt(variance));
    }
    return {
      baseline: engine.baseline,
      baselineStd: engine.baselineStd,
      anomalyScore: 0,
      riskScore: 0,
      threatLevel: "LOW",
      forecast: "Learning normal traffic baseline…",
      reason: "Calibrating baseline from live traffic.",
      baselineReady: false,
    };
  }

  // Track recent samples for persistence scoring.
  engine.recent.push(requests);
  if (engine.recent.length > HISTORY_WINDOW) engine.recent.shift();

  // Anomaly score: how many std-devs above baseline, scaled to 0..100.
  const deviation = requests - engine.baseline;
  const zScore = deviation / engine.baselineStd;
  const anomalyScore = clamp(Math.round(clamp(zScore, 0, 8) * 12.5), 0, 100);

  // Persistence: if the last several samples are all above baseline, grow the
  // penalty; otherwise decay it. This makes sustained spikes escalate.
  const recentHigh = engine.recent.slice(-6).filter((r) => r > engine.baseline * 1.25)
    .length;
  if (recentHigh >= 4) {
    engine.persistence = clamp(engine.persistence + 8, 0, 40);
  } else {
    engine.persistence = clamp(engine.persistence - 6, 0, 40);
  }

  // Suspicious share adds a small component so pure volume isn't the only signal.
  const suspiciousShare = requests > 0 ? suspicious / requests : 0;
  const suspiciousComponent = clamp(Math.round(suspiciousShare * 25), 0, 25);

  const riskScore = clamp(anomalyScore + engine.persistence + suspiciousComponent, 0, 100);
  const threatLevel = levelFromRisk(riskScore);

  let reason: string;
  if (threatLevel === "LOW") {
    reason = "Traffic within learned baseline.";
  } else if (threatLevel === "MEDIUM") {
    reason = `Traffic ${Math.round(deviation)} req/s above baseline.`;
  } else if (threatLevel === "HIGH") {
    reason = `Sustained anomaly: ${recentHigh}/6 recent samples above baseline.`;
  } else {
    reason = `Critical anomaly: ${Math.round(deviation)} req/s over baseline with ${Math.round(
      suspiciousShare * 100,
    )}% suspicious traffic.`;
  }

  return {
    baseline: engine.baseline,
    baselineStd: engine.baselineStd,
    anomalyScore,
    riskScore,
    threatLevel,
    forecast: forecastFor(threatLevel),
    reason,
    baselineReady: true,
  };
}

export function resetEngine(engine: AiEngineState): void {
  engine.calibration = [];
  engine.recent = [];
  engine.persistence = 0;
  engine.baseline = BASELINE_MEAN;
  engine.baselineStd = BASELINE_STD;
}
