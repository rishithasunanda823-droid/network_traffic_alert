import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  icon,
  right,
}: {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  right?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-slate-800 px-5 py-4">
      <div className="flex items-start gap-3">
        {icon && <div className="mt-0.5 text-sky-400">{icon}</div>}
        <div>
          <h3 className="text-sm font-semibold tracking-wide text-slate-100">
            {title}
          </h3>
          {subtitle && (
            <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>
          )}
        </div>
      </div>
      {right}
    </div>
  );
}

export function Stat({
  label,
  value,
  unit,
  accent = "text-slate-100",
  sub,
}: {
  label: string;
  value: string | number;
  unit?: string;
  accent?: string;
  sub?: string;
}) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950/40 px-4 py-3">
      <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p className={`mt-1 text-2xl font-semibold tabular-nums ${accent}`}>
        {value}
        {unit && <span className="ml-1 text-sm font-normal text-slate-500">{unit}</span>}
      </p>
      {sub && <p className="mt-0.5 text-xs text-slate-500">{sub}</p>}
    </div>
  );
}

export function Badge({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}`}
    >
      {children}
    </span>
  );
}

export function Button({
  children,
  onClick,
  variant = "default",
  disabled,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "default" | "primary" | "danger" | "ghost";
  disabled?: boolean;
  className?: string;
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-40";
  const styles: Record<string, string> = {
    default:
      "border border-slate-700 bg-slate-800 text-slate-100 hover:bg-slate-700",
    primary:
      "border border-sky-500/40 bg-sky-500/15 text-sky-300 hover:bg-sky-500/25",
    danger:
      "border border-red-500/40 bg-red-500/15 text-red-300 hover:bg-red-500/25",
    ghost: "text-slate-300 hover:bg-slate-800",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
