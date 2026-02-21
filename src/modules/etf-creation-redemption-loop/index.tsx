import { useMemo, useState } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { RangeControl } from '../../components/RangeControl'
import { StatCard } from '../../components/StatCard'
import { defaultEtfParams, defaultEtfState, stepEtfArbitrage } from './math'

export default function EtfCreationRedemptionLoop() {
  const [nav, setNav] = useState(100)
  const [etfPrice, setEtfPrice] = useState(101)
  const [thresholdBps, setThresholdBps] = useState(defaultEtfParams.thresholdBps)
  const [transactionCostBps, setTransactionCostBps] = useState(defaultEtfParams.transactionCostBps)
  const [slippageBps, setSlippageBps] = useState(defaultEtfParams.slippageBps)
  const [steps, setSteps] = useState(20)

  const simulation = useMemo(() => {
    const points: Array<{ step: number; nav: number; etfPrice: number; premiumPct: number; cumulativeProfit: number }> = []

    let state = {
      ...defaultEtfState,
      nav,
      etfPrice,
      cumulativeProfit: 0,
    }

    points.push({ step: 0, nav: state.nav, etfPrice: state.etfPrice, premiumPct: ((state.etfPrice - state.nav) / state.nav) * 100, cumulativeProfit: state.cumulativeProfit })

    for (let i = 1; i <= steps; i++) {
      const result = stepEtfArbitrage(state, {
        ...defaultEtfParams,
        thresholdBps,
        transactionCostBps,
        slippageBps,
      })

      state = result.next
      points.push({
        step: i,
        nav: Number(state.nav.toFixed(4)),
        etfPrice: Number(state.etfPrice.toFixed(4)),
        premiumPct: Number((((state.etfPrice - state.nav) / state.nav) * 100).toFixed(4)),
        cumulativeProfit: Number(state.cumulativeProfit.toFixed(4)),
      })
    }

    return points
  }, [nav, etfPrice, thresholdBps, transactionCostBps, slippageBps, steps])

  const last = simulation[simulation.length - 1]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">ETF Creation/Redemption Loop</h2>
        <p className="text-sm text-gray-500">Iterative AP arbitrage simulation for premium/discount convergence.</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <RangeControl label="Start NAV" value={nav} min={50} max={200} step={0.1} format={(v) => `$${v.toFixed(2)}`} onChange={setNav} />
        <RangeControl label="Start ETF Price" value={etfPrice} min={50} max={200} step={0.1} format={(v) => `$${v.toFixed(2)}`} onChange={setEtfPrice} />
        <RangeControl label="Arb Threshold" value={thresholdBps} min={1} max={50} step={1} format={(v) => `${v} bps`} onChange={setThresholdBps} />
        <RangeControl label="Transaction Cost" value={transactionCostBps} min={0} max={30} step={1} format={(v) => `${v} bps`} onChange={setTransactionCostBps} />
        <RangeControl label="Slippage" value={slippageBps} min={0} max={30} step={1} format={(v) => `${v} bps`} onChange={setSlippageBps} />
        <RangeControl label="Simulation Steps" value={steps} min={5} max={60} step={1} format={(v) => `${v}`} onChange={setSteps} />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={simulation} margin={{ top: 5, right: 18, bottom: 16, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="step" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="nav" stroke="#16a34a" dot={false} strokeWidth={2.2} />
              <Line type="monotone" dataKey="etfPrice" stroke="#2563eb" dot={false} strokeWidth={2.2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={simulation} margin={{ top: 5, right: 18, bottom: 16, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="step" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="premiumPct" stroke="#dc2626" dot={false} strokeWidth={2.2} />
              <Line type="monotone" dataKey="cumulativeProfit" stroke="#7c3aed" dot={false} strokeWidth={2.2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 text-sm">
        <StatCard label="Final NAV" value={`$${last.nav.toFixed(4)}`} color="text-green-600" />
        <StatCard label="Final ETF Price" value={`$${last.etfPrice.toFixed(4)}`} color="text-blue-600" />
        <StatCard label="Final Premium" value={`${last.premiumPct.toFixed(4)}%`} color="text-red-600" />
        <StatCard label="Cumulative AP P&L" value={`$${last.cumulativeProfit.toFixed(4)}`} color="text-gray-700" />
      </div>
    </div>
  )
}
