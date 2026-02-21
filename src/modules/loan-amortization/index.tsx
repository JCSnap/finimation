import { useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { RangeControl } from '../../components/RangeControl'
import { SegmentedToggle } from '../../components/SegmentedToggle'
import { StatCard } from '../../components/StatCard'
import { amortizationSchedule, periodicPayment } from './math'

function paymentLabel(freq: number): string {
  if (freq === 12) return 'Monthly Payment'
  if (freq === 4) return 'Quarterly Payment'
  return 'Annual Payment'
}

export default function LoanAmortizationStudio() {
  const [principal, setPrincipal] = useState(300000)
  const [apr, setApr] = useState(6)
  const [years, setYears] = useState(30)
  const [paymentsPerYear, setPaymentsPerYear] = useState<'12' | '4' | '1'>('12')
  const [extraPayment, setExtraPayment] = useState(0)

  const freq = Number(paymentsPerYear)
  const schedule = useMemo(
    () => amortizationSchedule(principal, apr / 100, years, freq, extraPayment),
    [principal, apr, years, freq, extraPayment],
  )

  const periodic = periodicPayment(principal, apr / 100, years, freq)

  const yearlyRows = useMemo(() => {
    const map = new Map<number, { year: number; interest: number; principal: number; balance: number }>()
    for (const row of schedule) {
      const year = Math.ceil(row.period / freq)
      const current = map.get(year) ?? { year, interest: 0, principal: 0, balance: row.balance }
      current.interest += row.interest
      current.principal += row.principal
      current.balance = row.balance
      map.set(year, current)
    }
    return [...map.values()].map((row) => ({
      ...row,
      interest: Math.round(row.interest * 100) / 100,
      principal: Math.round(row.principal * 100) / 100,
      balance: Math.round(row.balance * 100) / 100,
    }))
  }, [schedule, freq])

  const totalInterest = schedule.reduce((sum, row) => sum + row.interest, 0)
  const payoffYears = schedule.length / freq

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Loan Amortization Studio</h2>
        <p className="text-sm text-gray-500">Track payment composition and payoff acceleration with extra principal.</p>
      </div>

      <SegmentedToggle
        value={paymentsPerYear}
        onChange={setPaymentsPerYear}
        options={[
          { value: '12', label: 'Monthly' },
          { value: '4', label: 'Quarterly' },
          { value: '1', label: 'Annual' },
        ]}
      />

      <div className="grid grid-cols-2 gap-6">
        <RangeControl label="Principal" value={principal} min={50000} max={2000000} step={5000} format={(v) => `$${v}`} onChange={setPrincipal} />
        <RangeControl label="APR" value={apr} min={0} max={15} step={0.1} format={(v) => `${v}%`} onChange={setApr} />
        <RangeControl label="Term" value={years} min={1} max={40} step={1} format={(v) => `${v}y`} onChange={setYears} />
        <RangeControl label="Extra Principal / Period" value={extraPayment} min={0} max={2000} step={10} format={(v) => `$${v}`} onChange={setExtraPayment} />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={yearlyRows} margin={{ top: 5, right: 18, bottom: 16, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} label={{ value: 'Year', position: 'insideBottom', offset: -10 }} />
              <YAxis tick={{ fontSize: 11 }} label={{ value: 'Payment Composition ($)', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(v: number | undefined) => [`$${(v ?? 0).toFixed(2)}`, '']} />
              <Bar dataKey="interest" stackId="a" fill="#ef4444" name="Interest" />
              <Bar dataKey="principal" stackId="a" fill="#16a34a" name="Principal" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={yearlyRows} margin={{ top: 5, right: 18, bottom: 16, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} label={{ value: 'Year', position: 'insideBottom', offset: -10 }} />
              <YAxis tick={{ fontSize: 11 }} label={{ value: 'Balance ($)', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(v: number | undefined) => [`$${(v ?? 0).toFixed(2)}`, 'Balance']} />
              <Line type="monotone" dataKey="balance" stroke="#2563eb" strokeWidth={2.4} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 text-sm">
        <StatCard label={paymentLabel(freq)} value={`$${periodic.toFixed(2)}`} color="text-blue-600" />
        <StatCard label="Extra / Period" value={`$${extraPayment.toFixed(2)}`} color="text-gray-700" />
        <StatCard label="Total Interest Paid" value={`$${totalInterest.toFixed(2)}`} color="text-red-600" />
        <StatCard label="Payoff Time" value={`${payoffYears.toFixed(2)} years`} color="text-green-600" />
      </div>
    </div>
  )
}
