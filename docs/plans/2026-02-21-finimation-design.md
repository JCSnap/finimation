# Finimation — Design Document

**Date:** 2026-02-21
**Status:** Approved

## Overview

A static, client-side web app for visualising finance concepts interactively. Targeted at university finance/economics students. Similar in spirit to VisuAlgo but for finance. Deployable to GitHub Pages with no backend.

---

## Architecture

**Stack:** React + Vite + TypeScript
**Routing:** Hash-based (`/#/options`, `/#/bonds`) — works on GitHub Pages without server-side redirects
**Charts:** Recharts
**Markdown rendering:** react-markdown + remark-gfm
**Styling:** Tailwind CSS
**Deployment:** GitHub Actions → GitHub Pages (`gh-pages` branch)

---

## Project Structure

```
finimation/
├── src/
│   ├── modules/
│   │   ├── options/
│   │   │   ├── index.tsx          # Visualization component
│   │   │   ├── notes.md           # Markdown explanatory notes
│   │   │   └── meta.ts            # id, title, category, description
│   │   ├── bonds/
│   │   ├── portfolio/
│   │   └── tvm/
│   ├── registry.ts                # Imports all modules, exports sidebar list
│   ├── components/
│   │   ├── Layout.tsx             # Sidebar + content split
│   │   ├── Sidebar.tsx            # Auto-generated from registry
│   │   ├── MarkdownPanel.tsx      # Renders notes.md
│   │   └── VisualizationPanel.tsx # Renders chart + controls
│   └── App.tsx                    # Hash router, module dispatch
├── public/
├── vite.config.ts
└── .github/workflows/deploy.yml
```

---

## Layout

```
┌─────────────────────────────────────────────────────┐
│  finimation                               [header]  │
├──────────────┬──────────────────────────────────────┤
│              │  Notes panel (left)  │  Chart panel  │
│  Sidebar     │  (react-markdown)    │  (Recharts +  │
│  (concept    │                      │   controls)   │
│   list,      │                      │               │
│   grouped    │                      │               │
│   by         │                      │               │
│   category)  │                      │               │
└──────────────┴──────────────────────────────────────┘
```

- **Sidebar** — grouped by category (Derivatives, Fixed Income, Portfolio Theory, TVM). Collapsible groups. Active item highlighted.
- **Notes panel** — renders module `notes.md` via react-markdown. Scrolls independently.
- **Visualization panel** — module chart(s) + sliders/number inputs. All computation is pure JS, no API calls. Re-renders reactively on input change.
- **Responsive** — on mobile, sidebar collapses to hamburger; notes + chart stack vertically.

---

## Module Contract

Each module is a self-contained folder:

```ts
// meta.ts
export const meta = {
  id: 'options-payoff',         // used as route key
  title: 'Options Payoff',
  category: 'Derivatives',
  description: 'Visualise call and put payoffs under different scenarios',
}
```

```tsx
// index.tsx
export default function OptionsPayoff() {
  // local state for all interactive variables
  // pure JS math to derive chart data from state
  // return Recharts + slider controls
}
```

```md
<!-- notes.md -->
# Options Payoff
An option gives the buyer the right (but not obligation) to buy/sell ...
```

**registry.ts** collects all modules and exports a typed list. The sidebar auto-generates from this. Adding a new concept = create folder + register.

---

## Initial Modules

| Module | Category | Key variables | Chart type |
|---|---|---|---|
| Options Payoff | Derivatives | Strike, premium, type (call/put) | Payoff curve (line) |
| Bond Pricing | Fixed Income | Face value, coupon rate, YTM, maturity | Price vs YTM line chart |
| Efficient Frontier | Portfolio Theory | Expected returns + correlation (2 assets) | Scatter + frontier curve |
| TVM / Annuity | Time Value of Money | PV, FV, rate, periods | Bar / timeline |

---

## Deployment

- `vite.config.ts`: `base: '/finimation/'`
- GitHub Actions: push to `main` → `npm run build` → deploy `dist/` to `gh-pages` branch
- Live at: `https://<username>.github.io/finimation/`

---

## Key Dependencies

| Package | Purpose |
|---|---|
| react, react-dom | UI framework |
| typescript | Type safety |
| vite | Build tool |
| react-router-dom | Hash-based routing |
| recharts | Charts |
| react-markdown | Markdown notes rendering |
| remark-gfm | GitHub-flavoured markdown |
| tailwindcss | Styling |

---

## Out of Scope (v1)

- Backend, database, auth
- Persistent state across sessions
- Real market data / live feeds
- Black-Scholes options pricing (could be v2)
- Mobile-first design (responsive but desktop-primary)
