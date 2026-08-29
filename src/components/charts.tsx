import type { TrafficSample } from "@/types";

// Real-time stacked area chart of normal vs suspicious traffic, rendered as
// inline SVG so it needs no chart dependency and stays crisp at any size.
export function TrafficChart({
  samples,
  baseline,
  height = 200,
}: {
  samples: TrafficSample[];
  baseline: number;
  height?: number;
}) {
  const width = 600;
  const pad = { top: 10, right: 8, bottom: 18, left: 30 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;

  const n = samples.length;
  const maxRps = Math.max(
    baseline * 1.4,
    ...samples.map((s) => s.requests),
    10,
  );
  const x = (i: number) =>
    pad.left + (n <= 1 ? 0 : (i / (n - 1)) * innerW);
  const y = (v: number) => pad.top + innerH - (v / maxRps) * innerH;

  const normalPath = samples
    .map((s, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(s.normal)}`)
    .join(" ");
  const normalArea = `${normalPath} L${x(n - 1)},${y(0)} L${x(0)},${y(0)} Z`;

  // Suspicious stacks on top of normal.
  const susPath = samples
    .map((s, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(s.normal + s.suspicious)}`)
    .join(" ");
  const susArea = `${susPath} L${x(n - 1)},${y(samples[n - 1]?.normal ?? 0)} ${normalPath
    .replace("M", "L")
    .split(" ")
    .reverse()
    .join(" ")} Z`;

  const baselineY = y(baseline);
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(maxRps * f));

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full"
      preserveAspectRatio="none"
      style={{ height }}
    >
      <defs>
        <linearGradient id="normalFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.05" />
        </linearGradient>
        <linearGradient id="susFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#ef4444" stopOpacity="0.1" />
        </linearGradient>
      </defs>

      {/* grid */}
      {ticks.map((t, i) => (
        <g key={i}>
          <line
            x1={pad.left}
            x2={width - pad.right}
            y1={y(t)}
            y2={y(t)}
            stroke="#1e293b"
            strokeWidth="1"
          />
          <text
            x={pad.left - 6}
            y={y(t) + 3}
            textAnchor="end"
            className="fill-slate-600"
            style={{ fontSize: 9 }}
          >
            {t}
          </text>
        </g>
      ))}

      {n > 1 && (
        <>
          <path d={normalArea} fill="url(#normalFill)" />
          <path d={susArea} fill="url(#susFill)" />
          <path d={normalPath} fill="none" stroke="#38bdf8" strokeWidth="1.5" />
          <path d={susPath} fill="none" stroke="#f87171" strokeWidth="1.5" />
        </>
      )}

      {/* baseline reference line */}
      {baseline > 0 && (
        <>
          <line
            x1={pad.left}
            x2={width - pad.right}
            y1={baselineY}
            y2={baselineY}
            stroke="#64748b"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          <text
            x={width - pad.right}
            y={baselineY - 4}
            textAnchor="end"
            className="fill-slate-500"
            style={{ fontSize: 9 }}
          >
            baseline {Math.round(baseline)} rps
          </text>
        </>
      )}
    </svg>
  );
}

// Semicircular risk gauge, 0..100.
export function RiskGauge({ score }: { score: number }) {
  const w = 220;
  const h = 130;
  const cx = w / 2;
  const cy = h - 18;
  const r = 92;
  const startAngle = Math.PI;
  const endAngle = 0;
  const angle = startAngle - (score / 100) * Math.PI;

  const arc = (a0: number, a1: number) => {
    const x0 = cx + r * Math.cos(a0);
    const y0 = cy + r * Math.sin(a0);
    const x1 = cx + r * Math.cos(a1);
    const y1 = cy + r * Math.sin(a1);
    return `M${x0},${y0} A${r},${r} 0 0 1 ${x1},${y1}`;
  };

  const color =
    score >= 75 ? "#ef4444" : score >= 55 ? "#f97316" : score >= 30 ? "#f59e0b" : "#10b981";
  const needleX = cx + (r - 14) * Math.cos(angle);
  const needleY = cy + (r - 14) * Math.sin(angle);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: h }}>
      {/* track segments */}
      <path d={arc(startAngle, startAngle - Math.PI * 0.3)} stroke="#10b981" strokeWidth="10" fill="none" strokeLinecap="round" />
      <path d={arc(startAngle - Math.PI * 0.3, startAngle - Math.PI * 0.55)} stroke="#f59e0b" strokeWidth="10" fill="none" />
      <path d={arc(startAngle - Math.PI * 0.55, startAngle - Math.PI * 0.8)} stroke="#f97316" strokeWidth="10" fill="none" />
      <path d={arc(startAngle - Math.PI * 0.8, endAngle)} stroke="#ef4444" strokeWidth="10" fill="none" strokeLinecap="round" />
      {/* needle */}
      <line x1={cx} y1={cy} x2={needleX} y2={needleY} stroke={color} strokeWidth="3" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="6" fill={color} />
      <text x={cx} y={cy - 28} textAnchor="middle" className="fill-slate-100" style={{ fontSize: 28, fontWeight: 600 }}>
        {Math.round(score)}
      </text>
      <text x={cx} y={cy - 10} textAnchor="middle" className="fill-slate-500" style={{ fontSize: 9 }}>
        RISK SCORE
      </text>
    </svg>
  );
}

// Tiny sparkline for stat cards.
export function Sparkline({
  data,
  color = "#38bdf8",
  height = 36,
}: {
  data: number[];
  color?: string;
  height?: number;
}) {
  const width = 120;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const pts = data
    .map((v, i) => {
      const x = (i / Math.max(1, data.length - 1)) * width;
      const y = height - ((v - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height }}>
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
