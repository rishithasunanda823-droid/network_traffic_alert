import {
  LayoutDashboard,
  Activity,
  Database,
  Bell,
  ShieldAlert,
  TrendingUp,
  Users,
  HardDrive,
} from "lucide-react";
import { useRouter } from "@/router";
import { useStore } from "@/store";
import { Card, CardHeader, Stat, Button, Badge } from "@/components/ui";
import { TrafficChart, Sparkline } from "@/components/charts";
import { THREAT_COLORS, formatTime } from "@/theme";

export function UserDashboard() {
  const { navigate, session } = useRouter();
  const { samples, stats, ai, alerts, records } = useStore();
  const c = THREAT_COLORS[ai.threatLevel];
  const lockedCount = records.filter((r) => r.status === "LOCKED").length;
  const recentRps = samples.slice(-15).map((s) => s.requests);
  const recentSessions = samples.slice(-15).map((s) => s.sessions);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">
            Welcome back, {session?.name}
          </h1>
          <p className="text-sm text-slate-400">
            Your account overview and current network security status.
          </p>
        </div>
        <Badge className={`${c.border} ${c.bg} ${c.text} border`}>
          <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} /> {ai.threatLevel}{" "}
          threat
        </Badge>
      </div>

      {/* Stats */}
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
          label="Risk score"
          value={`${Math.round(ai.riskScore)}%`}
          accent={c.text}
          sub={ai.baselineReady ? "baseline learned" : "learning…"}
        />
      </div>

      {/* Traffic + threat */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Network Traffic"
            subtitle="Normal vs suspicious requests per second"
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
            <TrafficChart samples={samples} baseline={ai.baseline} />
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Threat Status"
            subtitle="AI forecast"
            icon={<ShieldAlert size={16} />}
          />
          <div className="p-5">
            <div
              className={`flex items-center justify-between rounded-lg border ${c.border} ${c.bg} px-4 py-3`}
            >
              <span className="text-sm text-slate-300">Threat level</span>
              <span className={`text-lg font-bold ${c.text}`}>
                {ai.threatLevel}
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-300">
              {ai.forecast}
            </p>
            <div className="mt-4 space-y-2 text-xs text-slate-400">
              <Row label="Anomaly score" value={`${ai.anomalyScore}%`} />
              <Row
                label="Baseline"
                value={
                  ai.baselineReady
                    ? `${Math.round(ai.baseline)} rps`
                    : "calibrating"
                }
              />
              <Row label="Reason" value={ai.reason} />
            </div>
          </div>
        </Card>
      </div>

      {/* Sparklines + quick links */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader title="Traffic trend" icon={<TrendingUp size={16} />} />
          <div className="p-4">
            <Sparkline data={recentRps} color="#38bdf8" />
            <p className="mt-2 text-xs text-slate-500">Last 15s · requests/sec</p>
          </div>
        </Card>
        <Card>
          <CardHeader title="Sessions" icon={<Users size={16} />} />
          <div className="p-4">
            <Sparkline data={recentSessions} color="#22d3ee" />
            <p className="mt-2 text-xs text-slate-500">Last 15s · active</p>
          </div>
        </Card>
        <Card>
          <CardHeader
            title="Data protection"
            icon={<Database size={16} />}
            right={
              lockedCount > 0 ? (
                <Badge className="border border-red-500/40 bg-red-500/15 text-red-300">
                  {lockedCount} locked
                </Badge>
              ) : (
                <Badge className="border border-emerald-500/40 bg-emerald-500/15 text-emerald-300">
                  all clear
                </Badge>
              )
            }
          />
          <div className="p-4">
            <p className="text-sm text-slate-300">
              {lockedCount > 0
                ? `${lockedCount} sensitive record(s) are currently locked due to a detected threat.`
                : "All sensitive records are accessible."}
            </p>
            <Button
              variant="ghost"
              className="mt-3 px-0"
              onClick={() => navigate("documents")}
            >
              <HardDrive size={14} /> Go to Documents
            </Button>
          </div>
        </Card>
      </div>

      {/* Recent alerts */}
      <Card className="mt-4">
        <CardHeader
          title="Recent Alerts"
          icon={<Bell size={16} />}
          right={
            <span className="text-xs text-slate-500">
              {alerts.length} total
            </span>
          }
        />
        <div className="divide-y divide-slate-800">
          {alerts.length === 0 && (
            <p className="px-5 py-6 text-sm text-slate-500">
              No alerts yet. Traffic is normal.
            </p>
          )}
          {alerts.slice(0, 5).map((a) => {
            const ac = THREAT_COLORS[a.threatLevel];
            return (
              <div key={a.id} className="flex items-center gap-3 px-5 py-3">
                <span className={`h-2 w-2 rounded-full ${ac.dot}`} />
                <div className="flex-1">
                  <p className="text-sm text-slate-200">{a.reason}</p>
                  <p className="text-xs text-slate-500">{formatTime(a.time)}</p>
                </div>
                <Badge className={`${ac.border} ${ac.bg} ${ac.text} border`}>
                  {a.threatLevel} · {a.riskScore}%
                </Badge>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
        <LayoutDashboard size={12} /> This is a user dashboard. Admin controls
        live in the Admin Dashboard.
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
