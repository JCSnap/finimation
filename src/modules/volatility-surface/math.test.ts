import { describe, expect, it } from 'vitest'
import { buildSmileSeries, buildSurfaceGrid, smileIV } from './math'

describe('volatility surface math', () => {
  it('returns atm vol at moneyness zero', () => {
    const iv = smileIV(100, 100, 1, 0.22, -0.08, 0.2, 0.01)
    expect(iv).toBeCloseTo(0.23, 3)
  })

  it('curvature lifts the wings', () => {
    const atm = smileIV(100, 100, 1, 0.22, 0, 0.25, 0)
    const wing = smileIV(130, 100, 1, 0.22, 0, 0.25, 0)
    expect(wing).toBeGreaterThan(atm)
  })

  it('builds smile and surface shapes', () => {
    const smile = buildSmileSeries(100, 0.5, 0.22, -0.08, 0.2, 0.01, 70, 130, 30)
    const surf = buildSurfaceGrid(100, [0.25, 0.5, 1, 2], [80, 100, 120], 0.22, -0.08, 0.2, 0.01)
    expect(smile.length).toBe(31)
    expect(surf.length).toBe(12)
  })
})
