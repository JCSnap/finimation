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
import { StatCard } from '../../components/StatCard'
import { bondPrice } from '../bonds/math'
import { buildShockSeries, convexity, macaulayDuration, modifiedDuration } from './math'

export default function DurationConvexityLab() {
  const [faceValue, setFaceValue] = useState(1000)
  const [couponRate, setCouponRate] = useState(5)
  const [ytm, setYtm] = useState(4)
  const [periods, setPeriods] = useState(10)

  const rows = useMemo(
    () => buildShockSeries(faceValue, couponRate / 100, ytm / 100, periods, -0.05, 0.05, 80),
    [faceValue, couponRate, ytm, periods],
  )

  const errorRows = rows.map((r) => ({
    shock: r.shock,
    durationError: Math.abs(r.exact - r.durationApprox),
    durConvError: Math.abs(r.exact - r.durConvApprox),
  }))

  const mac = macaulayDuration(faceValue, couponRate / 100, ytm / 100, periods)
  const mod = modifiedDuration(faceValue, couponRate / 100, ytm / 100, periods)
  const conv = convexity(faceValue, couponRate / 100, ytm / 100, periods)
  const currentPrice = bondPrice(faceValue, couponRate / 100, ytm / 100, periods)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Duration & Convexity Lab</h2>
        <p className="text-sm text-gray-500">Repricing error under parallel yield shifts.</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <RangeControl label="Face Value" value={faceValue} min={100} max={5000} step={100} format={(v) => `$${v}`} onChange={setFaceValue} />
        <RangeControl label="Coupon Rate" value={couponRate} min={0} max={15} step={0.25} format={(v) => `${v}%`} onChange={setCouponRate} />
        <RangeControl label="Base YTM" value={ytm} min={0.5} max={15} step={0.1} format={(v) => `${v}%`} onChange={setYtm} />
        <RangeControl label="Maturity" value={periods} min={1} max={30} step={1} format={(v) => `${v}y`} onChange={setPeriods} />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rows} margin={{ top: 5, right: 18, bottom: 16, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="shock" tick={{ fontSize: 11 }} label={{ value: 'Yield Shock (pp)', position: 'insideBottom', offset: -10 }} />
              <YAxis tick={{ fontSize: 11 }} label={{ value: 'Bond Price', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(v: number | undefined) => [`$${(v ?? 0).toFixed(2)}`, 'Price']} />
              <ReferenceLine x={0} stroke="#6b7280" />
              <Line type="monotone" dataKey="exact" stroke="#111827" dot={false} strokeWidth={2.3} name="Exact" />
              <Line type="monotone" dataKey="durationApprox" stroke="#2563eb" dot={false} strokeWidth={2} name="Duration" />
              <Line type="monotone" dataKey="durConvApprox" stroke="#16a34a" dot={false} strokeWidth={2} name="Dur + Conv" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={errorRows} margin={{ top: 5, right: 18, bottom: 16, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="shock" tick={{ fontSize: 11 }} label={{ value: 'Yield Shock (pp)', position: 'insideBottom', offset: -10 }} />
              <YAxis tick={{ fontSize: 11 }} label={{ value: 'Absolute Error ($)', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(v: number | undefined) => [`$${(v ?? 0).toFixed(2)}`, 'Error']} />
              <Line type="monotone" dataKey="durationError" stroke="#2563eb" dot={false} strokeWidth={2} name="Duration error" />
              <Line type="monotone" dataKey="durConvError" stroke="#16a34a" dot={false} strokeWidth={2} name="Dur+Conv error" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 text-sm">
        <StatCard label="Current Price" value={`$${currentPrice.toFixed(2)}`} color="text-blue-600" />
        <StatCard label="Macaulay Duration" value={`${mac.toFixed(3)}`} color="text-gray-700" />
        <StatCard label="Modified Duration" value={`${mod.toFixed(3)}`} color="text-blue-600" />
        <StatCard label="Convexity" value={`${conv.toFixed(3)}`} color="text-green-600" />
      </div>
    </div>
  )
}
