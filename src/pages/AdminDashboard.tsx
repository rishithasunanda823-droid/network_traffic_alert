import {
  Activity,
  ShieldAlert,
  ShieldCheck,
  Bell,
  Database,
  Gauge,
  Radio,
  Plus,
  Minus,
  Trash2,
  Lock,
  Unlock,
  Terminal,
  Cpu,
  Brain,
  AlertTriangle,
} from "lucide-react";
import { useStore } from "@/store";
import {
  Card,
  CardHeader,
  Stat,
  Button,
  Badge,
} from "@/components/ui";
import { TrafficChart, RiskGauge, Sparkline } from "@/components/charts";
import { THREAT_COLORS, formatTime, riskColor } from "@/theme";
import { INTENSITY_LEVELS } from "@/engine";
import type { TrafficIntensity } from "@/types";

export function AdminDashboard() {
  const {
    samples,
    stats,
    ai,
    alerts,
    records,
    logs,
    simulator,
    baselineReady,
    setIntensity,
    setSlider,
    increaseTraffic,
    decreaseTraffic,
    clearThreat,
    acknowledgeAlert,
    unlockAll,
  } = useStore();

  const c = THREAT_COLORS[ai.threatLevel];
  const threatActive = ai.threatLevel === "HIGH" || ai.threatLevel === "CRITICAL";
  const lockedCount = records.filter((r) => r.status === "LOCKED").length;
  const activeAlerts = alerts.filter((a) => !a.acknowledged).length;
  const recentRps = samples.slice(-20).map((s) => s.requests);

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">
            Security Operations Center
          </h1>
          <p className="text-sm text-slate-400">
            Admin dashboard · AI traffic monitoring & threat response
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-2 rounded-lg border ${c.border} ${c.bg} px-3 py-1.5`}
          >
            <span
              className={`h-2 w-2 rounded-full ${c.dot} ${ai.threatLevel === "CRITICAL" ? "blink" : ""}`}
            />
            <span className={`text-sm font-semibold ${c.text}`}>
              {ai.threatLevel}
            </span>
          </div>
          {threatActive && (
            <Button variant="danger" onClick={clearThreat}>
              <ShieldCheck size={14} /> Clear Threat
            </Button>
          )}
        </div>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          label="Requests / sec"
          value={stats.requestsPerSecond}
          accent="text-sky-300"
          sub={`normal ${stats.normalRps} · suspicious ${stats.suspiciousRps}`}
        />
        <Stat
          label="Active sessions"
          value={stats.activeSessions}
          accent="text-cyan-300"
        />
        <Stat
          label="Data rate"
          value={stats.dataRateKBps}
          unit="KB/s"
          accent="text-slate-100"
        />
        <Stat
          label="Baseline"
          value={baselineReady ? Math.round(ai.baseline) : "—"}
          unit={baselineReady ? "rps" : ""}
          accent="text-emerald-300"
          sub={baselineReady ? `±${Math.round(ai.baselineStd)} std` : "calibrating"}
        />
      </div>

      {/* Main grid */}
      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        {/* Traffic chart */}
        <Card className="xl:col-span-2">
          <CardHeader
            title="Network Traffic Monitor"
            subtitle="Normal vs suspicious traffic · last 60s"
            icon={<Activity size={16} />}
            right={
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-sky-400">
                  <span className="h-2 w-2 rounded-full bg-sky-400" /> Normal
                </span>
                <span className="flex items-center gap-1.5 text-red-400">
                  <span className="h-2 w-2 rounded-full bg-red-400" /> Suspicious
                </span>
              </div>
            }
          />
          <div className="p-4">
            <TrafficChart samples={samples} baseline={ai.baseline} height={220} />
            <div className="mt-3">
              <Sparkline data={recentRps} color={riskColor(ai.riskScore)} height={40} />
              <p className="mt-1 text-xs text-slate-500">
                Recent trend · requests/sec
              </p>
            </div>
          </div>
        </Card>

        {/* Risk gauge + threat */}
        <Card>
          <CardHeader
            title="AI Risk Assessment"
            subtitle="Real-time anomaly + risk score"
            icon={<Gauge size={16} />}
          />
          <div className="p-4">
            <RiskGauge score={ai.riskScore} />
            <div
              className={`mt-3 flex items-center justify-between rounded-lg border ${c.border} ${c.bg} px-4 py-3`}
            >
              <span className="text-sm text-slate-300">Threat level</span>
              <span className={`text-lg font-bold ${c.text}`}>
                {ai.threatLevel}
              </span>
            </div>
            <div className="mt-3 space-y-2 text-xs">
              <Row label="Anomaly score" value={`${ai.anomalyScore}%`} />
              <Row label="Risk score" value={`${Math.round(ai.riskScore)}%`} />
              <Row
                label="Baseline"
                value={
                  baselineReady
                    ? `${Math.round(ai.baseline)} ± ${Math.round(ai.baselineStd)} rps`
                    : "learning…"
                }
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Forecast + simulator */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {/* Forecast */}
        <Card>
          <CardHeader
            title="Attack Forecast"
            subtitle="Prototype forecasting — not a guarantee of an actual attack"
            icon={<Brain size={16} />}
          />
          <div className="p-5">
            <div
              className={`flex items-start gap-3 rounded-lg border ${c.border} ${c.bg} p-4`}
            >
              <Radio
                size={20}
                className={`mt-0.5 shrink-0 ${c.text} ${threatActive ? "blink" : ""}`}
              />
              <div>
                <p className={`text-sm font-semibold ${c.text}`}>
                  {ai.forecast}
                </p>
                <p className="mt-1 text-xs text-slate-400">{ai.reason}</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2">
              {(["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const).map((lvl) => {
                const lc = THREAT_COLORS[lvl];
                const active = ai.threatLevel === lvl;
                return (
                  <div
                    key={lvl}
                    className={`rounded-lg border px-2 py-2 text-center text-xs font-semibold transition-all ${
                      active
                        ? `${lc.border} ${lc.bg} ${lc.text}`
                        : "border-slate-800 text-slate-600"
                    }`}
                  >
                    {lvl}
                  </div>
                );
              })}
            </div>
            <p className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500">
              <AlertTriangle size={11} /> This is a prototype forecasting system
              based on traffic anomalies.
            </p>
          </div>
        </Card>

        {/* Traffic simulator */}
        <Card>
          <CardHeader
            title="Traffic Simulator"
            subtitle="Manual control · all traffic stays in the demo environment"
            icon={<Cpu size={16} />}
            right={
              <Badge className="border border-slate-700 bg-slate-800 text-slate-300">
                {simulator.intensity}
              </Badge>
            }
          />
          <div className="p-5">
            <div className="flex items-center gap-3">
              <Button variant="default" onClick={decreaseTraffic} className="px-2.5">
                <Minus size={16} />
              </Button>
              <input
                type="range"
                min={0}
                max={100}
                value={simulator.slider}
                onChange={(e) => setSlider(Number(e.target.value))}
                className="flex-1 accent-sky-500"
              />
              <Button variant="default" onClick={increaseTraffic} className="px-2.5">
                <Plus size={16} />
              </Button>
            </div>

            <div className="mt-4 grid grid-cols-4 gap-2">
              {INTENSITY_LEVELS.map((lvl) => {
                const active = simulator.intensity === lvl;
                const lc = levelColor(lvl);
                return (
                  <button
                    key={lvl}
                    onClick={() => setIntensity(lvl as TrafficIntensity)}
                    className={`rounded-lg border px-2 py-2.5 text-xs font-semibold transition-all ${
                      active
                        ? `${lc.border} ${lc.bg} ${lc.text}`
                        : "border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    {lvl}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 flex gap-2">
              <Button variant="primary" onClick={increaseTraffic} className="flex-1">
                <Plus size={14} /> Increase Traffic
              </Button>
              <Button variant="ghost" onClick={() => setIntensity("Normal")}>
                Reset
              </Button>
            </div>

            <p className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500">
              <Terminal size={11} /> No traffic leaves this browser. The
              simulator only adjusts the synthetic request rate.
            </p>
          </div>
        </Card>
      </div>

      {/* Alerts + protection + logs */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {/* Active alert */}
        <Card className={threatActive ? `border ${c.border}` : ""}>
          <CardHeader
            title="Active Security Alerts"
            icon={<ShieldAlert size={16} />}
            right={
              activeAlerts > 0 ? (
                <Badge className="border border-red-500/40 bg-red-500/15 text-red-300 blink">
                  {activeAlerts} active
                </Badge>
              ) : (
                <Badge className="border border-emerald-500/40 bg-emerald-500/15 text-emerald-300">
                  none
                </Badge>
              )
            }
          />
          <div className="p-4">
            {threatActive && (
              <div
                className={`slide-in rounded-xl border ${c.border} ${c.bg} p-4 ${ai.threatLevel === "CRITICAL" ? "pulse-critical" : ""}`}
              >
                <div className="flex items-center gap-2">
                  <ShieldAlert size={18} className={c.text} />
                  <p className={`text-sm font-bold ${c.text}`}>
                    SECURITY ALERT
                  </p>
                </div>
                <p className="mt-2 text-sm text-slate-200">{ai.reason}</p>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-slate-400">
                    {formatTime(Date.now())}
                  </span>
                  <span className={c.text}>
                    Risk Score: {Math.round(ai.riskScore)}% · {ai.threatLevel}
                  </span>
                </div>
              </div>
            )}
            {!threatActive && (
              <p className="py-4 text-center text-sm text-slate-500">
                No active security alert. Network is normal.
              </p>
            )}
          </div>
        </Card>

        {/* Data protection */}
        <Card>
          <CardHeader
            title="Sensitive Data Protection"
            icon={<Database size={16} />}
            right={
              lockedCount > 0 ? (
                <Badge className="border border-red-500/40 bg-red-500/15 text-red-300">
                  <Lock size={11} /> {lockedCount} locked
                </Badge>
              ) : (
                <Badge className="border border-emerald-500/40 bg-emerald-500/15 text-emerald-300">
                  <Unlock size={11} /> all open
                </Badge>
              )
            }
          />
          <div className="p-4">
            <div
              className={`rounded-lg border p-4 ${
                lockedCount > 0
                  ? "border-red-500/30 bg-red-500/5"
                  : "border-emerald-500/30 bg-emerald-500/5"
              }`}
            >
              <p
                className={`text-sm font-semibold ${
                  lockedCount > 0 ? "text-red-300" : "text-emerald-300"
                }`}
              >
                {lockedCount > 0
                  ? "Sensitive data protected due to detected threat"
                  : "All sensitive data accessible"}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                {lockedCount} of {records.length} records locked. Data is never
                deleted — only the access status changes.
              </p>
            </div>
            {lockedCount > 0 && (
              <Button
                variant="primary"
                className="mt-3 w-full"
                onClick={unlockAll}
              >
                <Unlock size={14} /> Unlock all records (admin)
              </Button>
            )}
          </div>
        </Card>
      </div>

      {/* Alert history + traffic log */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {/* Alert history */}
        <Card>
          <CardHeader
            title="Alert History"
            icon={<Bell size={16} />}
            right={
              <span className="text-xs text-slate-500">
                {alerts.length} events
              </span>
            }
          />
          <div className="max-h-72 divide-y divide-slate-800 overflow-y-auto">
            {alerts.length === 0 && (
              <p className="px-5 py-6 text-sm text-slate-500">
                No alerts recorded yet.
              </p>
            )}
            {alerts.map((a) => {
              const ac = THREAT_COLORS[a.threatLevel];
              return (
                <div
                  key={a.id}
                  className={`flex items-center gap-3 px-5 py-3 ${a.acknowledged ? "opacity-50" : ""}`}
                >
                  <span className={`h-2 w-2 rounded-full ${ac.dot}`} />
                  <div className="flex-1">
                    <p className="text-sm text-slate-200">{a.reason}</p>
                    <p className="text-xs text-slate-500">
                      {formatTime(a.time)} · risk {a.riskScore}%
                    </p>
                  </div>
                  <Badge className={`${ac.border} ${ac.bg} ${ac.text} border`}>
                    {a.threatLevel}
                  </Badge>
                  {!a.acknowledged && (
                    <button
                      onClick={() => acknowledgeAlert(a.id)}
                      className="rounded p-1 text-slate-500 hover:bg-slate-800 hover:text-slate-300"
                      title="Acknowledge"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Live traffic log */}
        <Card>
          <CardHeader
            title="Live Traffic Log"
            subtitle="Synthetic request stream"
            icon={<Terminal size={16} />}
          />
          <div className="max-h-72 overflow-y-auto bg-slate-950/40 p-3 font-mono text-[11px]">
            {logs.length === 0 && (
              <p className="px-2 py-4 text-slate-600">Waiting for traffic…</p>
            )}
            {logs.map((l) => (
              <div
                key={l.id}
                className={`flex items-center gap-2 px-2 py-1 ${
                  l.suspicious ? "text-red-300" : "text-slate-400"
                }`}
              >
                <span className="text-slate-600">{formatTime(l.time)}</span>
                <span
                  className={`rounded px-1 ${l.suspicious ? "bg-red-500/20 text-red-300" : "bg-slate-800 text-slate-400"}`}
                >
                  {l.method}
                </span>
                <span className="truncate">{l.path}</span>
                <span className="ml-auto text-slate-600">{l.source}</span>
                <span
                  className={
                    l.status >= 400 ? "text-red-400" : "text-emerald-400"
                  }
                >
                  {l.status}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-slate-500">{label}</span>
      <span className="text-right text-slate-300">{value}</span>
    </div>
  );
}

function levelColor(lvl: TrafficIntensity) {
  switch (lvl) {
    case "Normal":
      return THREAT_COLORS.LOW;
    case "Elevated":
      return THREAT_COLORS.MEDIUM;
    case "High":
      return THREAT_COLORS.HIGH;
    case "Critical":
      return THREAT_COLORS.CRITICAL;
  }
}
