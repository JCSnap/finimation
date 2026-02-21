import { useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { RangeControl } from '../../components/RangeControl'
import { StatCard } from '../../components/StatCard'
import { buildDilutionScenario } from './math'

const OWNER_COLORS: Record<string, string> = {
  Founder: '#2563eb',
  ESOP: '#16a34a',
}

export default function VcDilutionRounds() {
  const [exitMetric, setExitMetric] = useState(1_000_000)
  const [exitMultiple, setExitMultiple] = useState(10)
  const [yearsToExit, setYearsToExit] = useState(5)
  const [targetIrrPct, setTargetIrrPct] = useState(50)
  const [founderShares, setFounderShares] = useState(2_000_000)

  const [round1Investment, setRound1Investment] = useState(1_000_000)
  const [round2Investment, setRound2Investment] = useState(1_000_000)
  const [round3Investment, setRound3Investment] = useState(0)

  const [round1Esop, setRound1Esop] = useState(0)
  const [round2Esop, setRound2Esop] = useState(0)
  const [round3Esop, setRound3Esop] = useState(0)

  const rounds = [
    { label: 'Round 1', investment: round1Investment },
    { label: 'Round 2', investment: round2Investment },
    { label: 'Round 3', investment: round3Investment },
  ].filter((round) => round.investment > 0)

  const esopTargets = [round1Esop, round2Esop, round3Esop].slice(0, rounds.length)

  const scenario = useMemo(
    () => buildDilutionScenario({
      exitMetric,
      exitMultiple,
      yearsToExit,
      targetIrr: targetIrrPct / 100,
      founderShares,
      rounds,
      esopPctAfterRound: esopTargets,
    }),
    [exitMetric, exitMultiple, yearsToExit, targetIrrPct, founderShares, rounds, esopTargets],
  )

  const ownershipSeries = scenario.rounds.map((round, index) => ({
    round: index + 1,
    ...Object.fromEntries(Object.entries(round.ownershipPct).map(([name, pct]) => [name, Math.round(pct * 1000) / 1000])),
  }))

  const ownerKeys = Array.from(
    new Set(ownershipSeries.flatMap((row) => Object.keys(row).filter((key) => key !== 'round'))),
  )

  const lastRound = scenario.rounds.at(-1)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">VC Dilution Across Rounds</h2>
        <p className="text-sm text-gray-500">Cap-table simulation from exit assumptions and round-by-round share issuance.</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <RangeControl label="Exit Metric" value={exitMetric} min={100_000} max={20_000_000} step={100_000} format={(v) => `$${v.toLocaleString()}`} onChange={setExitMetric} />
        <RangeControl label="Exit Multiple" value={exitMultiple} min={1} max={30} step={0.5} format={(v) => `${v.toFixed(1)}x`} onChange={setExitMultiple} />
        <RangeControl label="Years to Exit" value={yearsToExit} min={1} max={10} step={1} format={(v) => `${v}y`} onChange={setYearsToExit} />
        <RangeControl label="Target VC IRR" value={targetIrrPct} min={10} max={100} step={1} format={(v) => `${v}%`} onChange={setTargetIrrPct} />
        <RangeControl label="Founder Shares" value={founderShares} min={100_000} max={20_000_000} step={100_000} format={(v) => `${Math.round(v).toLocaleString()}`} onChange={setFounderShares} />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <RangeControl label="Round 1 Investment" value={round1Investment} min={0} max={10_000_000} step={100_000} format={(v) => `$${v.toLocaleString()}`} onChange={setRound1Investment} />
        <RangeControl label="Round 2 Investment" value={round2Investment} min={0} max={10_000_000} step={100_000} format={(v) => `$${v.toLocaleString()}`} onChange={setRound2Investment} />
        <RangeControl label="Round 3 Investment" value={round3Investment} min={0} max={10_000_000} step={100_000} format={(v) => `$${v.toLocaleString()}`} onChange={setRound3Investment} />
        <RangeControl label="Round 1 ESOP Target" value={round1Esop} min={0} max={20} step={0.5} format={(v) => `${v.toFixed(1)}%`} onChange={setRound1Esop} />
        <RangeControl label="Round 2 ESOP Target" value={round2Esop} min={0} max={20} step={0.5} format={(v) => `${v.toFixed(1)}%`} onChange={setRound2Esop} />
        <RangeControl label="Round 3 ESOP Target" value={round3Esop} min={0} max={20} step={0.5} format={(v) => `${v.toFixed(1)}%`} onChange={setRound3Esop} />
      </div>

      <div className="grid grid-cols-4 gap-4 text-sm">
        <StatCard label="Exit Value" value={`$${scenario.exitValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} color="text-blue-600" />
        <StatCard label="PV at Target IRR" value={`$${scenario.pvAtTarget.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} color="text-gray-700" />
        <StatCard label="Required VC (R1)" value={`${scenario.requiredOwnershipFirstRound.toFixed(2)}%`} color="text-purple-600" />
        <StatCard label="Founder Final" value={`${(lastRound?.ownershipPct['Founder'] ?? 100).toFixed(3)}%`} color="text-green-600" />
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={ownershipSeries} margin={{ top: 5, right: 20, bottom: 20, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="round" tick={{ fontSize: 11 }} label={{ value: 'Funding Round', position: 'insideBottom', offset: -10 }} />
            <YAxis tick={{ fontSize: 11 }} label={{ value: 'Ownership (%)', angle: -90, position: 'insideLeft' }} />
            <Tooltip formatter={(v: number | undefined, name: string | undefined) => [`${(v ?? 0).toFixed(3)}%`, name ?? 'Owner']} />
            {ownerKeys.map((owner, i) => (
              <Area
                key={owner}
                type="monotone"
                dataKey={owner}
                stackId="ownership"
                stroke={OWNER_COLORS[owner] ?? ['#dc2626', '#9333ea', '#f59e0b', '#0891b2'][i % 4]}
                fill={OWNER_COLORS[owner] ?? ['#dc2626', '#9333ea', '#f59e0b', '#0891b2'][i % 4]}
                fillOpacity={0.85}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="overflow-auto rounded-xl border border-gray-200 bg-white/80">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-3">Round</th>
              <th className="text-left p-3">New Shares</th>
              <th className="text-left p-3">Price/Share</th>
              <th className="text-left p-3">Pre-Money</th>
              <th className="text-left p-3">Post-Money</th>
              <th className="text-left p-3">Founder %</th>
            </tr>
          </thead>
          <tbody>
            {scenario.rounds.map((round) => (
              <tr key={round.label} className="border-t border-gray-200">
                <td className="p-3">{round.label}</td>
                <td className="p-3">{round.newSharesIssued.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                <td className="p-3">${round.pricePerShare.toFixed(6)}</td>
                <td className="p-3">${round.preMoney.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                <td className="p-3">${round.postMoney.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                <td className="p-3">{(round.ownershipPct['Founder'] ?? 0).toFixed(3)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
