import { describe, expect, it } from 'vitest'
import { blackScholesPrice, buildGreeksSeries, greeks } from './math'

describe('option greeks math', () => {
  it('returns sensible black-scholes prices', () => {
    const call = blackScholesPrice('call', 100, 100, 0.03, 0.2, 1)
    const put = blackScholesPrice('put', 100, 100, 0.03, 0.2, 1)
    expect(call).toBeGreaterThan(put)
    expect(call).toBeGreaterThan(0)
  })

  it('greeks are in expected ranges', () => {
    const gCall = greeks('call', 100, 100, 0.03, 0.2, 1)
    const gPut = greeks('put', 100, 100, 0.03, 0.2, 1)
    expect(gCall.delta).toBeGreaterThan(0)
    expect(gCall.delta).toBeLessThan(1)
    expect(gPut.delta).toBeLessThan(0)
    expect(gPut.delta).toBeGreaterThan(-1)
    expect(gCall.gamma).toBeGreaterThan(0)
    expect(gCall.vega).toBeGreaterThan(0)
  })

  it('builds line-ready series', () => {
    const rows = buildGreeksSeries('call', 100, 0.03, 0.2, 1, 60, 140, 40)
    expect(rows.length).toBe(41)
    expect(rows[0]).toHaveProperty('spot')
    expect(rows[0]).toHaveProperty('delta')
  })
})
