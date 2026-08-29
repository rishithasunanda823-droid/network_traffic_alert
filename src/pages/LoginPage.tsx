import { useState } from "react";
import { ShieldCheck, AlertCircle, Info } from "lucide-react";
import { useRouter } from "@/router";
import { Button } from "@/components/ui";

export function LoginPage() {
  const { login } = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!login(email, password)) {
      setError("Invalid credentials. Use one of the demo accounts below.");
    }
  };

  const fill = (e: string, p: string) => {
    setEmail(e);
    setPassword(p);
    setError("");
  };

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-cyan-600 shadow-lg shadow-sky-500/20">
          <ShieldCheck size={24} className="text-white" />
        </div>
        <h1 className="text-xl font-semibold text-slate-100">Sign in</h1>
        <p className="mt-1 text-sm text-slate-400">
          Demo authentication for the controlled environment.
        </p>
      </div>

      <form
        onSubmit={submit}
        className="rounded-xl border border-slate-800 bg-slate-900/60 p-6"
      >
        <label className="block text-xs font-medium text-slate-400">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@demo.sec"
          className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-500"
        />
        <label className="mt-4 block text-xs font-medium text-slate-400">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-500"
        />

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
            <AlertCircle size={14} /> {error}
          </div>
        )}

        <Button variant="primary" className="mt-5 w-full">
          Sign in
        </Button>
      </form>

      <div className="mt-4 rounded-lg border border-slate-800 bg-slate-900/40 p-4">
        <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-400">
          <Info size={12} /> Demo accounts
        </div>
        <div className="space-y-2">
          <button
            onClick={() => fill("admin@demo.sec", "admin123")}
            className="flex w-full items-center justify-between rounded-lg border border-slate-800 bg-slate-950/50 px-3 py-2 text-left text-xs hover:border-sky-500/30"
          >
            <span className="text-slate-300">
              <span className="font-semibold text-sky-300">Admin</span> ·
              admin@demo.sec
            </span>
            <span className="text-slate-500">admin123</span>
          </button>
          <button
            onClick={() => fill("user@demo.sec", "user123")}
            className="flex w-full items-center justify-between rounded-lg border border-slate-800 bg-slate-950/50 px-3 py-2 text-left text-xs hover:border-sky-500/30"
          >
            <span className="text-slate-300">
              <span className="font-semibold text-emerald-300">User</span> ·
              user@demo.sec
            </span>
            <span className="text-slate-500">user123</span>
          </button>
        </div>
      </div>
    </div>
  );
}
