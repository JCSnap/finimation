import { useEffect, useMemo, useState } from 'react'
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  LineChart,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { RangeControl } from '../../components/RangeControl'
import { SegmentedToggle } from '../../components/SegmentedToggle'
import { StatCard } from '../../components/StatCard'
import { buildPlaybackSnapshot, simulateDailyOptionMargin, type MarginSimulationInput } from './math'

type PlaySpeed = 'slow' | 'normal' | 'fast'

const SPEED_MS: Record<PlaySpeed, number> = {
  slow: 700,
  normal: 350,
  fast: 150,
}

export default function OptionsDailyMargin() {
  const [type, setType] = useState<'call' | 'put'>('call')
  const [strike, setStrike] = useState(100)
  const [premium, setPremium] = useState(6)
  const [initialSpot, setInitialSpot] = useState(100)
  const [days, setDays] = useState(40)
  const [ratePct, setRatePct] = useState(3)
  const [volPct, setVolPct] = useState(25)
  const [driftPct, setDriftPct] = useState(4)
  const [contracts, setContracts] = useState(1)
  const [lotSize, setLotSize] = useState(100)
  const [initialMargin, setInitialMargin] = useState(6000)
  const [maintenanceMargin, setMaintenanceMargin] = useState(4000)
  const [seed, setSeed] = useState(42)

  const [currentDay, setCurrentDay] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playSpeed, setPlaySpeed] = useState<PlaySpeed>('normal')

  const result = useMemo(
    () => simulateDailyOptionMargin({
      type,
      strike,
      premium,
      initialSpot,
      days,
      rate: ratePct / 100,
      vol: volPct / 100,
      drift: driftPct / 100,
      contracts,
      lotSize,
      initialMargin,
      maintenanceMargin: Math.min(maintenanceMargin, initialMargin),
      seed,
    } satisfies MarginSimulationInput),
    [type, strike, premium, initialSpot, days, ratePct, volPct, driftPct, contracts, lotSize, initialMargin, maintenanceMargin, seed],
  )

  const rows = result.rows
  const maxDay = Math.max(rows.length - 1, 0)
  const activeDay = Math.min(currentDay, maxDay)

  useEffect(() => {
    if (!isPlaying || maxDay <= 0) return

    const interval = window.setInterval(() => {
      setCurrentDay((day) => (day >= maxDay ? 0 : day + 1))
    }, SPEED_MS[playSpeed])

    return () => window.clearInterval(interval)
  }, [isPlaying, playSpeed, maxDay])

  const rowsWithCumulative = useMemo(() => {
    return rows.map((row, index) => {
      const cumulative = rows
        .slice(1, index + 1)
        .reduce((sum, current) => sum + current.dailyTransfer, 0)

      return {
        ...row,
        cumulativeTransfer: Math.round(cumulative * 100) / 100,
      }
    })
  }, [rows])

  const snapshot = useMemo(() => buildPlaybackSnapshot(rows, activeDay), [rows, activeDay])

  const transferTotals = rows.slice(1).reduce(
    (acc, row) => {
      if (row.dailyTransfer > 0) acc.received += row.dailyTransfer
      if (row.dailyTransfer < 0) acc.paid += -row.dailyTransfer
      acc.largestDebit = Math.max(acc.largestDebit, row.dailyTransfer < 0 ? -row.dailyTransfer : 0)
      return acc
    },
    { paid: 0, received: 0, largestDebit: 0 },
  )

  const callRows = rows.filter((row) => row.topUp > 0)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Options Margin (Daily MTM)</h2>
        <p className="text-sm text-gray-500">Daily writer settlement, margin balance, and margin-call pressure.</p>
      </div>

      <SegmentedToggle
        value={type}
        onChange={setType}
        options={[
          { value: 'call', label: 'Short Call' },
          { value: 'put', label: 'Short Put' },
        ]}
      />

      <div className="grid grid-cols-3 gap-6">
        <RangeControl label="Strike" value={strike} min={40} max={220} step={1} format={(v) => `$${v}`} onChange={setStrike} />
        <RangeControl label="Premium Received" value={premium} min={0.5} max={30} step={0.1} format={(v) => `$${v.toFixed(1)}`} onChange={setPremium} />
        <RangeControl label="Initial Spot" value={initialSpot} min={40} max={220} step={1} format={(v) => `$${v}`} onChange={setInitialSpot} />
        <RangeControl label="Days" value={days} min={5} max={120} step={1} format={(v) => `${v}d`} onChange={setDays} />
        <RangeControl label="Volatility" value={volPct} min={0} max={100} step={0.5} format={(v) => `${v}%`} onChange={setVolPct} />
        <RangeControl label="Drift" value={driftPct} min={-50} max={50} step={0.5} format={(v) => `${v}%`} onChange={setDriftPct} />
        <RangeControl label="Risk-free Rate" value={ratePct} min={0} max={12} step={0.1} format={(v) => `${v}%`} onChange={setRatePct} />
        <RangeControl label="Contracts" value={contracts} min={1} max={20} step={1} format={(v) => `${v}`} onChange={setContracts} />
        <RangeControl label="Lot Size" value={lotSize} min={10} max={500} step={10} format={(v) => `${v}`} onChange={setLotSize} />
        <RangeControl
          label="Initial Margin"
          value={initialMargin}
          min={500}
          max={50000}
          step={250}
          format={(v) => `$${v}`}
          onChange={(v) => {
            setInitialMargin(v)
            if (maintenanceMargin > v) setMaintenanceMargin(v)
          }}
        />
        <RangeControl
          label="Maintenance Margin"
          value={Math.min(maintenanceMargin, initialMargin)}
          min={250}
          max={initialMargin}
          step={250}
          format={(v) => `$${v}`}
          onChange={setMaintenanceMargin}
        />
        <RangeControl label="Random Seed" value={seed} min={1} max={999} step={1} format={(v) => `${v}`} onChange={setSeed} />
      </div>

      <div className="rounded-xl border border-gray-200 p-4 bg-white/70">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <button
            className="px-3 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-sm"
            disabled={currentDay <= 0}
            onClick={() => {
              setIsPlaying(false)
              setCurrentDay((day) => Math.max(0, Math.min(day, maxDay) - 1))
            }}
          >
            Prev
          </button>
          <button
            className="px-3 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-sm"
            disabled={currentDay >= maxDay}
            onClick={() => {
              setIsPlaying(false)
              setCurrentDay((day) => Math.min(maxDay, day + 1))
            }}
          >
            Next
          </button>
          <button
            className="px-3 py-1.5 rounded-md bg-blue-600 text-white text-sm"
            onClick={() => {
              if (!isPlaying && activeDay >= maxDay) setCurrentDay(0)
              setIsPlaying((playing) => !playing)
            }}
          >
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <span className="text-sm text-gray-600 ml-2">Day {snapshot.day} / {maxDay}</span>
        </div>

        <div className="grid grid-cols-2 gap-6 items-end">
          <div>
            <label className="text-xs font-medium text-gray-600">Step Day</label>
            <input
              type="range"
              min={0}
              max={maxDay}
              step={1}
              value={snapshot.day}
              className="w-full accent-blue-600"
              onChange={(e) => {
                setIsPlaying(false)
                setCurrentDay(Number(e.target.value))
              }}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Playback Speed</label>
            <SegmentedToggle
              value={playSpeed}
              onChange={setPlaySpeed}
              options={[
                { value: 'slow', label: 'Slow' },
                { value: 'normal', label: 'Normal' },
                { value: 'fast', label: 'Fast' },
              ]}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-6 gap-4 text-sm">
        <StatCard label="Day" value={`${snapshot.day}`} color="text-gray-700" />
        <StatCard label="Daily VM" value={`$${snapshot.dailyTransfer.toFixed(2)}`} color={snapshot.dailyTransfer >= 0 ? 'text-green-600' : 'text-red-600'} />
        <StatCard label="Cumulative VM" value={`$${snapshot.cumulativeTransfer.toFixed(2)}`} color={snapshot.cumulativeTransfer >= 0 ? 'text-green-600' : 'text-red-600'} />
        <StatCard label="Balance" value={`$${snapshot.balance.toFixed(2)}`} color="text-blue-600" />
        <StatCard label="Top-Up Today" value={`$${snapshot.topUp.toFixed(2)}`} color={snapshot.topUp > 0 ? 'text-red-600' : 'text-gray-700'} />
        <StatCard label="Margin Call?" value={snapshot.marginCallToday ? 'Yes' : 'No'} color={snapshot.marginCallToday ? 'text-red-600' : 'text-green-600'} />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rows} margin={{ top: 5, right: 18, bottom: 16, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} label={{ value: 'Day', position: 'insideBottom', offset: -10 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} label={{ value: 'Spot ($)', angle: -90, position: 'insideLeft' }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} label={{ value: 'Option Mark ($)', angle: 90, position: 'insideRight' }} />
              <Tooltip />
              <ReferenceLine x={snapshot.day} stroke="#111827" strokeDasharray="4 4" />
              <Line yAxisId="left" type="monotone" dataKey="spot" stroke="#2563eb" dot={false} strokeWidth={2.3} name="Spot" />
              <Line yAxisId="right" type="monotone" dataKey="optionMark" stroke="#9333ea" dot={false} strokeWidth={2.3} name="Option Mark" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={rowsWithCumulative} margin={{ top: 5, right: 18, bottom: 16, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} label={{ value: 'Day', position: 'insideBottom', offset: -10 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} label={{ value: 'Daily VM ($)', angle: -90, position: 'insideLeft' }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} label={{ value: 'Cumulative VM ($)', angle: 90, position: 'insideRight' }} />
              <Tooltip formatter={(v: number | undefined) => [`$${(v ?? 0).toFixed(2)}`, '']} />
              <ReferenceLine yAxisId="left" y={0} stroke="#6b7280" />
              <ReferenceLine x={snapshot.day} stroke="#111827" strokeDasharray="4 4" />
              <Bar yAxisId="left" dataKey="dailyTransfer" name="Daily VM">
                {rowsWithCumulative.map((row) => (
                  <Cell key={row.day} fill={row.dailyTransfer >= 0 ? '#16a34a' : '#dc2626'} opacity={row.day === snapshot.day ? 1 : 0.45} />
                ))}
              </Bar>
              <Line yAxisId="right" type="monotone" dataKey="cumulativeTransfer" stroke="#2563eb" dot={false} strokeWidth={2.2} name="Cumulative VM" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rows} margin={{ top: 5, right: 18, bottom: 16, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="day" tick={{ fontSize: 11 }} label={{ value: 'Day', position: 'insideBottom', offset: -10 }} />
            <YAxis tick={{ fontSize: 11 }} label={{ value: 'Margin Balance ($)', angle: -90, position: 'insideLeft' }} />
            <Tooltip formatter={(v: number | undefined) => [`$${(v ?? 0).toFixed(2)}`, 'Balance']} />
            <ReferenceLine x={snapshot.day} stroke="#111827" strokeDasharray="4 4" />
            <ReferenceLine y={Math.min(maintenanceMargin, initialMargin)} stroke="#dc2626" strokeDasharray="4 4" label={{ value: 'Maintenance', position: 'left', fontSize: 10 }} />
            <ReferenceLine y={initialMargin} stroke="#111827" strokeDasharray="4 4" label={{ value: 'Initial', position: 'left', fontSize: 10 }} />
            <Line type="monotone" dataKey="balance" stroke="#2563eb" dot={false} strokeWidth={2.4} />
            {callRows.map((row) => (
              <ReferenceDot key={row.day} x={row.day} y={row.balance} r={5} fill="#dc2626" stroke="white" strokeWidth={1} />
            ))}
            <ReferenceDot x={snapshot.day} y={snapshot.balance} r={6} fill="#111827" stroke="white" strokeWidth={1} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-5 gap-4 text-sm">
        <StatCard label="VM Paid" value={`$${transferTotals.paid.toFixed(2)}`} color="text-red-600" />
        <StatCard label="VM Received" value={`$${transferTotals.received.toFixed(2)}`} color="text-green-600" />
        <StatCard label="Margin Calls" value={`${result.marginCalls}`} color={result.marginCalls > 0 ? 'text-red-600' : 'text-gray-700'} />
        <StatCard label="Total Top-Ups" value={`$${result.totalTopUps.toFixed(2)}`} color="text-red-600" />
        <StatCard label="Largest Daily Debit" value={`$${transferTotals.largestDebit.toFixed(2)}`} color="text-purple-600" />
      </div>
    </div>
  )
}
