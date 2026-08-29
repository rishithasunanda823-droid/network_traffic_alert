import { UserCircle2, Mail, Shield, Calendar, Lock } from "lucide-react";
import { useRouter } from "@/router";
import { useStore } from "@/store";
import { Card, CardHeader, Badge } from "@/components/ui";
import { THREAT_COLORS } from "@/theme";

export function ProfilePage() {
  const { session } = useRouter();
  const { ai, records } = useStore();
  const c = THREAT_COLORS[ai.threatLevel];
  const lockedCount = records.filter((r) => r.status === "LOCKED").length;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-xl font-semibold text-slate-100">Profile</h1>

      <Card>
        <div className="flex items-center gap-4 border-b border-slate-800 p-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-sky-500/20 to-cyan-600/20 text-sky-300">
            <UserCircle2 size={36} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-100">
              {session?.name}
            </h2>
            <p className="text-sm text-slate-400">{session?.email}</p>
            <div className="mt-1.5 flex gap-2">
              <Badge
                className={`border ${c.border} ${c.bg} ${c.text}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />{" "}
                {ai.threatLevel}
              </Badge>
              <Badge className="border border-slate-700 bg-slate-800 text-slate-300">
                {session?.isAdmin ? "Administrator" : "Standard User"}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid gap-px bg-slate-800 sm:grid-cols-2">
          <Field icon={<Mail size={16} />} label="Email" value={session?.email ?? "—"} />
          <Field
            icon={<Shield size={16} />}
            label="Role"
            value={session?.isAdmin ? "Administrator" : "Standard User"}
          />
          <Field
            icon={<Calendar size={16} />}
            label="Member since"
            value="2026-01-15 (dummy)"
          />
          <Field
            icon={<Lock size={16} />}
            label="Data access"
            value={
              lockedCount > 0
                ? `Restricted — ${lockedCount} records locked`
                : "Full access"
            }
          />
        </div>
      </Card>

      <Card className="mt-4">
        <CardHeader title="Account security" icon={<Shield size={16} />} />
        <div className="space-y-3 p-5 text-sm text-slate-300">
          <p>
            This is a dummy account for demonstration only. No real credentials
            are stored.
          </p>
          <ul className="space-y-2 text-slate-400">
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> MFA
              enabled (simulated)
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Last
              login: today, 09:14 (dummy)
            </li>
            <li className="flex items-center gap-2">
              <span
                className={`h-1.5 w-1.5 rounded-full ${lockedCount > 0 ? "bg-red-400" : "bg-emerald-400"}`}
              />{" "}
              Sensitive data:{" "}
              {lockedCount > 0
                ? "locked by threat protection"
                : "accessible"}
            </li>
          </ul>
        </div>
      </Card>
    </div>
  );
}

function Field({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-slate-900/60 p-5">
      <div className="flex items-center gap-2 text-xs text-slate-500">
        {icon} {label}
      </div>
      <p className="mt-1.5 text-sm text-slate-200">{value}</p>
    </div>
  );
}
