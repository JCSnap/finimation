import { describe, it, expect } from 'vitest'
import { callPayoff, putPayoff, buildPayoffSeries } from './math'

describe('callPayoff', () => {
  it('is -premium when out-of-the-money (price < strike)', () => {
    expect(callPayoff(90, 100, 5)).toBe(-5)
  })
  it('is positive when price > strike', () => {
    expect(callPayoff(120, 100, 5)).toBe(15)
  })
  it('is -premium at expiry when at-the-money', () => {
    expect(callPayoff(100, 100, 5)).toBe(-5)
  })
})

describe('putPayoff', () => {
  it('is -premium when out-of-the-money (price > strike)', () => {
    expect(putPayoff(110, 100, 5)).toBe(-5)
  })
  it('is positive when price < strike', () => {
    expect(putPayoff(80, 100, 5)).toBe(15)
  })
})

describe('buildPayoffSeries', () => {
  it('returns array of {price, payoff} objects', () => {
    const series = buildPayoffSeries('call', 100, 5, 50, 150, 10)
    expect(series.length).toBeGreaterThan(0)
    expect(series[0]).toHaveProperty('price')
    expect(series[0]).toHaveProperty('payoff')
  })

  it('includes the endpoint and delegates payoff math correctly', () => {
    const series = buildPayoffSeries('call', 100, 5, 50, 150, 10)
    // spot=150, strike=100, premium=5 → max(150-100,0)-5 = 45
    const last = series[series.length - 1]
    expect(last.price).toBe(150)
    expect(last.payoff).toBeCloseTo(45, 5)
  })
})
