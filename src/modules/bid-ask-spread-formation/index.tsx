import { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { RangeControl } from '../../components/RangeControl'
import { StatCard } from '../../components/StatCard'
import { computeSpreadQuote, defaultSpreadInputs } from './math'

export default function BidAskSpreadFormation() {
  const [volatility, setVolatility] = useState(defaultSpreadInputs.volatility)
  const [informedProbability, setInformedProbability] = useState(defaultSpreadInputs.informedProbability)
  const [inventoryPosition, setInventoryPosition] = useState(defaultSpreadInputs.inventoryPosition)
  const [competition, setCompetition] = useState(defaultSpreadInputs.competition)

  const quote = useMemo(
    () =>
      computeSpreadQuote({
        ...defaultSpreadInputs,
        volatility,
        informedProbability,
        inventoryPosition,
        competition,
      }),
    [volatility, informedProbability, inventoryPosition, competition],
  )

  const breakdown = [
    { component: 'Processing', bps: Number(quote.processingBps.toFixed(2)) },
    { component: 'Inventory', bps: Number(quote.inventoryBps.toFixed(2)) },
    { component: 'Adverse', bps: Number(quote.adverseSelectionBps.toFixed(2)) },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Bid-Ask Spread Formation</h2>
        <p className="text-sm text-gray-500">Tune market conditions and inspect spread component contributions.</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <RangeControl label="Volatility" value={volatility} min={0} max={1} step={0.01} format={(v) => v.toFixed(2)} onChange={setVolatility} />
        <RangeControl label="Informed Flow Probability" value={informedProbability} min={0} max={1} step={0.01} format={(v) => v.toFixed(2)} onChange={setInformedProbability} />
        <RangeControl label="Inventory Position" value={inventoryPosition} min={-5} max={5} step={0.1} format={(v) => v.toFixed(1)} onChange={setInventoryPosition} />
        <RangeControl label="Competition" value={competition} min={0} max={0.9} step={0.01} format={(v) => v.toFixed(2)} onChange={setCompetition} />
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={breakdown} margin={{ top: 5, right: 18, bottom: 16, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="component" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v: number | undefined) => [`${(v ?? 0).toFixed(2)} bps`, 'Contribution']} />
            <Bar dataKey="bps" fill="#2563eb" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-4 gap-4 text-sm">
        <StatCard label="Bid" value={quote.bid.toFixed(4)} color="text-red-600" />
        <StatCard label="Mid" value={defaultSpreadInputs.midPrice.toFixed(4)} color="text-gray-700" />
        <StatCard label="Ask" value={quote.ask.toFixed(4)} color="text-green-600" />
        <StatCard label="Total Spread" value={`${quote.totalBps.toFixed(2)} bps`} color="text-blue-600" />
      </div>
    </div>
  )
}
