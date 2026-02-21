import { useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { RangeControl } from '../../components/RangeControl'
import { StatCard } from '../../components/StatCard'
import { alpha, buildSmlSeries, capmReturn } from './math'

export default function CapmSml() {
  const [rf, setRf] = useState(3)
  const [marketReturn, setMarketReturn] = useState(10)
  const [beta, setBeta] = useState(1.2)
  const [actualReturn, setActualReturn] = useState(12)

  const sml = useMemo(
    () => buildSmlSeries(rf / 100, marketReturn / 100, -0.5, 2, 80).map((r) => ({ beta: r.beta, ret: r.expected })),
    [rf, marketReturn],
  )

  const sampleAssets = [
    { name: 'Defensive', beta: 0.6, actual: 7.4 },
    { name: 'Core', beta: 1, actual: 10.0 },
    { name: 'Growth', beta: 1.5, actual: 15.2 },
    { name: 'Custom', beta, actual: actualReturn },
  ]

  const alphaRows = sampleAssets.map((asset) => {
    const required = capmReturn(asset.beta, rf / 100, marketReturn / 100) * 100
    const a = alpha(asset.actual / 100, asset.beta, rf / 100, marketReturn / 100) * 100
    return { ...asset, required, alpha: a }
  })

  const customRequired = capmReturn(beta, rf / 100, marketReturn / 100) * 100
  const customAlpha = alpha(actualReturn / 100, beta, rf / 100, marketReturn / 100) * 100

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">CAPM & Security Market Line</h2>
        <p className="text-sm text-gray-500">Visualize expected returns by beta and measure alpha relative to CAPM.</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <RangeControl label="Risk-free Rate" value={rf} min={0} max={10} step={0.1} format={(v) => `${v}%`} onChange={setRf} />
        <RangeControl label="Market Return" value={marketReturn} min={1} max={20} step={0.1} format={(v) => `${v}%`} onChange={setMarketReturn} />
        <RangeControl label="Custom Asset Beta" value={beta} min={-0.5} max={2} step={0.01} format={(v) => v.toFixed(2)} onChange={setBeta} />
        <RangeControl label="Custom Asset Return" value={actualReturn} min={-5} max={30} step={0.1} format={(v) => `${v}%`} onChange={setActualReturn} />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 5, right: 18, bottom: 16, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" dataKey="beta" tick={{ fontSize: 11 }} label={{ value: 'Beta', position: 'insideBottom', offset: -10 }} />
              <YAxis type="number" dataKey="ret" tick={{ fontSize: 11 }} label={{ value: 'Return (%)', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Scatter data={sml} line={{ stroke: '#2563eb', strokeWidth: 2.2 }} fill="#2563eb" fillOpacity={0.2} name="SML" />
              <Scatter data={alphaRows.map((r) => ({ beta: r.beta, ret: r.actual, name: r.name }))} fill="#dc2626" name="Assets" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={alphaRows} margin={{ top: 5, right: 18, bottom: 16, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} label={{ value: 'Alpha (pp)', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(v: number | undefined) => [`${(v ?? 0).toFixed(2)}pp`, 'Alpha']} />
              <Bar dataKey="alpha" fill="#9333ea" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 text-sm">
        <StatCard label="Required Return" value={`${customRequired.toFixed(2)}%`} color="text-blue-600" />
        <StatCard label="Observed Return" value={`${actualReturn.toFixed(2)}%`} color="text-gray-700" />
        <StatCard label="Custom Alpha" value={`${customAlpha.toFixed(2)}pp`} color={customAlpha >= 0 ? 'text-green-600' : 'text-red-600'} />
        <StatCard label="Market Premium" value={`${(marketReturn - rf).toFixed(2)}pp`} color="text-purple-600" />
      </div>
    </div>
  )
}
