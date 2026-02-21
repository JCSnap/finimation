import { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { RangeControl } from '../../components/RangeControl'
import { StatCard } from '../../components/StatCard'
import { evaluateTriangularArbitrage } from './math'

export default function FxTriangularArbitrage() {
  const [eurUsdBid, setEurUsdBid] = useState(1.1)
  const [eurUsdAsk, setEurUsdAsk] = useState(1.1002)
  const [usdJpyBid, setUsdJpyBid] = useState(150)
  const [usdJpyAsk, setUsdJpyAsk] = useState(150.02)
  const [eurJpyBid, setEurJpyBid] = useState(165.5)
  const [eurJpyAsk, setEurJpyAsk] = useState(165.6)
  const [notional, setNotional] = useState(1_000_000)
  const [feeBps, setFeeBps] = useState(1)
  const [slippageBps, setSlippageBps] = useState(1)

  const result = useMemo(
    () =>
      evaluateTriangularArbitrage({
        baseCurrency: 'USD',
        secondCurrency: 'EUR',
        thirdCurrency: 'JPY',
        quotes: [
          { pair: 'EUR/USD', bid: eurUsdBid, ask: eurUsdAsk },
          { pair: 'USD/JPY', bid: usdJpyBid, ask: usdJpyAsk },
          { pair: 'EUR/JPY', bid: eurJpyBid, ask: eurJpyAsk },
        ],
        notional,
        feeBpsPerLeg: feeBps,
        slippageBpsPerLeg: slippageBps,
      }),
    [eurUsdBid, eurUsdAsk, usdJpyBid, usdJpyAsk, eurJpyBid, eurJpyAsk, notional, feeBps, slippageBps],
  )

  const pathRows = [
    { path: 'Path 1', net: Number(result.path1.netReturnPct.toFixed(5)), gross: Number(result.path1.grossReturnPct.toFixed(5)) },
    { path: 'Path 2', net: Number(result.path2.netReturnPct.toFixed(5)), gross: Number(result.path2.grossReturnPct.toFixed(5)) },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">FX Triangular Arbitrage</h2>
        <p className="text-sm text-gray-500">Evaluate loop returns after bid/ask execution and friction costs.</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <RangeControl label="EUR/USD Bid" value={eurUsdBid} min={0.8} max={1.4} step={0.0001} format={(v) => v.toFixed(4)} onChange={setEurUsdBid} />
        <RangeControl label="EUR/USD Ask" value={eurUsdAsk} min={0.8} max={1.4} step={0.0001} format={(v) => v.toFixed(4)} onChange={setEurUsdAsk} />
        <RangeControl label="USD/JPY Bid" value={usdJpyBid} min={80} max={220} step={0.01} format={(v) => v.toFixed(2)} onChange={setUsdJpyBid} />
        <RangeControl label="USD/JPY Ask" value={usdJpyAsk} min={80} max={220} step={0.01} format={(v) => v.toFixed(2)} onChange={setUsdJpyAsk} />
        <RangeControl label="EUR/JPY Bid" value={eurJpyBid} min={90} max={260} step={0.01} format={(v) => v.toFixed(2)} onChange={setEurJpyBid} />
        <RangeControl label="EUR/JPY Ask" value={eurJpyAsk} min={90} max={260} step={0.01} format={(v) => v.toFixed(2)} onChange={setEurJpyAsk} />
        <RangeControl label="Notional (USD)" value={notional} min={10000} max={5000000} step={10000} format={(v) => `$${Math.round(v)}`} onChange={setNotional} />
        <RangeControl label="Fee per Leg" value={feeBps} min={0} max={40} step={1} format={(v) => `${v} bps`} onChange={setFeeBps} />
        <RangeControl label="Slippage per Leg" value={slippageBps} min={0} max={40} step={1} format={(v) => `${v} bps`} onChange={setSlippageBps} />
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={pathRows} margin={{ top: 5, right: 18, bottom: 16, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="path" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v: number | undefined) => [`${(v ?? 0).toFixed(5)}%`]} />
            <Bar dataKey="gross" fill="#16a34a" />
            <Bar dataKey="net" fill="#2563eb" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-4 gap-4 text-sm">
        <StatCard label="Best Path" value={result.best.path} color="text-gray-700" />
        <StatCard label="Best Gross Return" value={`${result.best.grossReturnPct.toFixed(5)}%`} color="text-green-600" />
        <StatCard label="Best Net Return" value={`${result.best.netReturnPct.toFixed(5)}%`} color={result.best.netReturnPct >= 0 ? 'text-blue-600' : 'text-red-600'} />
        <StatCard label="Ending Amount" value={`$${result.best.endingAmount.toFixed(2)}`} color="text-purple-600" />
      </div>
    </div>
  )
}
