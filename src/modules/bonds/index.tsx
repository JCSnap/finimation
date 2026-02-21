import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts'
import { bondPrice, buildPriceVsYTMSeries } from './math'

export default function BondPricing() {
  const [faceValue, setFaceValue] = useState(1000)
  const [couponRate, setCouponRate] = useState(5)   // stored as %
  const [ytm, setYtm] = useState(5)                 // stored as %
  const [periods, setPeriods] = useState(10)

  const data = buildPriceVsYTMSeries(faceValue, couponRate / 100, periods, 0.01, 0.20, 190)
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
        <SliderControl label="Current YTM" value={ytm} min={1} max={20} step={0.1}
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
            <Tooltip formatter={(v: number | undefined) => [`$${(v ?? 0).toFixed(2)}`, 'Price']} labelFormatter={(l) => `YTM: ${l}%`} />
            <ReferenceLine x={ytm} stroke="#2563eb" strokeDasharray="4 4" label={{ value: 'Current YTM', position: 'top', fontSize: 10 }} />
            <ReferenceLine y={faceValue} stroke="#9ca3af" strokeDasharray="3 3" label={{ value: 'Face Value', position: 'right', fontSize: 10 }} />
            <Line type="monotone" dataKey="price" stroke="#16a34a" dot={false} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-4 text-sm">
        <Stat label="Current Price" value={`$${currentPrice.toFixed(2)}`} color="text-blue-600" />
        <Stat
          label="vs Face Value"
          value={currentPrice > faceValue ? 'Premium' : currentPrice < faceValue ? 'Discount' : 'Par'}
          color={currentPrice > faceValue ? 'text-green-600' : currentPrice < faceValue ? 'text-red-600' : 'text-gray-700'}
        />
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
