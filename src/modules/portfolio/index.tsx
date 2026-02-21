import { useState } from 'react'
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { buildFrontier } from './math'

export default function EfficientFrontier() {
  const [ret1, setRet1] = useState(8)      // %
  const [risk1, setRisk1] = useState(12)   // %
  const [ret2, setRet2] = useState(14)     // %
  const [risk2, setRisk2] = useState(20)   // %
  const [corr, setCorr] = useState(0.3)

  const data = buildFrontier(ret1 / 100, risk1 / 100, ret2 / 100, risk2 / 100, corr, 100)
  const minVariance = data.reduce((min, p) => (p.risk < min.risk ? p : min), data[0])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Efficient Frontier</h2>
        <p className="text-sm text-gray-500">Two-asset portfolio — risk vs return as allocation varies.</p>
      </div>

      <div className="grid grid-cols-2 gap-x-8 gap-y-4">
        <div className="col-span-2 text-xs font-semibold uppercase tracking-widest text-gray-400">Asset 1</div>
        <SliderControl label="Expected Return" value={ret1} min={0} max={30} step={0.5} format={(v) => `${v}%`} onChange={setRet1} />
        <SliderControl label="Std Deviation (Risk)" value={risk1} min={1} max={40} step={0.5} format={(v) => `${v}%`} onChange={setRisk1} />
        <div className="col-span-2 text-xs font-semibold uppercase tracking-widest text-gray-400">Asset 2</div>
        <SliderControl label="Expected Return" value={ret2} min={0} max={30} step={0.5} format={(v) => `${v}%`} onChange={setRet2} />
        <SliderControl label="Std Deviation (Risk)" value={risk2} min={1} max={40} step={0.5} format={(v) => `${v}%`} onChange={setRisk2} />
        <div className="col-span-2">
          <SliderControl label="Correlation (ρ)" value={corr} min={-1} max={1} step={0.05} format={(v) => v.toFixed(2)} onChange={setCorr} />
        </div>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 5, right: 20, bottom: 20, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              type="number"
              dataKey="risk"
              name="Risk"
              label={{ value: 'Risk / Std Dev (%)', position: 'insideBottom', offset: -10 }}
              tick={{ fontSize: 11 }}
              domain={['auto', 'auto']}
            />
            <YAxis
              type="number"
              dataKey="ret"
              name="Return"
              label={{ value: 'Expected Return (%)', angle: -90, position: 'insideLeft' }}
              tick={{ fontSize: 11 }}
              domain={['auto', 'auto']}
            />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              content={({ payload }) => {
                if (!payload?.length) return null
                const p = payload[0].payload
                return (
                  <div className="bg-white border border-gray-200 rounded p-2 text-xs">
                    <p>Risk: {p.risk.toFixed(2)}%</p>
                    <p>Return: {p.ret.toFixed(2)}%</p>
                    <p>Weight A1: {p.weight1}%</p>
                  </div>
                )
              }}
            />
            <Scatter
              data={data}
              fill="#2563eb"
              fillOpacity={0.6}
              line={{ stroke: '#2563eb', strokeWidth: 2 }}
              shape="circle"
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-4 text-sm">
        <Stat label="Min Variance Risk" value={`${minVariance.risk.toFixed(2)}%`} color="text-blue-600" />
        <Stat label="Min Variance Return" value={`${minVariance.ret.toFixed(2)}%`} color="text-blue-600" />
        <Stat label="Optimal Weight A1" value={`${minVariance.weight1}%`} color="text-gray-700" />
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
