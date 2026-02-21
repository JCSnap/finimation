import { describe, it, expect } from 'vitest'
import { portfolioStats, buildFrontier } from './math'

describe('portfolioStats', () => {
  it('fully invested in asset 1 returns asset 1 stats', () => {
    const { ret, risk } = portfolioStats(0.1, 0.2, 0.15, 0.25, 0.3, 1.0)
    expect(ret).toBeCloseTo(0.1, 5)
    expect(risk).toBeCloseTo(0.2, 5)
  })
  it('fully invested in asset 2 returns asset 2 stats', () => {
    const { ret, risk } = portfolioStats(0.1, 0.2, 0.15, 0.25, 0.3, 0.0)
    expect(ret).toBeCloseTo(0.15, 5)
    expect(risk).toBeCloseTo(0.25, 5)
  })
})

describe('buildFrontier', () => {
  it('returns array of portfolio points', () => {
    const pts = buildFrontier(0.1, 0.2, 0.15, 0.25, 0.3, 20)
    expect(pts.length).toBe(21)
    expect(pts[0]).toHaveProperty('risk')
    expect(pts[0]).toHaveProperty('ret')
    expect(pts[0]).toHaveProperty('weight1')
  })

  it('returns correct percentage-scaled values at boundary weights', () => {
    const pts = buildFrontier(0.1, 0.2, 0.15, 0.25, 0.3, 20)
    // pts[0]: weight1=0 → fully in asset 2 (ret2=15%, risk2=25%)
    expect(pts[0].weight1).toBe(0)
    expect(pts[0].ret).toBeCloseTo(15, 1)
    expect(pts[0].risk).toBeCloseTo(25, 1)
    // pts[20]: weight1=1 → fully in asset 1 (ret1=10%, risk1=20%)
    expect(pts[20].weight1).toBe(100)
    expect(pts[20].ret).toBeCloseTo(10, 1)
    expect(pts[20].risk).toBeCloseTo(20, 1)
    // diversification at ρ=0.3: interior minimum risk < both endpoints
    const risks = pts.map(p => p.risk)
    expect(Math.min(...risks)).toBeLessThan(20)
  })
})
