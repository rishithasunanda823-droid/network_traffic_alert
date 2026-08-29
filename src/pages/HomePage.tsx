import {
  ShieldCheck,
  Activity,
  Brain,
  Bell,
  FileLock2,
  Gauge,
  ArrowRight,
  Lock,
  Cpu,
  Radar,
} from "lucide-react";
import { useRouter } from "@/router";
import { useStore } from "@/store";
import { Button } from "@/components/ui";

export function HomePage() {
  const { navigate } = useRouter();
  const { ai, stats, baselineReady } = useStore();

  const features = [
    {
      icon: <Activity size={20} />,
      title: "Live Traffic Simulation",
      desc: "A controlled traffic generator produces realistic normal and suspicious request patterns entirely inside the demo environment.",
    },
    {
      icon: <Brain size={20} />,
      title: "AI Anomaly Detection",
      desc: "A rule-based model learns the normal traffic baseline, then scores every second for anomaly and attack risk.",
    },
    {
      icon: <Gauge size={20} />,
      title: "Attack Forecasting",
      desc: "Threat levels escalate LOW → MEDIUM → HIGH → CRITICAL with a plain-language forecast of possible attack risk.",
    },
    {
      icon: <Bell size={20} />,
      title: "Real-time Alerting",
      desc: "When risk reaches HIGH or CRITICAL, a timestamped security alert fires and is logged to the alert history.",
    },
    {
      icon: <FileLock2 size={20} />,
      title: "Sensitive Data Protection",
      desc: "Dummy sensitive records auto-lock during a threat and stay inaccessible to normal users until an admin clears it.",
    },
    {
      icon: <Cpu size={20} />,
      title: "Single-page Prototype",
      desc: "Everything runs in the browser — no external services, no real network traffic, safe for a hackathon demo.",
    },
  ];

  const flow = [
    "Open the demo site and watch normal traffic flow.",
    "The dashboard learns and displays the normal baseline.",
    "Open the Traffic Simulator in the Admin Dashboard.",
    "Manually increase traffic — the AI detects the anomaly.",
    "Risk score climbs; threat level escalates.",
    "A security alert fires; sensitive data auto-locks.",
    "The admin clears the threat and unlocks the data.",
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-[#0a1020] to-slate-900 px-6 py-12 sm:px-12 sm:py-16">
        <div className="scan-line absolute inset-0" />
        <div className="relative max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-300">
            <Radar size={12} /> Controlled Demo Environment
          </div>
          <h1 className="text-3xl font-bold leading-tight text-slate-50 sm:text-4xl">
            AI-Based Network Attack Forecasting & Protection System
          </h1>
          <p className="mt-4 text-base text-slate-400">
            A fully functional cybersecurity prototype that simulates network
            traffic, learns a normal baseline, forecasts possible attacks, and
            automatically protects sensitive data when a threat is detected.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button variant="primary" onClick={() => navigate("login")}>
              Launch Demo <ArrowRight size={16} />
            </Button>
            <Button onClick={() => navigate("admin")}>
              View Admin Dashboard
            </Button>
          </div>
          <p className="mt-4 flex items-center gap-1.5 text-xs text-slate-500">
            <Lock size={12} /> Prototype only. All traffic and data are
            synthetic. No external calls are made.
          </p>
        </div>

        {/* live mini-status */}
        <div className="relative mt-8 grid grid-cols-2 gap-3 sm:max-w-md sm:grid-cols-4">
          <MiniStat label="Threat" value={ai.threatLevel} />
          <MiniStat label="Risk" value={`${Math.round(ai.riskScore)}%`} />
          <MiniStat label="Traffic" value={`${stats.requestsPerSecond} rps`} />
          <MiniStat
            label="Baseline"
            value={baselineReady ? `${Math.round(ai.baseline)} rps` : "learning…"}
          />
        </div>
      </section>

      {/* Features */}
      <section className="mt-10">
        <h2 className="mb-4 text-lg font-semibold text-slate-100">
          System Capabilities
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 transition-colors hover:border-sky-500/30"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400">
                {f.icon}
              </div>
              <h3 className="text-sm font-semibold text-slate-100">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-400">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Demo flow */}
      <section className="mt-10">
        <h2 className="mb-4 text-lg font-semibold text-slate-100">
          Demonstration Flow
        </h2>
        <ol className="space-y-2">
          {flow.map((step, i) => (
            <li
              key={i}
              className="flex items-start gap-3 rounded-lg border border-slate-800 bg-slate-900/40 px-4 py-3"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-500/15 text-xs font-semibold text-sky-300">
                {i + 1}
              </span>
              <span className="text-sm text-slate-300">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-10 rounded-xl border border-sky-500/20 bg-sky-500/5 p-6">
        <div className="flex items-start gap-3">
          <ShieldCheck size={20} className="mt-0.5 shrink-0 text-sky-400" />
          <div>
            <h3 className="text-sm font-semibold text-slate-100">
              Ready to try it?
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              Sign in with{" "}
              <code className="rounded bg-slate-800 px-1.5 py-0.5 text-xs text-sky-300">
                admin@demo.sec
              </code>{" "}
              /{" "}
              <code className="rounded bg-slate-800 px-1.5 py-0.5 text-xs text-sky-300">
                admin123
              </code>{" "}
              for the admin dashboard, or{" "}
              <code className="rounded bg-slate-800 px-1.5 py-0.5 text-xs text-sky-300">
                user@demo.sec
              </code>{" "}
              /{" "}
              <code className="rounded bg-slate-800 px-1.5 py-0.5 text-xs text-sky-300">
                user123
              </code>{" "}
              to see data locking from a normal user's perspective.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950/50 px-3 py-2">
      <p className="text-[10px] uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-semibold text-slate-100">{value}</p>
    </div>
  );
}
