import { describe, expect, it } from 'vitest'
import { computeSpreadQuote, defaultSpreadInputs } from './math'

describe('bid ask spread formation math', () => {
  it('widens spread as volatility rises', () => {
    const calm = computeSpreadQuote({ ...defaultSpreadInputs, volatility: 0.1 })
    const stressed = computeSpreadQuote({ ...defaultSpreadInputs, volatility: 0.45 })

    expect(stressed.totalBps).toBeGreaterThan(calm.totalBps)
    expect(stressed.quotedSpread).toBeGreaterThanOrEqual(calm.quotedSpread)
  })

  it('tightens spread with stronger competition', () => {
    const loose = computeSpreadQuote({ ...defaultSpreadInputs, competition: 0.05 })
    const tight = computeSpreadQuote({ ...defaultSpreadInputs, competition: 0.45 })

    expect(tight.totalBps).toBeLessThan(loose.totalBps)
  })

  it('always respects minimum one tick spread', () => {
    const quote = computeSpreadQuote({
      ...defaultSpreadInputs,
      baseBps: 0,
      volatility: 0,
      informedProbability: 0,
      inventoryPosition: 0,
    })

    expect(quote.quotedSpread).toBeGreaterThanOrEqual(defaultSpreadInputs.tickSize)
  })
})
