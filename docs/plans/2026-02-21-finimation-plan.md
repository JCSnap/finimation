# Finimation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a static React + Vite finance visualization web app with a sidebar nav, markdown notes panel, and interactive Recharts visualizations for 4 finance concepts.

**Architecture:** Config-driven module registry — each concept lives in its own `src/modules/<name>/` folder with `meta.ts`, `index.tsx`, and `notes.md`. A central `registry.ts` auto-generates the sidebar. Hash-based routing (`/#/options-payoff`) works on GitHub Pages without server config.

**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS v3, Recharts, react-markdown + remark-gfm, react-router-dom (HashRouter), Vitest + React Testing Library

---

## Task 1: Scaffold the project

**Files:**
- Create: `finimation/` (Vite project root — note: the git repo root is one level up, so scaffold inside the existing `finimation/` subfolder)

**Step 1: Scaffold Vite project**

The git repo is at `/Users/jcjustin/Projects/finimation`. The actual app lives directly in that folder. Run from `/Users/jcjustin/Projects/`:

```bash
npm create vite@latest finimation -- --template react-ts
```

When prompted, select: React → TypeScript. This overwrites the empty folder — that's fine since only `docs/` exists.

**Step 2: Verify scaffold**

```bash
cd /Users/jcjustin/Projects/finimation
ls
```

Expected output includes: `src/`, `public/`, `package.json`, `vite.config.ts`, `tsconfig.json`

**Step 3: Install base dependencies**

```bash
npm install
npm install react-router-dom recharts react-markdown remark-gfm
npm install -D tailwindcss postcss autoprefixer vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

**Step 4: Init Tailwind**

```bash
npx tailwindcss init -p
```

**Step 5: Configure Tailwind** — edit `tailwind.config.js`:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: { extend: {} },
  plugins: [],
}
```

**Step 6: Replace `src/index.css` with Tailwind directives**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**Step 7: Configure Vite** — replace `vite.config.ts`:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/finimation/',
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
})
```

**Step 8: Create test setup file** — create `src/test/setup.ts`:

```ts
import '@testing-library/jest-dom'
```

**Step 9: Add test script** — in `package.json`, add to `"scripts"`:

```json
"test": "vitest",
"test:run": "vitest run"
```

**Step 10: Add `"types": ["vitest/globals"]` to `tsconfig.json`** under `compilerOptions`:

```json
"types": ["vitest/globals"]
```

**Step 11: Delete boilerplate** — delete `src/App.css` and clear `src/App.tsx` (leave empty file for now). Delete contents of `src/assets/`.

**Step 12: Verify tests run**

```bash
npm run test:run
```

Expected: `No test files found` (no error, just no tests yet).

**Step 13: Commit**

```bash
git add -A
git commit -m "feat: scaffold Vite + React + TS + Tailwind + Vitest project"
```

---

## Task 2: Define the module registry type system

**Files:**
- Create: `src/types/module.ts`
- Create: `src/registry.ts`

**Step 1: Write failing test** — create `src/test/registry.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { registry } from '../registry'

describe('registry', () => {
  it('exports an array', () => {
    expect(Array.isArray(registry)).toBe(true)
  })

  it('each entry has required fields', () => {
    for (const mod of registry) {
      expect(mod.meta.id).toBeTruthy()
      expect(mod.meta.title).toBeTruthy()
      expect(mod.meta.category).toBeTruthy()
      expect(typeof mod.component).toBe('function')
      expect(typeof mod.notes).toBe('string')
    }
  })
})
```

**Step 2: Run test to verify it fails**

```bash
npm run test:run
```

Expected: FAIL — `Cannot find module '../registry'`

**Step 3: Create `src/types/module.ts`**

```ts
import { ComponentType } from 'react'

export interface ModuleMeta {
  id: string
  title: string
  category: string
  description: string
}

export interface FinanceModule {
  meta: ModuleMeta
  component: ComponentType
  notes: string
}
```

**Step 4: Create stub `src/registry.ts`**

```ts
import { FinanceModule } from './types/module'

export const registry: FinanceModule[] = []
```

**Step 5: Run tests — expect pass**

```bash
npm run test:run
```

Expected: PASS (empty registry satisfies the "is array" test; the "each entry" loop passes vacuously on empty array)

**Step 6: Commit**

```bash
git add src/types/module.ts src/registry.ts src/test/registry.test.ts
git commit -m "feat: add module type system and empty registry"
```

---

## Task 3: Build the shell layout

**Files:**
- Create: `src/components/Layout.tsx`
- Create: `src/components/Sidebar.tsx`
- Create: `src/App.tsx`
- Modify: `src/main.tsx`

**Step 1: Create `src/components/Sidebar.tsx`**

```tsx
import { NavLink } from 'react-router-dom'
import { registry } from '../registry'
import { ModuleMeta } from '../types/module'

function groupByCategory(modules: { meta: ModuleMeta }[]) {
  return modules.reduce<Record<string, ModuleMeta[]>>((acc, mod) => {
    const cat = mod.meta.category
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(mod.meta)
    return acc
  }, {})
}

export function Sidebar() {
  const grouped = groupByCategory(registry)

  return (
    <nav className="w-56 min-w-56 h-full bg-gray-900 text-gray-200 flex flex-col overflow-y-auto">
      <div className="px-4 py-5 border-b border-gray-700">
        <span className="text-lg font-bold tracking-tight text-white">finimation</span>
      </div>
      <div className="flex-1 py-4 space-y-4">
        {Object.entries(grouped).map(([category, metas]) => (
          <div key={category}>
            <p className="px-4 text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1">
              {category}
            </p>
            <ul>
              {metas.map((meta) => (
                <li key={meta.id}>
                  <NavLink
                    to={`/${meta.id}`}
                    className={({ isActive }) =>
                      `block px-4 py-2 text-sm rounded-r-lg transition-colors ${
                        isActive
                          ? 'bg-blue-600 text-white font-medium'
                          : 'text-gray-300 hover:bg-gray-800'
                      }`
                    }
                  >
                    {meta.title}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  )
}
```

**Step 2: Create `src/components/Layout.tsx`**

```tsx
import { ReactNode } from 'react'
import { Sidebar } from './Sidebar'

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50 text-gray-900">
      <Sidebar />
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  )
}
```

**Step 3: Create `src/App.tsx`**

```tsx
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import { registry } from './registry'

export default function App() {
  const first = registry[0]

  return (
    <HashRouter>
      <Layout>
        <Routes>
          {registry.map((mod) => (
            <Route
              key={mod.meta.id}
              path={`/${mod.meta.id}`}
              element={<ModuleView mod={mod} />}
            />
          ))}
          {first && <Route path="*" element={<Navigate to={`/${first.meta.id}`} replace />} />}
          {!first && (
            <Route
              path="*"
              element={
                <div className="flex items-center justify-center h-full text-gray-400">
                  No modules registered yet.
                </div>
              }
            />
          )}
        </Routes>
      </Layout>
    </HashRouter>
  )
}

function ModuleView({ mod }: { mod: (typeof registry)[number] }) {
  const Component = mod.component
  return (
    <div className="flex h-full overflow-hidden">
      {/* Notes panel */}
      <div className="w-96 min-w-80 h-full overflow-y-auto border-r border-gray-200 bg-white px-6 py-6 prose prose-sm max-w-none">
        <div dangerouslySetInnerHTML={{ __html: '' }} />
        <NotesPanel notes={mod.notes} />
      </div>
      {/* Visualization panel */}
      <div className="flex-1 h-full overflow-y-auto px-6 py-6">
        <Component />
      </div>
    </div>
  )
}

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

function NotesPanel({ notes }: { notes: string }) {
  return <ReactMarkdown remarkPlugins={[remarkGfm]}>{notes}</ReactMarkdown>
}
```

**Step 4: Update `src/main.tsx`** — ensure it imports `index.css`:

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

**Step 5: Start dev server and verify shell renders**

```bash
npm run dev
```

Open `http://localhost:5173/finimation/`. Expected: dark sidebar with "finimation" title, white notes area, gray viz area. No modules yet so "No modules registered yet" message shows.

**Step 6: Commit**

```bash
git add src/components/ src/App.tsx src/main.tsx
git commit -m "feat: add shell layout with sidebar and module view panels"
```

---

## Task 4: Options Payoff module

**Files:**
- Create: `src/modules/options/meta.ts`
- Create: `src/modules/options/math.ts`
- Create: `src/modules/options/math.test.ts`
- Create: `src/modules/options/notes.md`
- Create: `src/modules/options/index.tsx`
- Modify: `src/registry.ts`

**Step 1: Write failing math tests** — create `src/modules/options/math.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { callPayoff, putPayoff, buildPayoffSeries } from './math'

describe('callPayoff', () => {
  it('is zero when price < strike', () => {
    expect(callPayoff(90, 100, 5)).toBe(-5)
  })
  it('is positive when price > strike', () => {
    expect(callPayoff(120, 100, 5)).toBe(15)
  })
  it('is -premium at expiry when at-the-money', () => {
    expect(callPayoff(100, 100, 5)).toBe(-5)
  })
})

describe('putPayoff', () => {
  it('is zero when price > strike', () => {
    expect(putPayoff(110, 100, 5)).toBe(-5)
  })
  it('is positive when price < strike', () => {
    expect(putPayoff(80, 100, 5)).toBe(15)
  })
})

describe('buildPayoffSeries', () => {
  it('returns array of {price, payoff} objects', () => {
    const series = buildPayoffSeries('call', 100, 5, 50, 150, 10)
    expect(series.length).toBeGreaterThan(0)
    expect(series[0]).toHaveProperty('price')
    expect(series[0]).toHaveProperty('payoff')
  })
})
```

**Step 2: Run tests — expect fail**

```bash
npm run test:run
```

Expected: FAIL — `Cannot find module './math'`

**Step 3: Create `src/modules/options/math.ts`**

```ts
export function callPayoff(spotPrice: number, strikePrice: number, premium: number): number {
  return Math.max(spotPrice - strikePrice, 0) - premium
}

export function putPayoff(spotPrice: number, strikePrice: number, premium: number): number {
  return Math.max(strikePrice - spotPrice, 0) - premium
}

export function buildPayoffSeries(
  type: 'call' | 'put',
  strikePrice: number,
  premium: number,
  minPrice: number,
  maxPrice: number,
  steps: number,
): { price: number; payoff: number }[] {
  const fn = type === 'call' ? callPayoff : putPayoff
  const result = []
  const step = (maxPrice - minPrice) / steps
  for (let price = minPrice; price <= maxPrice + 0.001; price += step) {
    result.push({ price: Math.round(price * 100) / 100, payoff: fn(price, strikePrice, premium) })
  }
  return result
}
```

**Step 4: Run tests — expect pass**

```bash
npm run test:run
```

Expected: All options math tests PASS.

**Step 5: Create `src/modules/options/meta.ts`**

```ts
import { ModuleMeta } from '../../types/module'

export const meta: ModuleMeta = {
  id: 'options-payoff',
  title: 'Options Payoff',
  category: 'Derivatives',
  description: 'Visualise call and put option payoffs at expiry under different strike and premium scenarios',
}
```

**Step 6: Create `src/modules/options/notes.md`**

```md
# Options Payoff

An **option** gives the buyer the right (but not the obligation) to buy or sell an asset at a specified price (the **strike price**) before or at expiry.

## Call Option

A **call option** profits when the underlying asset price rises above the strike price.

**Payoff at expiry:**
$$\text{Payoff} = \max(S - K, 0) - \text{Premium}$$

Where $S$ is the spot price at expiry and $K$ is the strike price.

- If $S > K$: in-the-money — you exercise and profit $(S - K) - \text{Premium}$
- If $S \leq K$: out-of-the-money — you let the option expire; loss = Premium paid

## Put Option

A **put option** profits when the underlying asset price falls below the strike price.

**Payoff at expiry:**
$$\text{Payoff} = \max(K - S, 0) - \text{Premium}$$

- If $S < K$: in-the-money — you exercise and profit $(K - S) - \text{Premium}$
- If $S \geq K$: out-of-the-money — loss = Premium paid

## Key Concepts

| Term | Definition |
|------|-----------|
| Strike price ($K$) | The price at which you can buy/sell the asset |
| Premium | The upfront cost of buying the option |
| Break-even | The price where payoff = 0 |
| At-the-money | $S = K$ |

## Interactive Controls

Adjust the **strike price** and **premium** below to see how the payoff curve shifts. Toggle between **Call** and **Put** to compare.
```

**Step 7: Create `src/modules/options/index.tsx`**

```tsx
import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts'
import { buildPayoffSeries } from './math'

export default function OptionsPayoff() {
  const [type, setType] = useState<'call' | 'put'>('call')
  const [strikePrice, setStrikePrice] = useState(100)
  const [premium, setPremium] = useState(10)

  const data = buildPayoffSeries(type, strikePrice, premium, 0, strikePrice * 2, 100)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Options Payoff at Expiry</h2>
        <p className="text-sm text-gray-500">Payoff of a long {type} option as spot price varies at expiry.</p>
      </div>

      {/* Type toggle */}
      <div className="flex gap-2">
        {(['call', 'put'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              type === t ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="grid grid-cols-2 gap-6">
        <SliderControl
          label="Strike Price (K)"
          value={strikePrice}
          min={10}
          max={200}
          step={1}
          format={(v) => `$${v}`}
          onChange={setStrikePrice}
        />
        <SliderControl
          label="Premium"
          value={premium}
          min={1}
          max={50}
          step={1}
          format={(v) => `$${v}`}
          onChange={setPremium}
        />
      </div>

      {/* Chart */}
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="price" label={{ value: 'Spot Price at Expiry ($)', position: 'insideBottom', offset: -2 }} tick={{ fontSize: 11 }} />
            <YAxis label={{ value: 'Payoff ($)', angle: -90, position: 'insideLeft' }} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v: number) => [`$${v.toFixed(2)}`, 'Payoff']} labelFormatter={(l) => `Spot: $${l}`} />
            <ReferenceLine y={0} stroke="#6b7280" strokeWidth={1.5} />
            <ReferenceLine x={strikePrice} stroke="#9ca3af" strokeDasharray="4 4" label={{ value: 'K', position: 'top', fontSize: 11 }} />
            <Line type="monotone" dataKey="payoff" stroke="#2563eb" dot={false} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 text-sm">
        <Stat label="Max Loss" value={`-$${premium}`} color="text-red-600" />
        <Stat label="Break-even" value={type === 'call' ? `$${strikePrice + premium}` : `$${strikePrice - premium}`} color="text-gray-700" />
        <Stat label="Max Gain" value={type === 'call' ? 'Unlimited' : `$${strikePrice - premium}`} color="text-green-600" />
      </div>
    </div>
  )
}

function SliderControl({
  label, value, min, max, step, format, onChange,
}: {
  label: string; value: number; min: number; max: number; step: number
  format: (v: number) => string; onChange: (v: number) => void
}) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className="text-sm font-mono text-blue-600">{format(value)}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-blue-600"
      />
    </div>
  )
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-base font-semibold ${color}`}>{value}</p>
    </div>
  )
}
```

**Step 8: Register the module** — update `src/registry.ts`:

```ts
import { FinanceModule } from './types/module'
import { meta as optionsMeta } from './modules/options/meta'
import OptionsPayoff from './modules/options/index'
import optionsNotes from './modules/options/notes.md?raw'

export const registry: FinanceModule[] = [
  { meta: optionsMeta, component: OptionsPayoff, notes: optionsNotes },
]
```

**Step 9: Add `?raw` import support to `vite.config.ts`** — Vite supports `?raw` out of the box for string imports. No config change needed.

**Step 10: Add `*.md` to TypeScript module declarations** — create `src/types/md.d.ts`:

```ts
declare module '*.md?raw' {
  const content: string
  export default content
}
```

**Step 11: Run tests**

```bash
npm run test:run
```

Expected: All tests PASS.

**Step 12: Verify in browser**

```bash
npm run dev
```

Open `http://localhost:5173/finimation/`. Expected: sidebar shows "Options Payoff" under Derivatives. Notes and chart render. Sliders update chart live.

**Step 13: Commit**

```bash
git add src/modules/options/ src/registry.ts src/types/md.d.ts
git commit -m "feat: add Options Payoff module with payoff curve and controls"
```

---

## Task 5: Bond Pricing module

**Files:**
- Create: `src/modules/bonds/meta.ts`
- Create: `src/modules/bonds/math.ts`
- Create: `src/modules/bonds/math.test.ts`
- Create: `src/modules/bonds/notes.md`
- Create: `src/modules/bonds/index.tsx`
- Modify: `src/registry.ts`

**Step 1: Write failing tests** — create `src/modules/bonds/math.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { bondPrice, buildPriceVsYTMSeries } from './math'

describe('bondPrice', () => {
  it('equals face value when coupon rate equals YTM', () => {
    // 1000 face, 5% coupon, 5% YTM, 10 periods → price = 1000
    expect(bondPrice(1000, 0.05, 0.05, 10)).toBeCloseTo(1000, 1)
  })
  it('is above face value when YTM < coupon rate (premium bond)', () => {
    expect(bondPrice(1000, 0.05, 0.03, 10)).toBeGreaterThan(1000)
  })
  it('is below face value when YTM > coupon rate (discount bond)', () => {
    expect(bondPrice(1000, 0.05, 0.08, 10)).toBeLessThan(1000)
  })
})

describe('buildPriceVsYTMSeries', () => {
  it('returns array with ytm and price keys', () => {
    const series = buildPriceVsYTMSeries(1000, 0.05, 10, 0.01, 0.15, 20)
    expect(series[0]).toHaveProperty('ytm')
    expect(series[0]).toHaveProperty('price')
  })
  it('price decreases as YTM increases', () => {
    const series = buildPriceVsYTMSeries(1000, 0.05, 10, 0.01, 0.15, 20)
    for (let i = 1; i < series.length; i++) {
      expect(series[i].price).toBeLessThan(series[i - 1].price)
    }
  })
})
```

**Step 2: Run — expect fail**

```bash
npm run test:run
```

**Step 3: Create `src/modules/bonds/math.ts`**

```ts
/** Price a fixed-coupon bond using discounted cash flows */
export function bondPrice(
  faceValue: number,
  couponRate: number,
  ytm: number,
  periods: number,
): number {
  const coupon = faceValue * couponRate
  let price = 0
  for (let t = 1; t <= periods; t++) {
    price += coupon / Math.pow(1 + ytm, t)
  }
  price += faceValue / Math.pow(1 + ytm, periods)
  return price
}

export function buildPriceVsYTMSeries(
  faceValue: number,
  couponRate: number,
  periods: number,
  minYTM: number,
  maxYTM: number,
  steps: number,
): { ytm: number; price: number }[] {
  const result = []
  const step = (maxYTM - minYTM) / steps
  for (let ytm = minYTM; ytm <= maxYTM + 0.0001; ytm += step) {
    result.push({
      ytm: Math.round(ytm * 1000) / 10, // as percentage, 1dp
      price: Math.round(bondPrice(faceValue, couponRate, ytm, periods) * 100) / 100,
    })
  }
  return result
}
```

**Step 4: Run — expect pass**

```bash
npm run test:run
```

**Step 5: Create `src/modules/bonds/meta.ts`**

```ts
import { ModuleMeta } from '../../types/module'

export const meta: ModuleMeta = {
  id: 'bond-pricing',
  title: 'Bond Pricing',
  category: 'Fixed Income',
  description: 'Visualise how bond price relates to yield to maturity, coupon rate, and time to maturity',
}
```

**Step 6: Create `src/modules/bonds/notes.md`**

```md
# Bond Pricing

A **bond** is a fixed-income instrument where the issuer promises to pay periodic **coupon payments** and return the **face value** at maturity.

## Pricing Formula

The price of a bond is the present value of all future cash flows discounted at the **yield to maturity (YTM)**:

$$P = \sum_{t=1}^{N} \frac{C}{(1+y)^t} + \frac{F}{(1+y)^N}$$

Where:
- $P$ = bond price
- $C$ = coupon payment $= F \times r$
- $F$ = face value
- $y$ = yield to maturity (per period)
- $N$ = number of periods

## Key Relationships

| Condition | Bond Type | Price vs Face Value |
|-----------|-----------|---------------------|
| YTM = Coupon Rate | Par bond | $P = F$ |
| YTM < Coupon Rate | Premium bond | $P > F$ |
| YTM > Coupon Rate | Discount bond | $P < F$ |

## Duration

**Duration** measures the sensitivity of a bond's price to interest rate changes. Higher duration = more price volatility for the same YTM change.

## Interactive Controls

Adjust the **coupon rate**, **YTM**, **face value**, and **maturity** to see how the price vs. YTM curve shifts.
```

**Step 7: Create `src/modules/bonds/index.tsx`**

```tsx
import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts'
import { bondPrice, buildPriceVsYTMSeries } from './math'

export default function BondPricing() {
  const [faceValue, setFaceValue] = useState(1000)
  const [couponRate, setCouponRate] = useState(5)   // stored as %
  const [ytm, setYtm] = useState(5)                 // stored as %
  const [periods, setPeriods] = useState(10)

  const data = buildPriceVsYTMSeries(faceValue, couponRate / 100, periods, 0.01, 0.20, 100)
  const currentPrice = bondPrice(faceValue, couponRate / 100, ytm / 100, periods)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Bond Pricing</h2>
        <p className="text-sm text-gray-500">Price vs. Yield to Maturity curve for a fixed-coupon bond.</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <SliderControl label="Face Value" value={faceValue} min={100} max={5000} step={100}
          format={(v) => `$${v}`} onChange={setFaceValue} />
        <SliderControl label="Coupon Rate" value={couponRate} min={0} max={20} step={0.5}
          format={(v) => `${v}%`} onChange={setCouponRate} />
        <SliderControl label="Current YTM" value={ytm} min={0.1} max={20} step={0.1}
          format={(v) => `${v}%`} onChange={setYtm} />
        <SliderControl label="Periods to Maturity" value={periods} min={1} max={30} step={1}
          format={(v) => `${v}y`} onChange={setPeriods} />
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, bottom: 20, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="ytm" label={{ value: 'YTM (%)', position: 'insideBottom', offset: -10 }} tick={{ fontSize: 11 }} />
            <YAxis label={{ value: 'Price ($)', angle: -90, position: 'insideLeft' }} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v: number) => [`$${v.toFixed(2)}`, 'Price']} labelFormatter={(l) => `YTM: ${l}%`} />
            <ReferenceLine x={ytm} stroke="#2563eb" strokeDasharray="4 4" label={{ value: 'Current YTM', position: 'top', fontSize: 10 }} />
            <ReferenceLine y={faceValue} stroke="#9ca3af" strokeDasharray="3 3" label={{ value: 'Face Value', position: 'right', fontSize: 10 }} />
            <Line type="monotone" dataKey="price" stroke="#16a34a" dot={false} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-4 text-sm">
        <Stat label="Current Price" value={`$${currentPrice.toFixed(2)}`} color="text-blue-600" />
        <Stat label="vs Face Value" value={currentPrice > faceValue ? 'Premium' : currentPrice < faceValue ? 'Discount' : 'Par'} color={currentPrice > faceValue ? 'text-green-600' : currentPrice < faceValue ? 'text-red-600' : 'text-gray-700'} />
        <Stat label="Annual Coupon" value={`$${(faceValue * couponRate / 100).toFixed(2)}`} color="text-gray-700" />
      </div>
    </div>
  )
}

function SliderControl({ label, value, min, max, step, format, onChange }: {
  label: string; value: number; min: number; max: number; step: number
  format: (v: number) => string; onChange: (v: number) => void
}) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className="text-sm font-mono text-blue-600">{format(value)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-blue-600" />
    </div>
  )
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-base font-semibold ${color}`}>{value}</p>
    </div>
  )
}
```

**Step 8: Register** — add to `src/registry.ts`:

```ts
import { meta as bondsMeta } from './modules/bonds/meta'
import BondPricing from './modules/bonds/index'
import bondsNotes from './modules/bonds/notes.md?raw'

// add to registry array:
{ meta: bondsMeta, component: BondPricing, notes: bondsNotes },
```

**Step 9: Run tests and check browser**

```bash
npm run test:run
npm run dev
```

Expected: All tests pass. Bond Pricing appears in sidebar under Fixed Income.

**Step 10: Commit**

```bash
git add src/modules/bonds/ src/registry.ts
git commit -m "feat: add Bond Pricing module with price vs YTM curve"
```

---

## Task 6: Efficient Frontier module

**Files:**
- Create: `src/modules/portfolio/meta.ts`
- Create: `src/modules/portfolio/math.ts`
- Create: `src/modules/portfolio/math.test.ts`
- Create: `src/modules/portfolio/notes.md`
- Create: `src/modules/portfolio/index.tsx`
- Modify: `src/registry.ts`

**Step 1: Write failing tests** — create `src/modules/portfolio/math.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { portfolioStats, buildFrontier } from './math'

describe('portfolioStats', () => {
  it('fully invested in asset 1 returns asset 1 stats', () => {
    const { ret, risk } = portfolioStats(0.1, 0.2, 0.15, 0.25, 0.3, 1.0)
    expect(ret).toBeCloseTo(0.1, 5)
    expect(risk).toBeCloseTo(0.2, 5)
  })
  it('fully invested in asset 2 returns asset 2 stats', () => {
    const { ret, risk } = portfolioStats(0.1, 0.2, 0.15, 0.25, 0.3, 0.0)
    expect(ret).toBeCloseTo(0.15, 5)
    expect(risk).toBeCloseTo(0.25, 5)
  })
})

describe('buildFrontier', () => {
  it('returns array of portfolio points', () => {
    const pts = buildFrontier(0.1, 0.2, 0.15, 0.25, 0.3, 20)
    expect(pts.length).toBe(21)
    expect(pts[0]).toHaveProperty('risk')
    expect(pts[0]).toHaveProperty('ret')
    expect(pts[0]).toHaveProperty('weight1')
  })
})
```

**Step 2: Run — expect fail**

```bash
npm run test:run
```

**Step 3: Create `src/modules/portfolio/math.ts`**

```ts
/** Portfolio return and risk for 2-asset portfolio */
export function portfolioStats(
  ret1: number, risk1: number,
  ret2: number, risk2: number,
  correlation: number,
  weight1: number,
): { ret: number; risk: number } {
  const w2 = 1 - weight1
  const ret = weight1 * ret1 + w2 * ret2
  const variance =
    weight1 ** 2 * risk1 ** 2 +
    w2 ** 2 * risk2 ** 2 +
    2 * weight1 * w2 * correlation * risk1 * risk2
  return { ret, risk: Math.sqrt(variance) }
}

export function buildFrontier(
  ret1: number, risk1: number,
  ret2: number, risk2: number,
  correlation: number,
  steps: number,
): { risk: number; ret: number; weight1: number }[] {
  const result = []
  for (let i = 0; i <= steps; i++) {
    const weight1 = i / steps
    const { ret, risk } = portfolioStats(ret1, risk1, ret2, risk2, correlation, weight1)
    result.push({
      risk: Math.round(risk * 10000) / 100, // as %
      ret: Math.round(ret * 10000) / 100,   // as %
      weight1: Math.round(weight1 * 100),
    })
  }
  return result
}
```

**Step 4: Run — expect pass**

```bash
npm run test:run
```

**Step 5: Create `src/modules/portfolio/meta.ts`**

```ts
import { ModuleMeta } from '../../types/module'

export const meta: ModuleMeta = {
  id: 'efficient-frontier',
  title: 'Efficient Frontier',
  category: 'Portfolio Theory',
  description: 'Explore the mean-variance efficient frontier for a two-asset portfolio',
}
```

**Step 6: Create `src/modules/portfolio/notes.md`**

```md
# Efficient Frontier

The **efficient frontier** shows the set of portfolios that maximise expected return for a given level of risk (standard deviation).

## Two-Asset Portfolio

For a portfolio of two assets with weights $w_1$ and $w_2 = 1 - w_1$:

**Expected Return:**
$$E[R_p] = w_1 E[R_1] + w_2 E[R_2]$$

**Portfolio Variance:**
$$\sigma_p^2 = w_1^2 \sigma_1^2 + w_2^2 \sigma_2^2 + 2 w_1 w_2 \rho_{12} \sigma_1 \sigma_2$$

Where $\rho_{12}$ is the **correlation** between the two assets.

## Effect of Correlation

| Correlation | Diversification Benefit |
|-------------|------------------------|
| $\rho = +1$ | No benefit — linear combination |
| $0 < \rho < 1$ | Some benefit |
| $\rho = 0$ | Full independence |
| $\rho = -1$ | Maximum diversification — can achieve zero risk |

## Minimum Variance Portfolio

The leftmost point on the frontier is the **minimum variance portfolio (MVP)** — the combination with the lowest possible risk.

## Interactive Controls

Adjust the returns, risks, and correlation of the two assets. The curve shows all possible portfolio combinations as you vary $w_1$ from 0% to 100%.
```

**Step 7: Create `src/modules/portfolio/index.tsx`**

```tsx
import { useState } from 'react'
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { buildFrontier } from './math'

export default function EfficientFrontier() {
  const [ret1, setRet1] = useState(8)      // %
  const [risk1, setRisk1] = useState(12)   // %
  const [ret2, setRet2] = useState(14)     // %
  const [risk2, setRisk2] = useState(20)   // %
  const [corr, setCorr] = useState(0.3)

  const data = buildFrontier(ret1 / 100, risk1 / 100, ret2 / 100, risk2 / 100, corr, 100)
  const minVariance = data.reduce((min, p) => (p.risk < min.risk ? p : min), data[0])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Efficient Frontier</h2>
        <p className="text-sm text-gray-500">Two-asset portfolio — risk vs return as allocation varies.</p>
      </div>

      <div className="grid grid-cols-2 gap-x-8 gap-y-4">
        <div className="col-span-2 text-xs font-semibold uppercase tracking-widest text-gray-400">Asset 1</div>
        <SliderControl label="Expected Return" value={ret1} min={0} max={30} step={0.5} format={(v) => `${v}%`} onChange={setRet1} />
        <SliderControl label="Std Deviation (Risk)" value={risk1} min={1} max={40} step={0.5} format={(v) => `${v}%`} onChange={setRisk1} />
        <div className="col-span-2 text-xs font-semibold uppercase tracking-widest text-gray-400">Asset 2</div>
        <SliderControl label="Expected Return" value={ret2} min={0} max={30} step={0.5} format={(v) => `${v}%`} onChange={setRet2} />
        <SliderControl label="Std Deviation (Risk)" value={risk2} min={1} max={40} step={0.5} format={(v) => `${v}%`} onChange={setRisk2} />
        <div className="col-span-2">
          <SliderControl label="Correlation (ρ)" value={corr} min={-1} max={1} step={0.05} format={(v) => v.toFixed(2)} onChange={setCorr} />
        </div>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 5, right: 20, bottom: 20, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis type="number" dataKey="risk" name="Risk" label={{ value: 'Risk / Std Dev (%)', position: 'insideBottom', offset: -10 }} tick={{ fontSize: 11 }} domain={['auto', 'auto']} />
            <YAxis type="number" dataKey="ret" name="Return" label={{ value: 'Expected Return (%)', angle: -90, position: 'insideLeft' }} tick={{ fontSize: 11 }} domain={['auto', 'auto']} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ payload }) => {
              if (!payload?.length) return null
              const p = payload[0].payload
              return (
                <div className="bg-white border border-gray-200 rounded p-2 text-xs">
                  <p>Risk: {p.risk.toFixed(2)}%</p>
                  <p>Return: {p.ret.toFixed(2)}%</p>
                  <p>Weight A1: {p.weight1}%</p>
                </div>
              )
            }} />
            <Scatter data={data} fill="#2563eb" fillOpacity={0.6} line={{ stroke: '#2563eb', strokeWidth: 2 }} lineType="fitting" shape="circle" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-4 text-sm">
        <Stat label="Min Variance Risk" value={`${minVariance.risk.toFixed(2)}%`} color="text-blue-600" />
        <Stat label="Min Variance Return" value={`${minVariance.ret.toFixed(2)}%`} color="text-blue-600" />
        <Stat label="Optimal Weight A1" value={`${minVariance.weight1}%`} color="text-gray-700" />
      </div>
    </div>
  )
}

function SliderControl({ label, value, min, max, step, format, onChange }: {
  label: string; value: number; min: number; max: number; step: number
  format: (v: number) => string; onChange: (v: number) => void
}) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className="text-sm font-mono text-blue-600">{format(value)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-blue-600" />
    </div>
  )
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-base font-semibold ${color}`}>{value}</p>
    </div>
  )
}
```

**Step 8: Register** — add to `src/registry.ts`:

```ts
import { meta as portfolioMeta } from './modules/portfolio/meta'
import EfficientFrontier from './modules/portfolio/index'
import portfolioNotes from './modules/portfolio/notes.md?raw'

// add to registry array:
{ meta: portfolioMeta, component: EfficientFrontier, notes: portfolioNotes },
```

**Step 9: Run tests and browser check**

```bash
npm run test:run && npm run dev
```

**Step 10: Commit**

```bash
git add src/modules/portfolio/ src/registry.ts
git commit -m "feat: add Efficient Frontier module with 2-asset portfolio curve"
```

---

## Task 7: TVM / Annuity module

**Files:**
- Create: `src/modules/tvm/meta.ts`
- Create: `src/modules/tvm/math.ts`
- Create: `src/modules/tvm/math.test.ts`
- Create: `src/modules/tvm/notes.md`
- Create: `src/modules/tvm/index.tsx`
- Modify: `src/registry.ts`

**Step 1: Write failing tests** — create `src/modules/tvm/math.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { presentValue, futureValue, annuityPV, buildGrowthSeries } from './math'

describe('presentValue', () => {
  it('discounts future value correctly', () => {
    // $1000 in 10 years at 5% = $613.91
    expect(presentValue(1000, 0.05, 10)).toBeCloseTo(613.91, 1)
  })
})

describe('futureValue', () => {
  it('compounds present value correctly', () => {
    // $1000 at 5% for 10 years = $1628.89
    expect(futureValue(1000, 0.05, 10)).toBeCloseTo(1628.89, 1)
  })
})

describe('annuityPV', () => {
  it('calculates PV of annuity', () => {
    // $100/yr for 10yr at 5% = $772.17
    expect(annuityPV(100, 0.05, 10)).toBeCloseTo(772.17, 1)
  })
  it('returns payment when rate is 0', () => {
    expect(annuityPV(100, 0, 10)).toBeCloseTo(1000, 1)
  })
})

describe('buildGrowthSeries', () => {
  it('returns array of period and value', () => {
    const series = buildGrowthSeries(1000, 0.05, 10)
    expect(series.length).toBe(11)
    expect(series[0]).toHaveProperty('period')
    expect(series[0]).toHaveProperty('value')
    expect(series[0].period).toBe(0)
    expect(series[0].value).toBeCloseTo(1000)
  })
})
```

**Step 2: Run — expect fail**

```bash
npm run test:run
```

**Step 3: Create `src/modules/tvm/math.ts`**

```ts
export function presentValue(fv: number, rate: number, periods: number): number {
  return fv / Math.pow(1 + rate, periods)
}

export function futureValue(pv: number, rate: number, periods: number): number {
  return pv * Math.pow(1 + rate, periods)
}

export function annuityPV(payment: number, rate: number, periods: number): number {
  if (rate === 0) return payment * periods
  return payment * (1 - Math.pow(1 + rate, -periods)) / rate
}

export function buildGrowthSeries(
  pv: number,
  rate: number,
  periods: number,
): { period: number; value: number }[] {
  const result = []
  for (let t = 0; t <= periods; t++) {
    result.push({ period: t, value: Math.round(futureValue(pv, rate, t) * 100) / 100 })
  }
  return result
}
```

**Step 4: Run — expect pass**

```bash
npm run test:run
```

**Step 5: Create `src/modules/tvm/meta.ts`**

```ts
import { ModuleMeta } from '../../types/module'

export const meta: ModuleMeta = {
  id: 'time-value-of-money',
  title: 'Time Value of Money',
  category: 'Fundamentals',
  description: 'Visualise present value, future value, and annuity calculations over time',
}
```

**Step 6: Create `src/modules/tvm/notes.md`**

```md
# Time Value of Money

A dollar today is worth more than a dollar in the future — because money can earn a return over time.

## Future Value

$$FV = PV \times (1 + r)^n$$

Where $r$ is the interest rate per period and $n$ is the number of periods.

## Present Value

$$PV = \frac{FV}{(1 + r)^n}$$

Discounting brings a future cash flow back to today's value.

## Annuity

An **annuity** is a series of equal payments $C$ over $n$ periods.

$$PV_{\text{annuity}} = C \times \frac{1 - (1+r)^{-n}}{r}$$

## Key Concepts

| Term | Definition |
|------|-----------|
| Discounting | Converting future value to present value |
| Compounding | Converting present value to future value |
| Discount rate | The rate used to discount future cash flows |
| NPV | Net present value — sum of discounted cash flows |

## Interactive Controls

Adjust the **initial amount**, **interest rate**, and **number of periods** to see how a lump sum grows over time.
```

**Step 7: Create `src/modules/tvm/index.tsx`**

```tsx
import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { futureValue, annuityPV, buildGrowthSeries } from './math'

type Mode = 'lumpsum' | 'annuity'

export default function TVM() {
  const [mode, setMode] = useState<Mode>('lumpsum')
  const [pv, setPv] = useState(1000)
  const [rate, setRate] = useState(5)    // %
  const [periods, setPeriods] = useState(10)
  const [payment, setPayment] = useState(100)

  const data = buildGrowthSeries(pv, rate / 100, periods)
  const fv = futureValue(pv, rate / 100, periods)
  const annuityValue = annuityPV(payment, rate / 100, periods)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Time Value of Money</h2>
        <p className="text-sm text-gray-500">How money grows over time through compounding.</p>
      </div>

      <div className="flex gap-2">
        {([['lumpsum', 'Lump Sum Growth'], ['annuity', 'Annuity PV']] as const).map(([m, label]) => (
          <button key={m} onClick={() => setMode(m)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${mode === m ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {mode === 'lumpsum' ? (
          <SliderControl label="Initial Amount (PV)" value={pv} min={100} max={10000} step={100} format={(v) => `$${v}`} onChange={setPv} />
        ) : (
          <SliderControl label="Annual Payment" value={payment} min={10} max={1000} step={10} format={(v) => `$${v}`} onChange={setPayment} />
        )}
        <SliderControl label="Interest Rate" value={rate} min={0} max={20} step={0.5} format={(v) => `${v}%`} onChange={setRate} />
        <SliderControl label="Periods (years)" value={periods} min={1} max={40} step={1} format={(v) => `${v}y`} onChange={setPeriods} />
      </div>

      {mode === 'lumpsum' && (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 20, bottom: 20, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="period" label={{ value: 'Year', position: 'insideBottom', offset: -10 }} tick={{ fontSize: 11 }} />
              <YAxis label={{ value: 'Value ($)', angle: -90, position: 'insideLeft' }} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => [`$${v.toFixed(2)}`, 'Value']} labelFormatter={(l) => `Year ${l}`} />
              <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                {data.map((_, i) => (
                  <Cell key={i} fill={i === data.length - 1 ? '#16a34a' : '#93c5fd'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 text-sm">
        {mode === 'lumpsum' ? (
          <>
            <Stat label="Present Value" value={`$${pv.toFixed(2)}`} color="text-gray-700" />
            <Stat label={`Future Value (${periods}y)`} value={`$${fv.toFixed(2)}`} color="text-green-600" />
            <Stat label="Total Growth" value={`${((fv / pv - 1) * 100).toFixed(1)}%`} color="text-blue-600" />
          </>
        ) : (
          <>
            <Stat label="Annual Payment" value={`$${payment}`} color="text-gray-700" />
            <Stat label="PV of Annuity" value={`$${annuityValue.toFixed(2)}`} color="text-green-600" />
            <Stat label="Total Payments" value={`$${payment * periods}`} color="text-gray-500" />
          </>
        )}
      </div>
    </div>
  )
}

function SliderControl({ label, value, min, max, step, format, onChange }: {
  label: string; value: number; min: number; max: number; step: number
  format: (v: number) => string; onChange: (v: number) => void
}) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className="text-sm font-mono text-blue-600">{format(value)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-blue-600" />
    </div>
  )
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-base font-semibold ${color}`}>{value}</p>
    </div>
  )
}
```

**Step 8: Register** — final `src/registry.ts`:

```ts
import { FinanceModule } from './types/module'

import { meta as optionsMeta } from './modules/options/meta'
import OptionsPayoff from './modules/options/index'
import optionsNotes from './modules/options/notes.md?raw'

import { meta as bondsMeta } from './modules/bonds/meta'
import BondPricing from './modules/bonds/index'
import bondsNotes from './modules/bonds/notes.md?raw'

import { meta as portfolioMeta } from './modules/portfolio/meta'
import EfficientFrontier from './modules/portfolio/index'
import portfolioNotes from './modules/portfolio/notes.md?raw'

import { meta as tvmMeta } from './modules/tvm/meta'
import TVM from './modules/tvm/index'
import tvmNotes from './modules/tvm/notes.md?raw'

export const registry: FinanceModule[] = [
  { meta: optionsMeta, component: OptionsPayoff, notes: optionsNotes },
  { meta: bondsMeta, component: BondPricing, notes: bondsNotes },
  { meta: portfolioMeta, component: EfficientFrontier, notes: portfolioNotes },
  { meta: tvmMeta, component: TVM, notes: tvmNotes },
]
```

**Step 9: Run all tests**

```bash
npm run test:run
```

Expected: All tests pass across all 4 modules.

**Step 10: Full browser review**

```bash
npm run dev
```

Check all 4 modules render correctly, sliders update charts live, notes render with markdown.

**Step 11: Commit**

```bash
git add src/modules/tvm/ src/registry.ts
git commit -m "feat: add TVM module with lump sum growth and annuity PV"
```

---

## Task 8: GitHub Actions deployment

**Files:**
- Create: `.github/workflows/deploy.yml`

**Step 1: Create workflow file**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
          cache-dependency-path: finimation/package-lock.json
      - run: npm ci
        working-directory: finimation
      - run: npm run build
        working-directory: finimation
      - uses: actions/upload-pages-artifact@v3
        with:
          path: finimation/dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/deploy-pages@v4
        id: deployment
```

**Step 2: Enable GitHub Pages in repo settings**

In the GitHub repo → Settings → Pages → Source: select "GitHub Actions".

**Step 3: Verify vite.config.ts has correct base**

`base: '/finimation/'` must be set (done in Task 1).

**Step 4: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: add GitHub Actions deploy to GitHub Pages"
```

**Step 5: Push and verify**

```bash
git push origin main
```

Watch the Actions tab in GitHub — expect green deploy. Visit `https://<username>.github.io/finimation/`.

---

## Task 9: Final build verification

**Step 1: Production build**

```bash
npm run build
```

Expected: No errors. `dist/` folder created.

**Step 2: Preview production build**

```bash
npm run preview
```

Open `http://localhost:4173/finimation/`. Verify all 4 modules work in production mode.

**Step 3: Run full test suite**

```bash
npm run test:run
```

Expected: All tests pass.

**Step 4: Final commit**

```bash
git add -A
git commit -m "chore: verify production build and all tests passing"
```
