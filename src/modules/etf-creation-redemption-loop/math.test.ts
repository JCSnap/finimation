import { describe, expect, it } from 'vitest'
import { defaultEtfParams, defaultEtfState, stepEtfArbitrage } from './math'

describe('etf creation redemption math', () => {
  it('premium scenario triggers creation and narrows premium', () => {
    const start = { ...defaultEtfState, nav: 100, etfPrice: 102 }
    const result = stepEtfArbitrage(start, defaultEtfParams)

    expect(result.action).toBe('creation')
    expect(Math.abs(result.next.premiumPct)).toBeLessThan(Math.abs(result.before.premiumPct))
  })

  it('discount scenario triggers redemption and narrows discount', () => {
    const start = { ...defaultEtfState, nav: 100, etfPrice: 98 }
    const result = stepEtfArbitrage(start, defaultEtfParams)

    expect(result.action).toBe('redemption')
    expect(Math.abs(result.next.premiumPct)).toBeLessThan(Math.abs(result.before.premiumPct))
  })

  it('high frictions can suppress arbitrage action', () => {
    const start = { ...defaultEtfState, nav: 100, etfPrice: 100.2 }
    const result = stepEtfArbitrage(start, {
      ...defaultEtfParams,
      thresholdBps: 1,
      creationFeeBps: 18,
      redemptionFeeBps: 18,
      transactionCostBps: 12,
      slippageBps: 8,
    })

    expect(result.action).toBe('none')
  })
})
