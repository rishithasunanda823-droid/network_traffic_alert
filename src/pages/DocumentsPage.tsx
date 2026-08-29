import { useState } from "react";
import {
  FolderLock,
  Lock,
  Unlock,
  ShieldAlert,
  FileText,
  Eye,
  EyeOff,
  Database,
  ShieldCheck,
} from "lucide-react";
import { useRouter } from "@/router";
import { useStore } from "@/store";
import { Card, CardHeader, Button, Badge } from "@/components/ui";
import { formatTime } from "@/theme";
import type { SensitiveRecord } from "@/types";

export function DocumentsPage() {
  const { session } = useRouter();
  const { records, ai, unlockRecord, unlockAll } = useStore();
  const isAdmin = !!session?.isAdmin;
  const [openId, setOpenId] = useState<string | null>(null);
  const [preview, setPreview] = useState(true);

  const lockedCount = records.filter((r) => r.status === "LOCKED").length;
  const threatActive =
    ai.threatLevel === "HIGH" || ai.threatLevel === "CRITICAL";

  const toggle = (r: SensitiveRecord) => {
    if (r.status === "LOCKED" && !isAdmin) return; // normal users can't open locked
    setOpenId((cur) => (cur === r.id ? null : r.id));
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">
            Documents & Sensitive Data
          </h1>
          <p className="text-sm text-slate-400">
            Dummy synthetic records for demonstration. Nothing here is real.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            className={
              lockedCount > 0
                ? "border border-red-500/40 bg-red-500/15 text-red-300"
                : "border border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
            }
          >
            <Lock size={12} /> {lockedCount} locked · {records.length - lockedCount}{" "}
            open
          </Badge>
          {isAdmin && lockedCount > 0 && (
            <Button variant="primary" onClick={unlockAll}>
              <Unlock size={14} /> Unlock all
            </Button>
          )}
        </div>
      </div>

      {/* Protection status banner */}
      {threatActive && (
        <div className="slide-in mb-4 flex items-start gap-3 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3">
          <ShieldAlert size={18} className="mt-0.5 shrink-0 text-red-400" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-300">
              Sensitive data protected due to detected threat
            </p>
            <p className="text-xs text-red-200/80">
              {lockedCount} record(s) auto-locked at {ai.threatLevel} threat
              level. Normal users cannot open them. An admin can unlock after
              the threat is cleared.
            </p>
          </div>
        </div>
      )}
      {!threatActive && lockedCount === 0 && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-3">
          <ShieldCheck size={18} className="shrink-0 text-emerald-400" />
          <p className="text-sm text-emerald-200">
            All sensitive records are accessible. No active threat.
          </p>
        </div>
      )}
      {!threatActive && lockedCount > 0 && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3">
          <ShieldAlert size={18} className="shrink-0 text-amber-400" />
          <p className="text-sm text-amber-200">
            Threat has cleared but {lockedCount} record(s) remain locked. An
            admin can unlock them below.
          </p>
        </div>
      )}

      {/* Records */}
      <div className="grid gap-3 md:grid-cols-2">
        {records.map((r) => {
          const locked = r.status === "LOCKED";
          const isOpen = openId === r.id;
          return (
            <Card key={r.id} className="overflow-hidden">
              <div className="flex items-start justify-between gap-3 p-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      locked
                        ? "bg-red-500/10 text-red-400"
                        : "bg-sky-500/10 text-sky-400"
                    }`}
                  >
                    {locked ? <Lock size={18} /> : <FileText size={18} />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-100">
                      {r.label}
                    </p>
                    <p className="text-xs text-slate-500">{r.category}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      ID: {r.id} · {r.value}
                    </p>
                  </div>
                </div>
                <Badge
                  className={
                    locked
                      ? "border border-red-500/40 bg-red-500/15 text-red-300"
                      : "border border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
                  }
                >
                  {locked ? "LOCKED" : "UNLOCKED"}
                </Badge>
              </div>

              {locked && (
                <div className="border-t border-red-500/20 bg-red-500/5 px-4 py-2.5 text-xs text-red-300/90">
                  <p className="flex items-center gap-1.5">
                    <Lock size={12} /> Sensitive data protected due to detected
                    threat
                  </p>
                  {r.lockedReason && (
                    <p className="mt-1 text-red-300/60">{r.lockedReason}</p>
                  )}
                  {r.lockedAt && (
                    <p className="mt-0.5 text-red-300/60">
                      Locked at {formatTime(r.lockedAt)}
                    </p>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between border-t border-slate-800 px-4 py-2.5">
                <button
                  onClick={() => toggle(r)}
                  disabled={locked && !isAdmin}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-sky-300 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isOpen ? <EyeOff size={12} /> : <Eye size={12} />}
                  {isOpen ? "Hide" : "Preview"}
                </button>
                {locked && isAdmin && (
                  <Button
                    variant="primary"
                    className="px-2.5 py-1 text-xs"
                    onClick={() => unlockRecord(r.id)}
                  >
                    <Unlock size={12} /> Unlock
                  </Button>
                )}
                {locked && !isAdmin && (
                  <span className="text-xs text-red-300/70">
                    Access restricted
                  </span>
                )}
              </div>

              {isOpen && !locked && (
                <div className="border-t border-slate-800 bg-slate-950/40 px-4 py-3">
                  <pre className="whitespace-pre-wrap text-xs text-slate-400">
{JSON.stringify(
  {
    id: r.id,
    label: r.label,
    category: r.category,
    status: r.status,
    sample: preview ? "REDACTED-PREVIEW" : "dummy-record-" + r.id,
    note: "Synthetic data for demonstration only.",
  },
  null,
  2,
)}
                  </pre>
                  <button
                    onClick={() => setPreview((p) => !p)}
                    className="mt-2 text-[11px] text-slate-500 hover:text-slate-300"
                  >
                    toggle preview mode
                  </button>
                </div>
              )}
              {isOpen && locked && isAdmin && (
                <div className="border-t border-slate-800 bg-slate-950/40 px-4 py-3 text-xs text-slate-500">
                  Record remains locked. Unlock it to view contents.
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
        <FolderLock size={12} /> Data is never deleted or modified — locking
        only changes the access status.
      </div>
      <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
        <Database size={12} /> All records are dummy/synthetic for this
        prototype.
      </div>
    </div>
  );
}
