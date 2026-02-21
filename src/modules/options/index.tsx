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

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="price" label={{ value: 'Spot Price at Expiry ($)', position: 'insideBottom', offset: -2 }} tick={{ fontSize: 11 }} />
            <YAxis label={{ value: 'Payoff ($)', angle: -90, position: 'insideLeft' }} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v: number | undefined) => [`$${(v ?? 0).toFixed(2)}`, 'Payoff']} labelFormatter={(l) => `Spot: $${l}`} />
            <ReferenceLine y={0} stroke="#6b7280" strokeWidth={1.5} />
            <ReferenceLine x={strikePrice} stroke="#9ca3af" strokeDasharray="4 4" label={{ value: 'K', position: 'top', fontSize: 11 }} />
            <Line type="monotone" dataKey="payoff" stroke="#2563eb" dot={false} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-4 text-sm">
        <Stat label="Max Loss" value={`-$${premium}`} color="text-red-600" />
        <Stat label="Break-even" value={type === 'call' ? `$${strikePrice + premium}` : `$${Math.max(strikePrice - premium, 0)}`} color="text-gray-700" />
        <Stat label="Max Gain" value={type === 'call' ? 'Unlimited' : `$${Math.max(strikePrice - premium, 0)}`} color="text-green-600" />
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
