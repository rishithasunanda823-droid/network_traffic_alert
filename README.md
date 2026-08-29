# AI-Based Network Attack Forecasting & Protection System

A fully functional, self-contained cybersecurity **prototype** that simulates
network traffic, learns a normal baseline, forecasts possible attacks, raises
security alerts, and automatically protects sensitive data when a threat is
detected.

> **Prototype only.** All traffic and data are synthetic/dummy. Nothing is sent
> to any external host — every request is generated inside the controlled demo
> environment in the browser. The forecasting is based on traffic anomalies and
> is **not** a guarantee of an actual future attack.

## What it does

1. **Reference demo website** — Home, Login, User Dashboard, Profile,
   Documents/Data, and Admin Dashboard pages, all with clearly marked dummy
   sensitive data.
2. **Normal traffic** — the simulator generates realistic per-second traffic
   and the dashboard shows traffic volume, requests/sec, active sessions, data
   transfer rate, and the learned normal baseline.
3. **Manual traffic control** — a Traffic Simulator in the Admin Dashboard with
   a slider, Increase Traffic button, and intensity levels
   (Normal / Elevated / High / Critical).
4. **AI-based analysis** — a rule-based model calibrates a baseline from the
   first ~12 seconds of traffic, then continuously scores each second for
   anomaly score, attack risk score, and threat level (LOW / MEDIUM / HIGH /
   CRITICAL).
5. **Attack forecasting** — plain-language forecasts escalate with the threat
   level, from "Network activity is normal" up to "Protection measures
   activated."
6. **Alert system** — at HIGH/CRITICAL a prominent security alert fires with a
   timestamp, detected reason, and risk score, and is appended to the Alert
   History.
7. **Sensitive data protection** — dummy sensitive records auto-lock at
   HIGH/CRITICAL, show a lock icon, display "Sensitive data protected due to
   detected threat," and stay inaccessible to normal users. An admin can unlock
   them after the threat clears. Data is never deleted or modified.
8. **Dashboard** — a modern SOC-style dashboard with a real-time traffic graph,
   normal-vs-suspicious breakdown, risk gauge, threat level, attack forecast,
   active alerts, data-protection status, alert history, a live traffic log,
   and the traffic simulator controls.

## Demo flow

1. Open the site — normal traffic is already flowing.
2. Watch the dashboard learn and display the normal baseline (~12s).
3. Sign in as admin and open the Admin Dashboard.
4. Use the Traffic Simulator to increase traffic.
5. The AI detects the anomaly; risk score and threat level climb
   LOW → MEDIUM → HIGH.
6. A security alert fires automatically.
7. The forecast updates to "Potential attack risk detected."
8. Sensitive records auto-lock; normal users can't open them.
9. The admin clicks **Clear Threat**, then **Unlock all**.
10. The dashboard returns to normal monitoring.

## Demo accounts

| Role  | Email             | Password   |
| ----- | ----------------- | ---------- |
| Admin | `admin@demo.sec`  | `admin123` |
| User  | `user@demo.sec`   | `user123`  |

## Tech stack

- **React + TypeScript + Vite** — single-page frontend
- **Tailwind CSS** — styling
- **lucide-react** — icons
- **Inline SVG charts** — real-time traffic graph, risk gauge, sparklines
  (no chart dependency)
- All traffic generation, AI analysis, alerts, and data-locking run **live in
  the browser** — no backend, no database, no external calls.

## Getting started

```bash
# install dependencies
npm install

# start the dev server
npm run dev

# build for production
npm run build

# typecheck
npm run typecheck
```

Then open the URL Vite prints (default `http://localhost:5173`).

## Folder structure

```
src/
├── App.tsx                  # Root: providers + page router
├── main.tsx                 # React entry
├── index.css                # Tailwind + custom animations
├── types.ts                 # Domain types
├── engine.ts                # Traffic simulator + AI analysis engine
├── store.tsx                # Central store: real-time tick loop, alerts, data locks
├── router.tsx               # Tiny in-app router + demo auth
├── theme.ts                 # Threat-level colors + helpers
├── components/
│   ├── ui.tsx               # Card, Stat, Badge, Button primitives
│   ├── charts.tsx           # TrafficChart, RiskGauge, Sparkline (SVG)
│   └── Layout.tsx           # Nav, header, global alert banner, footer
└── pages/
    ├── HomePage.tsx         # Landing page
    ├── LoginPage.tsx       # Demo sign-in
    ├── UserDashboard.tsx    # User view: traffic, threat, alerts, data status
    ├── ProfilePage.tsx      # Dummy profile
    ├── DocumentsPage.tsx    # Sensitive data with locking + admin unlock
    └── AdminDashboard.tsx   # Full SOC dashboard + traffic simulator
```

## How the AI engine works

The engine (`src/engine.ts`) has two parts:

- **Traffic simulator** — draws a normal component from a Gaussian around a
  fixed mean (~48 rps) and adds an injected suspicious component sized by the
  admin's intensity setting (0 → 240 rps).
- **Analysis engine** — calibrates a baseline (mean + std) from the first 12
  samples, then scores each new sample by how many standard deviations it sits
  above the baseline. A persistence term makes sustained spikes escalate the
  threat level over time, and the suspicious-traffic share adds a small extra
  signal. The composite risk score maps to LOW / MEDIUM / HIGH / CRITICAL.

Everything is intentionally transparent and rule-based so the demo behavior is
reproducible and explainable during a hackathon presentation.
