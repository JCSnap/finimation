import { describe, expect, it } from 'vitest'
import { buildShockSeries, convexity, macaulayDuration, modifiedDuration } from './math'

describe('duration convexity math', () => {
  it('modified duration is macaulay divided by 1+y', () => {
    const mac = macaulayDuration(1000, 0.05, 0.04, 10)
    const mod = modifiedDuration(1000, 0.05, 0.04, 10)
    expect(mod).toBeCloseTo(mac / 1.04, 5)
  })

  it('duration and convexity are positive', () => {
    expect(macaulayDuration(1000, 0.05, 0.04, 10)).toBeGreaterThan(0)
    expect(convexity(1000, 0.05, 0.04, 10)).toBeGreaterThan(0)
  })

  it('duration+convexity approximation improves error near moderate shocks', () => {
    const rows = buildShockSeries(1000, 0.05, 0.04, 10, -0.03, 0.03, 30)
    const near = rows.find((r) => Math.abs(r.shock - 2) < 0.1)
    expect(near).toBeTruthy()
    expect(Math.abs((near?.exact ?? 0) - (near?.durConvApprox ?? 0))).toBeLessThan(
      Math.abs((near?.exact ?? 0) - (near?.durationApprox ?? 0)),
    )
  })
})
