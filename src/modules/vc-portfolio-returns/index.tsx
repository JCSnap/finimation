import { useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { RangeControl } from '../../components/RangeControl'
import { StatCard } from '../../components/StatCard'
import { computePortfolioOutcome, requiredHomeRunMultiple } from './math'

export default function VcPortfolioReturns() {
  const [fundSize, setFundSize] = useState(100_000_000)
  const [years, setYears] = useState(5)

  const [homeRunPct, setHomeRunPct] = useState(20)
  const [livingDeadPct, setLivingDeadPct] = useState(60)
  const [lossPct, setLossPct] = useState(20)

  const [homeRunMultiple, setHomeRunMultiple] = useState(8)
  const [livingDeadMultiple, setLivingDeadMultiple] = useState(1)

  const [targetIrrPct, setTargetIrrPct] = useState(25)
  const [feePct, setFeePct] = useState(2)
  const [carryPct, setCarryPct] = useState(20)

  const outcome = useMemo(
    () => computePortfolioOutcome({
      fundSize,
      years,
      homeRunPct: homeRunPct / 100,
      livingDeadPct: livingDeadPct / 100,
      lossPct: lossPct / 100,
      homeRunMultiple,
      livingDeadMultiple,
      managementFeePctPerYear: feePct / 100,
      carryPct: carryPct / 100,
    }),
    [fundSize, years, homeRunPct, livingDeadPct, lossPct, homeRunMultiple, livingDeadMultiple, feePct, carryPct],
  )

  const requiredMultiple = requiredHomeRunMultiple({
    years,
    targetIrr: targetIrrPct / 100,
    homeRunPct: homeRunPct / 100,
    livingDeadPct: livingDeadPct / 100,
    lossPct: lossPct / 100,
    livingDeadMultiple,
  })

  const bucketData = [
    { bucket: 'Home Runs', allocation: homeRunPct, multiple: homeRunMultiple, value: (fundSize * homeRunPct / 100) * homeRunMultiple },
    { bucket: 'Living Dead', allocation: livingDeadPct, multiple: livingDeadMultiple, value: (fundSize * livingDeadPct / 100) * livingDeadMultiple },
    { bucket: 'Losses', allocation: lossPct, multiple: 0, value: 0 },
  ]

  const grossNetSeries = [
    { metric: 'MOIC', gross: outcome.grossMoic, net: outcome.netMoic },
    { metric: 'IRR (%)', gross: outcome.grossIrr * 100, net: outcome.netIrr * 100 },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">VC Portfolio Returns Simulator</h2>
        <p className="text-sm text-gray-500">Portfolio bucket outcomes, gross/net return impact, and required home-run solver.</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <RangeControl label="Fund Size" value={fundSize} min={10_000_000} max={1_000_000_000} step={10_000_000} format={(v) => `$${v.toLocaleString()}`} onChange={setFundSize} />
        <RangeControl label="Horizon" value={years} min={1} max={12} step={1} format={(v) => `${v}y`} onChange={setYears} />
        <RangeControl label="Target IRR" value={targetIrrPct} min={5} max={50} step={0.5} format={(v) => `${v.toFixed(1)}%`} onChange={setTargetIrrPct} />

        <RangeControl label="Home Runs %" value={homeRunPct} min={0} max={100} step={1} format={(v) => `${v}%`} onChange={setHomeRunPct} />
        <RangeControl label="Living Dead %" value={livingDeadPct} min={0} max={100} step={1} format={(v) => `${v}%`} onChange={setLivingDeadPct} />
        <RangeControl label="Loss %" value={lossPct} min={0} max={100} step={1} format={(v) => `${v}%`} onChange={setLossPct} />

        <RangeControl label="Home Run Multiple" value={homeRunMultiple} min={0} max={50} step={0.5} format={(v) => `${v.toFixed(1)}x`} onChange={setHomeRunMultiple} />
        <RangeControl label="Living Dead Multiple" value={livingDeadMultiple} min={0} max={5} step={0.1} format={(v) => `${v.toFixed(1)}x`} onChange={setLivingDeadMultiple} />
        <RangeControl label="Mgmt Fee % / yr" value={feePct} min={0} max={5} step={0.1} format={(v) => `${v.toFixed(1)}%`} onChange={setFeePct} />

        <div className="col-span-3">
          <RangeControl label="Carry %" value={carryPct} min={0} max={40} step={1} format={(v) => `${v}%`} onChange={setCarryPct} />
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4 text-sm">
        <StatCard label="Gross MOIC" value={`${outcome.grossMoic.toFixed(3)}x`} color="text-blue-600" />
        <StatCard label="Gross IRR" value={`${(outcome.grossIrr * 100).toFixed(2)}%`} color="text-blue-600" />
        <StatCard label="Net IRR" value={`${(outcome.netIrr * 100).toFixed(2)}%`} color="text-red-600" />
        <StatCard label="Required Home Run" value={`${Number.isFinite(requiredMultiple) ? requiredMultiple.toFixed(2) : 'N/A'}x`} color="text-purple-600" />
        <StatCard label="Fee + Carry Drag" value={`$${(outcome.feePaid + outcome.carryPaid).toLocaleString(undefined, { maximumFractionDigits: 0 })}`} color="text-gray-700" />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={bucketData} margin={{ top: 5, right: 20, bottom: 20, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="bucket" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} label={{ value: 'Terminal Value ($)', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(v: number | undefined) => [`$${(v ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, 'Value']} />
              <Bar dataKey="value">
                {bucketData.map((row) => (
                  <Cell key={row.bucket} fill={row.bucket === 'Home Runs' ? '#2563eb' : row.bucket === 'Living Dead' ? '#16a34a' : '#dc2626'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={grossNetSeries} margin={{ top: 5, right: 20, bottom: 20, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="metric" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="gross" fill="#2563eb" />
              <Bar dataKey="net" fill="#dc2626" />
              <Line type="monotone" dataKey="gross" stroke="#111827" dot={false} strokeWidth={1.6} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
