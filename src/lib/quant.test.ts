import { describe, expect, it } from 'vitest'
import { clamp, lerp, normalCdf, normalPdf } from './quant'

describe('quant helpers', () => {
  it('normal pdf peaks at zero', () => {
    expect(normalPdf(0)).toBeGreaterThan(normalPdf(1))
  })

  it('normal cdf is symmetric', () => {
    expect(normalCdf(0)).toBeCloseTo(0.5, 3)
    expect(normalCdf(1)).toBeCloseTo(1 - normalCdf(-1), 3)
  })

  it('clamp and lerp behave as expected', () => {
    expect(clamp(12, 0, 10)).toBe(10)
    expect(clamp(-2, 0, 10)).toBe(0)
    expect(lerp(2, 10, 0.25)).toBeCloseTo(4)
  })
})
