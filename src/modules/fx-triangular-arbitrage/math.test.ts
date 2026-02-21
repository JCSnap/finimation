import { describe, expect, it } from 'vitest'
import { evaluateTriangularArbitrage } from './math'
import type { Quote } from './math'

const quotes: Quote[] = [
  { pair: 'EUR/USD', bid: 1.1, ask: 1.1002 },
  { pair: 'USD/JPY', bid: 150, ask: 150.02 },
  { pair: 'EUR/JPY', bid: 165.5, ask: 165.6 },
]

describe('fx triangular arbitrage math', () => {
  it('finds best loop direction with positive net edge when mispricing exists', () => {
    const result = evaluateTriangularArbitrage({
      baseCurrency: 'USD',
      secondCurrency: 'EUR',
      thirdCurrency: 'JPY',
      quotes,
      notional: 1_000_000,
      feeBpsPerLeg: 0,
      slippageBpsPerLeg: 0,
    })

    expect(result.best.netReturnPct).toBeGreaterThan(0)
    expect(result.best.path).toBe('USD -> EUR -> JPY -> USD')
  })

  it('fees and slippage can eliminate the edge', () => {
    const result = evaluateTriangularArbitrage({
      baseCurrency: 'USD',
      secondCurrency: 'EUR',
      thirdCurrency: 'JPY',
      quotes,
      notional: 1_000_000,
      feeBpsPerLeg: 20,
      slippageBpsPerLeg: 20,
    })

    expect(result.best.netReturnPct).toBeLessThanOrEqual(0)
  })

  it('near no-arbitrage quotes result in tiny net edge', () => {
    const fairQuotes: Quote[] = [
      { pair: 'EUR/USD', bid: 1.1, ask: 1.1002 },
      { pair: 'USD/JPY', bid: 150, ask: 150.02 },
      { pair: 'EUR/JPY', bid: 165.02, ask: 165.06 },
    ]

    const result = evaluateTriangularArbitrage({
      baseCurrency: 'USD',
      secondCurrency: 'EUR',
      thirdCurrency: 'JPY',
      quotes: fairQuotes,
      notional: 1_000_000,
      feeBpsPerLeg: 0,
      slippageBpsPerLeg: 0,
    })

    expect(Math.abs(result.best.netReturnPct)).toBeLessThan(0.05)
  })
})
