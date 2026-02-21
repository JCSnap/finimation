import { Fragment, useMemo, useState } from 'react'
import {
  CartesianGrid,
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
import { buildSmileSeries, buildSurfaceGrid } from './math'

const MATURITIES = [0.25, 0.5, 1, 2, 3]

function colorFor(value: number, min: number, max: number): string {
  const ratio = max === min ? 0.5 : (value - min) / (max - min)
  const hue = 215 - ratio * 170
  const light = 88 - ratio * 36
  return `hsl(${hue} 78% ${light}%)`
}

export default function VolatilitySurface() {
  const [baseStrike, setBaseStrike] = useState(100)
  const [atmVolPct, setAtmVolPct] = useState(22)
  const [skewPct, setSkewPct] = useState(-8)
  const [curvaturePct, setCurvaturePct] = useState(20)
  const [termSlopePct, setTermSlopePct] = useState(1)
  const [selectedMaturity, setSelectedMaturity] = useState(1)

  const atmVol = atmVolPct / 100
  const skew = skewPct / 100
  const curvature = curvaturePct / 100
  const termSlope = termSlopePct / 100

  const strikes = useMemo(() => {
    const values: number[] = []
    for (let k = 0.7; k <= 1.3001; k += 0.05) {
      values.push(Math.round(baseStrike * k))
    }
    return values
  }, [baseStrike])

  const smile = useMemo(
    () => buildSmileSeries(baseStrike, selectedMaturity, atmVol, skew, curvature, termSlope, baseStrike * 0.7, baseStrike * 1.3, 60),
    [baseStrike, selectedMaturity, atmVol, skew, curvature, termSlope],
  )

  const surface = useMemo(
    () => buildSurfaceGrid(baseStrike, MATURITIES, strikes, atmVol, skew, curvature, termSlope),
    [baseStrike, strikes, atmVol, skew, curvature, termSlope],
  )

  const minIv = Math.min(...surface.map((r) => r.iv))
  const maxIv = Math.max(...surface.map((r) => r.iv))
  const atmCell = surface.find((r) => r.strike === baseStrike && Math.abs(r.maturity - selectedMaturity) < 1e-8)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Volatility Smile & Surface</h2>
        <p className="text-sm text-gray-500">Synthetic implied-volatility landscape across strike and term.</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <RangeControl label="ATM Strike Anchor" value={baseStrike} min={60} max={160} step={1} format={(v) => `${v}`} onChange={setBaseStrike} />
        <RangeControl label="ATM Volatility" value={atmVolPct} min={5} max={80} step={0.5} format={(v) => `${v}%`} onChange={setAtmVolPct} />
        <RangeControl label="Skew" value={skewPct} min={-25} max={25} step={0.5} format={(v) => `${v}%`} onChange={setSkewPct} />
        <RangeControl label="Curvature" value={curvaturePct} min={0} max={80} step={1} format={(v) => `${v}%`} onChange={setCurvaturePct} />
        <RangeControl label="Term Slope" value={termSlopePct} min={-3} max={8} step={0.1} format={(v) => `${v}%/yr`} onChange={setTermSlopePct} />
        <RangeControl label="Selected Maturity" value={selectedMaturity} min={0.25} max={3} step={0.25} format={(v) => `${v.toFixed(2)}y`} onChange={setSelectedMaturity} />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={smile} margin={{ top: 5, right: 18, bottom: 16, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="strike" tick={{ fontSize: 11 }} label={{ value: 'Strike', position: 'insideBottom', offset: -10 }} />
              <YAxis tick={{ fontSize: 11 }} label={{ value: 'IV (%)', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(v: number | undefined) => [`${(v ?? 0).toFixed(2)}%`, 'Implied Vol']} />
              <ReferenceLine x={baseStrike} stroke="#111827" strokeDasharray="4 4" />
              <Line type="monotone" dataKey="ivPct" stroke="#2563eb" dot={false} strokeWidth={2} name="Selected maturity" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-gray-200 overflow-auto bg-white p-3">
          <p className="text-xs text-gray-500 mb-2">Heatmap: maturity rows x strike columns</p>
          <div className="grid gap-1" style={{ gridTemplateColumns: `64px repeat(${strikes.length}, minmax(30px, 1fr))` }}>
            <div className="text-[10px] text-gray-400 self-center">T/K</div>
            {strikes.map((strike) => (
              <div key={strike} className="text-[10px] text-gray-500 text-center">{strike}</div>
            ))}

            {MATURITIES.map((maturity) => (
              <Fragment key={`row-${maturity}`}>
                <div className="text-[10px] text-gray-500 self-center">{maturity.toFixed(2)}y</div>
                {strikes.map((strike) => {
                  const cell = surface.find((row) => row.maturity === maturity && row.strike === strike)
                  const iv = cell?.iv ?? minIv
                  return (
                    <div
                      key={`${maturity}-${strike}`}
                      className="h-7 rounded text-[10px] text-center leading-7 font-medium"
                      style={{ background: colorFor(iv, minIv, maxIv), color: iv > (minIv + maxIv) / 2 ? '#0f172a' : '#334155' }}
                    >
                      {(iv * 100).toFixed(1)}
                    </div>
                  )
                })}
              </Fragment>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-sm">
        <StatCard label="Selected ATM IV" value={`${((atmCell?.iv ?? atmVol) * 100).toFixed(2)}%`} color="text-blue-600" />
        <StatCard label="Surface Min IV" value={`${(minIv * 100).toFixed(2)}%`} color="text-gray-700" />
        <StatCard label="Surface Max IV" value={`${(maxIv * 100).toFixed(2)}%`} color="text-purple-600" />
      </div>
    </div>
  )
}
