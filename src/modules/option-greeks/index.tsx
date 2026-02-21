import { useMemo, useState } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { RangeControl } from '../../components/RangeControl'
import { SegmentedToggle } from '../../components/SegmentedToggle'
import { StatCard } from '../../components/StatCard'
import { buildGreeksSeries, greeks, type OptionType } from './math'

export default function OptionGreeksExplorer() {
  const [type, setType] = useState<OptionType>('call')
  const [spot, setSpot] = useState(100)
  const [strike, setStrike] = useState(100)
  const [volPct, setVolPct] = useState(22)
  const [ratePct, setRatePct] = useState(3)
  const [time, setTime] = useState(1)

  const vol = volPct / 100
  const rate = ratePct / 100

  const series = useMemo(() => {
    const rows = buildGreeksSeries(type, strike, rate, vol, time, Math.max(10, strike * 0.5), strike * 1.5, 100)
    return rows.map((r) => ({
      ...r,
      gammaScaled: r.gamma * 100,
      thetaPerDay: r.theta / 365,
      vegaPerPct: r.vega / 100,
    }))
  }, [type, strike, rate, vol, time])

  const current = greeks(type, spot, strike, rate, vol, time)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Option Greeks Explorer</h2>
        <p className="text-sm text-gray-500">Black-Scholes risk decomposition across spot scenarios.</p>
      </div>

      <SegmentedToggle
        value={type}
        onChange={setType}
        options={[
          { value: 'call', label: 'Call' },
          { value: 'put', label: 'Put' },
        ]}
      />

      <div className="grid grid-cols-2 gap-6">
        <RangeControl label="Current Spot" value={spot} min={40} max={180} step={1} format={(v) => `$${v}`} onChange={setSpot} />
        <RangeControl label="Strike" value={strike} min={40} max={180} step={1} format={(v) => `$${v}`} onChange={setStrike} />
        <RangeControl label="Volatility" value={volPct} min={5} max={80} step={0.5} format={(v) => `${v}%`} onChange={setVolPct} />
        <RangeControl label="Risk-free Rate" value={ratePct} min={0} max={10} step={0.1} format={(v) => `${v}%`} onChange={setRatePct} />
        <div className="col-span-2">
          <RangeControl label="Time to Expiry" value={time} min={0.05} max={3} step={0.05} format={(v) => `${v.toFixed(2)}y`} onChange={setTime} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series} margin={{ top: 5, right: 18, bottom: 16, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="spot" label={{ value: 'Spot ($)', position: 'insideBottom', offset: -10 }} tick={{ fontSize: 11 }} />
              <YAxis label={{ value: 'Option Price', angle: -90, position: 'insideLeft' }} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number | undefined) => [`${(v ?? 0).toFixed(3)}`, 'Value']} />
              <ReferenceLine x={spot} stroke="#111827" strokeDasharray="4 4" />
              <Line type="monotone" dataKey="price" stroke="#2563eb" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series} margin={{ top: 5, right: 18, bottom: 16, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="spot" label={{ value: 'Spot ($)', position: 'insideBottom', offset: -10 }} tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <ReferenceLine y={0} stroke="#6b7280" />
              <Line type="monotone" dataKey="delta" stroke="#2563eb" dot={false} strokeWidth={2} name="Delta" />
              <Line type="monotone" dataKey="gammaScaled" stroke="#16a34a" dot={false} strokeWidth={2} name="Gamma x100" />
              <Line type="monotone" dataKey="thetaPerDay" stroke="#dc2626" dot={false} strokeWidth={2} name="Theta/day" />
              <Line type="monotone" dataKey="vegaPerPct" stroke="#9333ea" dot={false} strokeWidth={2} name="Vega/1%" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 text-sm">
        <StatCard label="Option Price" value={`$${current.price.toFixed(3)}`} color="text-blue-600" />
        <StatCard label="Delta" value={current.delta.toFixed(4)} color="text-blue-600" />
        <StatCard label="Gamma" value={current.gamma.toFixed(5)} color="text-green-600" />
        <StatCard label="Vega" value={current.vega.toFixed(4)} color="text-purple-600" />
      </div>
    </div>
  )
}
