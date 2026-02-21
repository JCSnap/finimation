import { describe, expect, it } from 'vitest'
import { buildCalSeries, tangencyWeights, twoAssetStats } from './math'

describe('cal tangency math', () => {
  it('tangency weights sum to one', () => {
    const w = tangencyWeights(0.08, 0.12, 0.14, 0.2, 0.3, 0.03)
    expect(w.w1 + w.w2).toBeCloseTo(1, 6)
  })

  it('cal starts at risk-free point', () => {
    const series = buildCalSeries(0.03, 0.1, 0.09, -0.5, 1.5, 20)
    expect(series[0].risk).toBeCloseTo(0)
    expect(series[0].ret).toBeCloseTo(0.03 * 100)
  })

  it('two-asset stats return positive risk', () => {
    const stats = twoAssetStats(0.08, 0.12, 0.14, 0.2, 0.3, 0.5)
    expect(stats.risk).toBeGreaterThan(0)
  })
})
