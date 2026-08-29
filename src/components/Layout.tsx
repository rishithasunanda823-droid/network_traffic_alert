import {
  Activity,
  FileLock2,
  LayoutDashboard,
  LogIn,
  LogOut,
  ShieldCheck,
  ShieldAlert,
  UserCircle2,
  FolderLock,
  Home as HomeIcon,
} from "lucide-react";
import { useRouter } from "@/router";
import { useStore } from "@/store";
import { THREAT_COLORS } from "@/theme";
import { Badge } from "@/components/ui";
import type { Route } from "@/router";
import type { ReactNode } from "react";

const NAV: { route: Route; label: string; icon: ReactNode; adminOnly?: boolean; auth?: boolean }[] = [
  { route: "home", label: "Home", icon: <HomeIcon size={16} /> },
  { route: "login", label: "Login", icon: <LogIn size={16} /> },
  { route: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={16} />, auth: true },
  { route: "profile", label: "Profile", icon: <UserCircle2 size={16} />, auth: true },
  { route: "documents", label: "Documents", icon: <FolderLock size={16} />, auth: true },
  { route: "admin", label: "Admin", icon: <ShieldCheck size={16} />, adminOnly: true },
];

export function Layout({ children }: { children: ReactNode }) {
  const { route, navigate, session, logout } = useRouter();
  const { ai } = useStore();
  const c = THREAT_COLORS[ai.threatLevel];

  return (
    <div className="min-h-screen bg-[#060a14] text-slate-200">
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-[#080d1a]/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <button
            onClick={() => navigate("home")}
            className="flex items-center gap-2.5"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-cyan-600 shadow-lg shadow-sky-500/20">
              <ShieldCheck size={20} className="text-white" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold leading-tight text-slate-100">
                NetGuard AI
              </p>
              <p className="text-[10px] leading-tight text-slate-500">
                Attack Forecasting & Protection
              </p>
            </div>
          </button>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV.filter(
              (n) =>
                (!n.adminOnly || session?.isAdmin) &&
                (!n.auth || session),
            ).map((n) => (
              <button
                key={n.route}
                onClick={() => navigate(n.route)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  route === n.route
                    ? "bg-slate-800 text-sky-300"
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                }`}
              >
                {n.icon}
                {n.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("admin")}
              className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${c.border} ${c.bg} ${c.text}`}
            >
              <span className={`h-2 w-2 rounded-full ${c.dot} ${ai.threatLevel === "CRITICAL" ? "blink" : ""}`} />
              {ai.threatLevel}
            </button>
            {session ? (
              <div className="flex items-center gap-2">
                <span className="hidden text-xs text-slate-400 sm:inline">
                  {session.email}
                </span>
                <button
                  onClick={logout}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-700 px-2.5 py-1.5 text-xs text-slate-300 hover:bg-slate-800"
                >
                  <LogOut size={14} /> Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate("login")}
                className="rounded-lg bg-sky-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-400"
              >
                Sign in
              </button>
            )}
          </div>
        </div>

        {/* mobile nav */}
        <div className="flex gap-1 overflow-x-auto px-3 pb-2 md:hidden">
          {NAV.filter(
            (n) => (!n.adminOnly || session?.isAdmin) && (!n.auth || session),
          ).map((n) => (
            <button
              key={n.route}
              onClick={() => navigate(n.route)}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium ${
                route === n.route ? "bg-slate-800 text-sky-300" : "text-slate-400"
              }`}
            >
              {n.icon}
              {n.label}
            </button>
          ))}
        </div>
      </header>

      {/* Global alert banner */}
      {(ai.threatLevel === "HIGH" || ai.threatLevel === "CRITICAL") && (
        <div className="slide-in mx-auto max-w-7xl px-4 pt-4">
          <div className="flex items-center gap-3 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3">
            <ShieldAlert size={20} className="shrink-0 text-red-400" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-300">
                SECURITY ALERT — {ai.threatLevel}
              </p>
              <p className="text-xs text-red-200/80">{ai.reason}</p>
            </div>
            <Badge className="border border-red-500/40 bg-red-500/20 text-red-200">
              Risk {Math.round(ai.riskScore)}%
            </Badge>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>

      <footer className="mx-auto max-w-7xl px-4 pb-8 pt-4">
        <div className="flex flex-col items-center justify-between gap-2 border-t border-slate-800 pt-4 text-xs text-slate-500 sm:flex-row">
          <p className="flex items-center gap-1.5">
            <Activity size={12} /> Prototype forecasting system — based on
            traffic anomalies, not a guarantee of an actual future attack.
          </p>
          <p className="flex items-center gap-1.5">
            <FileLock2 size={12} /> All data is synthetic / dummy. No external
            traffic is generated.
          </p>
        </div>
      </footer>
    </div>
  );
}
