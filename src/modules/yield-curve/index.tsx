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
import { buildInterpolatedCurve, buildZeroPriceSeries } from './math'

export default function YieldCurveBuilder() {
  const [r1, setR1] = useState(3)
  const [r2, setR2] = useState(3.2)
  const [r5, setR5] = useState(3.8)
  const [r10, setR10] = useState(4.2)
  const [r30, setR30] = useState(4.6)
  const [faceValue, setFaceValue] = useState(1000)

  const points = useMemo(
    () => [
      { tenor: 1, rate: r1 / 100 },
      { tenor: 2, rate: r2 / 100 },
      { tenor: 5, rate: r5 / 100 },
      { tenor: 10, rate: r10 / 100 },
      { tenor: 30, rate: r30 / 100 },
    ],
    [r1, r2, r5, r10, r30],
  )

  const curve = buildInterpolatedCurve(points, 1).map((p) => ({ ...p, ratePct: p.rate * 100 }))
  const zeroSeries = buildZeroPriceSeries(points, faceValue, 30)

  const avgRate = curve.reduce((sum, p) => sum + p.rate, 0) / curve.length

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Yield Curve Builder</h2>
        <p className="text-sm text-gray-500">Manipulate key rates and inspect interpolation plus zero-coupon valuation.</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <RangeControl label="1Y Rate" value={r1} min={0} max={10} step={0.1} format={(v) => `${v}%`} onChange={setR1} />
        <RangeControl label="2Y Rate" value={r2} min={0} max={10} step={0.1} format={(v) => `${v}%`} onChange={setR2} />
        <RangeControl label="5Y Rate" value={r5} min={0} max={10} step={0.1} format={(v) => `${v}%`} onChange={setR5} />
        <RangeControl label="10Y Rate" value={r10} min={0} max={10} step={0.1} format={(v) => `${v}%`} onChange={setR10} />
        <RangeControl label="30Y Rate" value={r30} min={0} max={10} step={0.1} format={(v) => `${v}%`} onChange={setR30} />
        <RangeControl label="Face Value" value={faceValue} min={100} max={5000} step={100} format={(v) => `$${v}`} onChange={setFaceValue} />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={curve} margin={{ top: 5, right: 18, bottom: 16, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="tenor" tick={{ fontSize: 11 }} label={{ value: 'Tenor (years)', position: 'insideBottom', offset: -10 }} />
              <YAxis tick={{ fontSize: 11 }} label={{ value: 'Rate (%)', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(v: number | undefined) => [`${(v ?? 0).toFixed(2)}%`, 'Rate']} />
              <Line type="monotone" dataKey="ratePct" stroke="#2563eb" dot={false} strokeWidth={2.4} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={zeroSeries} margin={{ top: 5, right: 18, bottom: 16, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="tenor" tick={{ fontSize: 11 }} label={{ value: 'Tenor (years)', position: 'insideBottom', offset: -10 }} />
              <YAxis tick={{ fontSize: 11 }} label={{ value: 'Zero Price ($)', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(v: number | undefined) => [`$${(v ?? 0).toFixed(2)}`, 'Price']} />
              <Line type="monotone" dataKey="price" stroke="#16a34a" dot={false} strokeWidth={2.4} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-sm">
        <StatCard label="Average Curve Rate" value={`${(avgRate * 100).toFixed(2)}%`} color="text-blue-600" />
        <StatCard label="10Y Zero Price" value={`$${(zeroSeries.find((p) => p.tenor === 10)?.price ?? 0).toFixed(2)}`} color="text-gray-700" />
        <StatCard label="30Y Zero Price" value={`$${(zeroSeries.find((p) => p.tenor === 30)?.price ?? 0).toFixed(2)}`} color="text-green-600" />
      </div>
    </div>
  )
}
