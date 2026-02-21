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
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              mode === m ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {mode === 'lumpsum' ? (
          <SliderControl
            label="Initial Amount (PV)"
            value={pv}
            min={100}
            max={10000}
            step={100}
            format={(v) => `$${v}`}
            onChange={setPv}
          />
        ) : (
          <SliderControl
            label="Annual Payment"
            value={payment}
            min={10}
            max={1000}
            step={10}
            format={(v) => `$${v}`}
            onChange={setPayment}
          />
        )}
        <SliderControl
          label="Interest Rate"
          value={rate}
          min={0}
          max={20}
          step={0.5}
          format={(v) => `${v}%`}
          onChange={setRate}
        />
        <SliderControl
          label="Periods (years)"
          value={periods}
          min={1}
          max={40}
          step={1}
          format={(v) => `${v}y`}
          onChange={setPeriods}
        />
      </div>

      {mode === 'lumpsum' && (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 20, bottom: 20, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="period"
                label={{ value: 'Year', position: 'insideBottom', offset: -10 }}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                label={{ value: 'Value ($)', angle: -90, position: 'insideLeft' }}
                tick={{ fontSize: 11 }}
              />
              <Tooltip
                formatter={(v: number | undefined) => [`$${(v ?? 0).toFixed(2)}`, 'Value']}
                labelFormatter={(l) => `Year ${l}`}
              />
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
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
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
