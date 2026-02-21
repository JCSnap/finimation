import { describe, it, expect } from 'vitest'
import { registry } from '../registry'

describe('registry', () => {
  it('exports an array', () => {
    expect(Array.isArray(registry)).toBe(true)
  })

  it('each entry has required fields', () => {
    for (const mod of registry) {
      expect(mod.meta.id).toBeTruthy()
      expect(mod.meta.title).toBeTruthy()
      expect(mod.meta.category).toBeTruthy()
      expect(typeof mod.component).toBe('function')
      expect(typeof mod.notes).toBe('string')
    }
  })

  it('contains all expected module ids', () => {
    const ids = registry.map((mod) => mod.meta.id)
    expect(ids).toEqual(expect.arrayContaining([
      'options-payoff',
      'option-greeks-explorer',
      'volatility-smile-surface',
      'options-daily-margin',
      'bond-pricing',
      'duration-convexity-lab',
      'yield-curve-builder',
      'efficient-frontier',
      'cal-tangency-portfolio',
      'capm-security-market-line',
      'time-value-of-money',
      'npv-profile-irr',
      'loan-amortization-studio',
      'three-statement-linkage',
      'bid-ask-spread-formation',
      'limit-order-book-dynamics',
      'etf-creation-redemption-loop',
      'fx-triangular-arbitrage',
      'vc-dilution-rounds',
      'vc-portfolio-returns',
    ]))
  })
})
