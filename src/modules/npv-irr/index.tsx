import { useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
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
import { buildNpvProfile, irr, npv } from './math'

export default function NpvIrrAnalyzer() {
  const [initialOutlay, setInitialOutlay] = useState(1000)
  const [cf1, setCf1] = useState(300)
  const [cf2, setCf2] = useState(360)
  const [cf3, setCf3] = useState(420)
  const [cf4, setCf4] = useState(350)
  const [cf5, setCf5] = useState(300)
  const [discountRate, setDiscountRate] = useState(10)

  const cashFlows = useMemo(
    () => [-initialOutlay, cf1, cf2, cf3, cf4, cf5],
    [initialOutlay, cf1, cf2, cf3, cf4, cf5],
  )

  const profile = useMemo(() => buildNpvProfile(cashFlows, -0.1, 0.4, 140), [cashFlows])
  const irrValue = irr(cashFlows)
  const npvAtRate = npv(cashFlows, discountRate / 100)

  const cashFlowRows = cashFlows.map((value, index) => ({ period: index, value }))

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">NPV Profile & IRR Analyzer</h2>
        <p className="text-sm text-gray-500">Discounted cash-flow diagnostics under changing hurdle rates.</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <RangeControl label="Initial Outlay" value={initialOutlay} min={100} max={5000} step={50} format={(v) => `$${v}`} onChange={setInitialOutlay} />
        <RangeControl label="Year 1 Cash Flow" value={cf1} min={0} max={3000} step={25} format={(v) => `$${v}`} onChange={setCf1} />
        <RangeControl label="Year 2 Cash Flow" value={cf2} min={0} max={3000} step={25} format={(v) => `$${v}`} onChange={setCf2} />
        <RangeControl label="Year 3 Cash Flow" value={cf3} min={0} max={3000} step={25} format={(v) => `$${v}`} onChange={setCf3} />
        <RangeControl label="Year 4 Cash Flow" value={cf4} min={0} max={3000} step={25} format={(v) => `$${v}`} onChange={setCf4} />
        <RangeControl label="Year 5 Cash Flow" value={cf5} min={0} max={3000} step={25} format={(v) => `$${v}`} onChange={setCf5} />
        <div className="col-span-3">
          <RangeControl label="Discount Rate for Snapshot NPV" value={discountRate} min={-5} max={40} step={0.25} format={(v) => `${v}%`} onChange={setDiscountRate} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={profile} margin={{ top: 5, right: 18, bottom: 16, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="rate" tick={{ fontSize: 11 }} label={{ value: 'Discount Rate (%)', position: 'insideBottom', offset: -10 }} />
              <YAxis tick={{ fontSize: 11 }} label={{ value: 'NPV ($)', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(v: number | undefined) => [`$${(v ?? 0).toFixed(2)}`, 'NPV']} />
              <ReferenceLine y={0} stroke="#6b7280" strokeWidth={1.4} />
              {irrValue !== null && <ReferenceLine x={irrValue * 100} stroke="#16a34a" strokeDasharray="4 4" />}
              <Line type="monotone" dataKey="npv" stroke="#2563eb" dot={false} strokeWidth={2.4} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={cashFlowRows} margin={{ top: 5, right: 18, bottom: 16, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="period" tick={{ fontSize: 11 }} label={{ value: 'Period', position: 'insideBottom', offset: -10 }} />
              <YAxis tick={{ fontSize: 11 }} label={{ value: 'Cash Flow ($)', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(v: number | undefined) => [`$${(v ?? 0).toFixed(2)}`, 'Cash Flow']} />
              <ReferenceLine y={0} stroke="#6b7280" />
              <Bar dataKey="value">
                {cashFlowRows.map((row) => (
                  <Cell key={row.period} fill={row.value >= 0 ? '#16a34a' : '#dc2626'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 text-sm">
        <StatCard label={`NPV @ ${discountRate.toFixed(2)}%`} value={`$${npvAtRate.toFixed(2)}`} color={npvAtRate >= 0 ? 'text-green-600' : 'text-red-600'} />
        <StatCard label="IRR" value={irrValue === null ? 'N/A' : `${(irrValue * 100).toFixed(2)}%`} color="text-blue-600" />
        <StatCard label="Total Inflows" value={`$${cashFlows.slice(1).reduce((a, b) => a + b, 0).toFixed(2)}`} color="text-gray-700" />
        <StatCard label="Net Nominal Cash" value={`$${cashFlows.reduce((a, b) => a + b, 0).toFixed(2)}`} color="text-purple-600" />
      </div>
    </div>
  )
}
