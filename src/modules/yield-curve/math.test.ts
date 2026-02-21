import { describe, expect, it } from 'vitest'
import { buildInterpolatedCurve, discountFactor, zeroCouponPrice } from './math'

describe('yield curve math', () => {
  it('interpolates linearly between key rates', () => {
    const rows = buildInterpolatedCurve(
      [
        { tenor: 1, rate: 0.03 },
        { tenor: 5, rate: 0.05 },
      ],
      1,
    )
    const threeYear = rows.find((r) => r.tenor === 3)
    expect(threeYear?.rate).toBeCloseTo(0.04, 6)
  })

  it('discount factor and zero coupon price make sense', () => {
    expect(discountFactor(0.05, 10)).toBeLessThan(1)
    expect(zeroCouponPrice(1000, 0.05, 10)).toBeLessThan(1000)
  })
})
