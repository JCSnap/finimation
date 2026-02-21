import { describe, expect, it } from 'vitest'
import { alpha, buildSmlSeries, capmReturn } from './math'

describe('capm sml math', () => {
  it('beta zero equals risk free', () => {
    expect(capmReturn(0, 0.03, 0.1)).toBeCloseTo(0.03)
  })

  it('beta one equals market return', () => {
    expect(capmReturn(1, 0.03, 0.1)).toBeCloseTo(0.1)
  })

  it('alpha is zero on the line', () => {
    expect(alpha(0.1, 1, 0.03, 0.1)).toBeCloseTo(0)
  })

  it('builds sml series', () => {
    const s = buildSmlSeries(0.03, 0.1, -0.5, 2, 25)
    expect(s.length).toBe(26)
  })
})
