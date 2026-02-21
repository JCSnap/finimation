import { describe, it, expect } from 'vitest'
import { bondPrice, buildPriceVsYTMSeries } from './math'

describe('bondPrice', () => {
  it('equals face value when coupon rate equals YTM', () => {
    expect(bondPrice(1000, 0.05, 0.05, 10)).toBeCloseTo(1000, 1)
  })
  it('is above face value when YTM < coupon rate (premium bond)', () => {
    expect(bondPrice(1000, 0.05, 0.03, 10)).toBeGreaterThan(1000)
  })
  it('is below face value when YTM > coupon rate (discount bond)', () => {
    expect(bondPrice(1000, 0.05, 0.08, 10)).toBeLessThan(1000)
  })
})

describe('buildPriceVsYTMSeries', () => {
  it('returns array with ytm and price keys', () => {
    const series = buildPriceVsYTMSeries(1000, 0.05, 10, 0.01, 0.15, 20)
    expect(series[0]).toHaveProperty('ytm')
    expect(series[0]).toHaveProperty('price')
  })
  it('price decreases as YTM increases', () => {
    const series = buildPriceVsYTMSeries(1000, 0.05, 10, 0.01, 0.15, 20)
    for (let i = 1; i < series.length; i++) {
      expect(series[i].price).toBeLessThanOrEqual(series[i - 1].price)
    }
  })
})
