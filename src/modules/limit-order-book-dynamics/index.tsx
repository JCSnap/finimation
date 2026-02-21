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
import { defaultSimulationParams, runSimulation } from './math'

export default function LimitOrderBookDynamics() {
  const [seed, setSeed] = useState(defaultSimulationParams.seed)
  const [steps, setSteps] = useState(40)
  const [marketRate, setMarketRate] = useState(defaultSimulationParams.marketRate)
  const [cancelRate, setCancelRate] = useState(defaultSimulationParams.cancelRate)
  const [marketOrderSize, setMarketOrderSize] = useState(defaultSimulationParams.marketOrderSize)

  const run = useMemo(
    () =>
      runSimulation(
        {
          ...defaultSimulationParams,
          seed,
          marketRate,
          cancelRate,
          marketOrderSize,
        },
        steps,
      ),
    [seed, steps, marketRate, cancelRate, marketOrderSize],
  )

  const chartRows = run.snapshots.map((snapshot, index) => ({
    step: index,
    spread: Number(snapshot.spread.toFixed(4)),
    imbalance: Number(snapshot.imbalance.toFixed(4)),
    microprice: Number(snapshot.microprice.toFixed(4)),
  }))

  const last = run.snapshots[run.snapshots.length - 1]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Limit Order Book Dynamics</h2>
        <p className="text-sm text-gray-500">Deterministic event replay for spread, imbalance, and microprice behavior.</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <RangeControl label="Random Seed" value={seed} min={1} max={999} step={1} format={(v) => `${v}`} onChange={setSeed} />
        <RangeControl label="Steps" value={steps} min={10} max={120} step={1} format={(v) => `${v}`} onChange={setSteps} />
        <RangeControl label="Market Order Rate" value={marketRate} min={0} max={0.8} step={0.01} format={(v) => v.toFixed(2)} onChange={setMarketRate} />
        <RangeControl label="Cancel Rate" value={cancelRate} min={0} max={0.8} step={0.01} format={(v) => v.toFixed(2)} onChange={setCancelRate} />
        <RangeControl label="Market Order Size" value={marketOrderSize} min={1} max={40} step={1} format={(v) => `${v}`} onChange={setMarketOrderSize} />
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartRows} margin={{ top: 5, right: 18, bottom: 16, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="step" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Line type="monotone" dataKey="spread" stroke="#2563eb" dot={false} strokeWidth={2} />
            <Line type="monotone" dataKey="imbalance" stroke="#16a34a" dot={false} strokeWidth={2} />
            <Line type="monotone" dataKey="microprice" stroke="#dc2626" dot={false} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-4 gap-4 text-sm">
        <StatCard label="Final Spread" value={last.spread.toFixed(4)} color="text-blue-600" />
        <StatCard label="Final Imbalance" value={last.imbalance.toFixed(4)} color="text-green-600" />
        <StatCard label="Final Microprice" value={last.microprice.toFixed(4)} color="text-red-600" />
        <StatCard label="Events Simulated" value={`${run.events.length}`} color="text-gray-700" />
      </div>

      <div className="rounded-xl border border-gray-200 p-3 text-xs text-gray-600 space-y-1">
        {run.events.slice(-8).map((event, idx) => (
          <p key={`${event}-${idx}`}>{event}</p>
        ))}
      </div>
    </div>
  )
}
