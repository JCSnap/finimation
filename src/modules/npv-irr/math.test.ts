import { describe, expect, it } from 'vitest'
import { buildNpvProfile, irr, npv } from './math'

describe('npv irr math', () => {
  it('npv at zero rate equals sum of cash flows', () => {
    const flows = [-1000, 400, 500, 300]
    expect(npv(flows, 0)).toBeCloseTo(200, 8)
  })

  it('finds irr for basic project', () => {
    const value = irr([-1000, 600, 600])
    expect(value).not.toBeNull()
    expect(value ?? 0).toBeCloseTo(0.1307, 3)
  })

  it('builds npv profile', () => {
    const profile = buildNpvProfile([-1000, 500, 500, 500], -0.1, 0.3, 40)
    expect(profile.length).toBe(41)
  })
})
