import { useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { RangeControl } from '../../components/RangeControl'
import { StatCard } from '../../components/StatCard'
import { defaultLinkageInput, projectStatements } from './math'

export default function ThreeStatementLinkage() {
  const [growth, setGrowth] = useState(defaultLinkageInput.growthRate * 100)
  const [grossMargin, setGrossMargin] = useState(defaultLinkageInput.grossMargin * 100)
  const [sgaRate, setSgaRate] = useState(defaultLinkageInput.sgaRate * 100)
  const [capexRate, setCapexRate] = useState(defaultLinkageInput.capexRate * 100)
  const [minCash, setMinCash] = useState(defaultLinkageInput.minCash)

  const rows = useMemo(
    () =>
      projectStatements({
        ...defaultLinkageInput,
        growthRate: growth / 100,
        grossMargin: grossMargin / 100,
        sgaRate: sgaRate / 100,
        capexRate: capexRate / 100,
        minCash,
      }),
    [growth, grossMargin, sgaRate, capexRate, minCash],
  )

  const chartRows = rows.map((row) => ({
    year: `Y${row.year}`,
    cash: Number(row.cash.toFixed(2)),
    debt: Number(row.debt.toFixed(2)),
    equity: Number(row.equity.toFixed(2)),
    cfo: Number(row.cfo.toFixed(2)),
    cfi: Number(row.cfi.toFixed(2)),
    cff: Number(row.cff.toFixed(2)),
    balanceGap: Number((row.assets - (row.debt + row.equity)).toFixed(8)),
  }))

  const last = rows[rows.length - 1]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">3-Statement Linkage</h2>
        <p className="text-sm text-gray-500">Watch statement flows update when operating assumptions change.</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <RangeControl label="Revenue Growth" value={growth} min={-10} max={30} step={0.5} format={(v) => `${v}%`} onChange={setGrowth} />
        <RangeControl label="Gross Margin" value={grossMargin} min={10} max={80} step={0.5} format={(v) => `${v}%`} onChange={setGrossMargin} />
        <RangeControl label="SG&A / Revenue" value={sgaRate} min={5} max={50} step={0.5} format={(v) => `${v}%`} onChange={setSgaRate} />
        <RangeControl label="Capex / Revenue" value={capexRate} min={1} max={30} step={0.5} format={(v) => `${v}%`} onChange={setCapexRate} />
        <RangeControl label="Minimum Cash" value={minCash} min={0} max={500} step={5} format={(v) => `$${v}`} onChange={setMinCash} />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartRows} margin={{ top: 5, right: 18, bottom: 16, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number | undefined) => [`$${(v ?? 0).toFixed(2)}`]} />
              <Legend />
              <Line type="monotone" dataKey="cash" stroke="#2563eb" dot={false} strokeWidth={2.2} />
              <Line type="monotone" dataKey="debt" stroke="#dc2626" dot={false} strokeWidth={2.2} />
              <Line type="monotone" dataKey="equity" stroke="#16a34a" dot={false} strokeWidth={2.2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartRows} margin={{ top: 5, right: 18, bottom: 16, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number | undefined) => [`$${(v ?? 0).toFixed(2)}`]} />
              <Legend />
              <Bar dataKey="cfo" fill="#16a34a" />
              <Bar dataKey="cfi" fill="#dc2626" />
              <Bar dataKey="cff" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 text-sm">
        <StatCard label="Ending Cash" value={`$${last.cash.toFixed(2)}`} color="text-blue-600" />
        <StatCard label="Ending Debt" value={`$${last.debt.toFixed(2)}`} color="text-red-600" />
        <StatCard label="Ending Equity" value={`$${last.equity.toFixed(2)}`} color="text-green-600" />
        <StatCard
          label="Balance Check"
          value={`${Math.abs(last.assets - (last.debt + last.equity)).toFixed(8)}`}
          color="text-gray-700"
        />
      </div>
    </div>
  )
}
