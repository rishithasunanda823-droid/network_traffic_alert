import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

export type Route =
  | "home"
  | "login"
  | "dashboard"
  | "profile"
  | "documents"
  | "admin";

export interface Session {
  email: string;
  isAdmin: boolean;
  name: string;
}

interface RouterValue {
  route: Route;
  navigate: (r: Route) => void;
  session: Session | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

const RouterContext = createContext<RouterValue | null>(null);

export function useRouter(): RouterValue {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error("useRouter must be used within RouterProvider");
  return ctx;
}

const DEMO_USERS: Record<string, { password: string; session: Session }> = {
  "admin@demo.sec": {
    password: "admin123",
    session: { email: "admin@demo.sec", isAdmin: true, name: "Demo Administrator" },
  },
  "user@demo.sec": {
    password: "user123",
    session: { email: "user@demo.sec", isAdmin: false, name: "Jordan User" },
  },
};

export function RouterProvider({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState<Route>("home");
  const [session, setSession] = useState<Session | null>(null);

  const navigate = (r: Route) => setRoute(r);
  const login = (email: string, password: string) => {
    const entry = DEMO_USERS[email.toLowerCase()];
    if (entry && entry.password === password) {
      setSession(entry.session);
      setRoute(entry.session.isAdmin ? "admin" : "dashboard");
      return true;
    }
    return false;
  };
  const logout = () => {
    setSession(null);
    setRoute("home");
  };

  return (
    <RouterContext.Provider value={{ route, navigate, session, login, logout }}>
      {children}
    </RouterContext.Provider>
  );
}
