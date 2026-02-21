import { describe, it, expect } from 'vitest'
import { presentValue, futureValue, annuityPV, buildGrowthSeries } from './math'

describe('presentValue', () => {
  it('discounts future value correctly', () => {
    // $1000 in 10 years at 5% ≈ $613.91
    expect(presentValue(1000, 0.05, 10)).toBeCloseTo(613.91, 1)
  })
})

describe('futureValue', () => {
  it('compounds present value correctly', () => {
    // $1000 at 5% for 10 years ≈ $1628.89
    expect(futureValue(1000, 0.05, 10)).toBeCloseTo(1628.89, 1)
  })
})

describe('annuityPV', () => {
  it('calculates PV of annuity', () => {
    // $100/yr for 10yr at 5% ≈ $772.17
    expect(annuityPV(100, 0.05, 10)).toBeCloseTo(772.17, 1)
  })
  it('returns payment * periods when rate is 0', () => {
    expect(annuityPV(100, 0, 10)).toBeCloseTo(1000, 1)
  })
})

describe('buildGrowthSeries', () => {
  it('returns array of period and value', () => {
    const series = buildGrowthSeries(1000, 0.05, 10)
    expect(series.length).toBe(11)
    expect(series[0]).toHaveProperty('period')
    expect(series[0]).toHaveProperty('value')
    expect(series[0].period).toBe(0)
    expect(series[0].value).toBeCloseTo(1000)
  })
  it('compounds correctly at endpoint', () => {
    const series = buildGrowthSeries(1000, 0.05, 10)
    expect(series[10].period).toBe(10)
    expect(series[10].value).toBeCloseTo(1628.89, 1)
  })
})
