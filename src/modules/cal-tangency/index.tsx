import { useMemo, useState } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { RangeControl } from '../../components/RangeControl'
import { StatCard } from '../../components/StatCard'
import { buildCalSeries, buildRiskyFrontier, tangencyWeights, twoAssetStats } from './math'

export default function CalTangencyPortfolio() {
  const [ret1, setRet1] = useState(8)
  const [risk1, setRisk1] = useState(12)
  const [ret2, setRet2] = useState(14)
  const [risk2, setRisk2] = useState(20)
  const [corr, setCorr] = useState(0.25)
  const [rf, setRf] = useState(3)
  const [allocationPct, setAllocationPct] = useState(100)

  const weights = tangencyWeights(ret1 / 100, risk1 / 100, ret2 / 100, risk2 / 100, corr, rf / 100)
  const tangency = twoAssetStats(ret1 / 100, risk1 / 100, ret2 / 100, risk2 / 100, corr, weights.w1)

  const frontier = useMemo(
    () => buildRiskyFrontier(ret1 / 100, risk1 / 100, ret2 / 100, risk2 / 100, corr, 80),
    [ret1, risk1, ret2, risk2, corr],
  )

  const calSeries = useMemo(
    () => buildCalSeries(rf / 100, tangency.risk, tangency.ret, -0.5, 1.5, 90),
    [rf, tangency],
  )

  const allocation = allocationPct / 100
  const currentCalPoint = {
    risk: Math.abs(allocation) * tangency.risk * 100,
    ret: (rf / 100 + allocation * (tangency.ret - rf / 100)) * 100,
  }

  const sharpe = tangency.risk > 0 ? (tangency.ret - rf / 100) / tangency.risk : 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">CAL & Tangency Portfolio</h2>
        <p className="text-sm text-gray-500">Blend risky frontier with risk-free lending/borrowing.</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <RangeControl label="Asset 1 Return" value={ret1} min={0} max={25} step={0.25} format={(v) => `${v}%`} onChange={setRet1} />
        <RangeControl label="Asset 1 Risk" value={risk1} min={2} max={40} step={0.25} format={(v) => `${v}%`} onChange={setRisk1} />
        <RangeControl label="Asset 2 Return" value={ret2} min={0} max={25} step={0.25} format={(v) => `${v}%`} onChange={setRet2} />
        <RangeControl label="Asset 2 Risk" value={risk2} min={2} max={40} step={0.25} format={(v) => `${v}%`} onChange={setRisk2} />
        <RangeControl label="Correlation" value={corr} min={-0.95} max={0.95} step={0.01} format={(v) => v.toFixed(2)} onChange={setCorr} />
        <RangeControl label="Risk-free Rate" value={rf} min={0} max={10} step={0.1} format={(v) => `${v}%`} onChange={setRf} />
        <div className="col-span-2">
          <RangeControl label="Allocation to Tangency Portfolio" value={allocationPct} min={-50} max={150} step={1} format={(v) => `${v}%`} onChange={setAllocationPct} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 5, right: 18, bottom: 16, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" dataKey="risk" tick={{ fontSize: 11 }} name="Risk" unit="%" label={{ value: 'Risk (%)', position: 'insideBottom', offset: -10 }} />
              <YAxis type="number" dataKey="ret" tick={{ fontSize: 11 }} name="Return" unit="%" label={{ value: 'Return (%)', angle: -90, position: 'insideLeft' }} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter data={frontier} line={{ stroke: '#2563eb', strokeWidth: 2 }} fill="#2563eb" fillOpacity={0.4} name="Risky Frontier" />
              <Scatter data={calSeries} line={{ stroke: '#dc2626', strokeWidth: 2 }} fill="#dc2626" fillOpacity={0.35} name="CAL" />
              <Scatter data={[currentCalPoint]} fill="#16a34a" name="Current allocation" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={calSeries} margin={{ top: 5, right: 18, bottom: 16, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="allocation" tick={{ fontSize: 11 }} label={{ value: 'Allocation (%)', position: 'insideBottom', offset: -10 }} />
              <YAxis tick={{ fontSize: 11 }} label={{ value: 'Expected Return (%)', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Line type="monotone" dataKey="ret" stroke="#dc2626" strokeWidth={2.3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 text-sm">
        <StatCard label="Tangency Weight A1" value={`${(weights.w1 * 100).toFixed(2)}%`} color="text-blue-600" />
        <StatCard label="Tangency Weight A2" value={`${(weights.w2 * 100).toFixed(2)}%`} color="text-blue-600" />
        <StatCard label="Tangency Sharpe" value={sharpe.toFixed(3)} color="text-green-600" />
        <StatCard label="Current Return" value={`${currentCalPoint.ret.toFixed(2)}%`} color="text-red-600" />
      </div>
    </div>
  )
}
