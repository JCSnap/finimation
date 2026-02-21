import { describe, expect, it } from 'vitest'
import { computePortfolioOutcome, requiredHomeRunMultiple } from './math'

describe('vc portfolio returns math', () => {
  it('computes weighted moic correctly', () => {
    const result = computePortfolioOutcome({
      fundSize: 100_000_000,
      years: 5,
      homeRunPct: 0.2,
      livingDeadPct: 0.6,
      lossPct: 0.2,
      homeRunMultiple: 8,
      livingDeadMultiple: 1,
      managementFeePctPerYear: 0,
      carryPct: 0,
    })

    expect(result.grossMoic).toBeCloseTo(2.2, 6)
  })

  it('irr rises when home run multiple rises', () => {
    const low = computePortfolioOutcome({
      fundSize: 100_000_000,
      years: 5,
      homeRunPct: 0.2,
      livingDeadPct: 0.6,
      lossPct: 0.2,
      homeRunMultiple: 5,
      livingDeadMultiple: 1,
      managementFeePctPerYear: 0,
      carryPct: 0,
    })

    const high = computePortfolioOutcome({
      fundSize: 100_000_000,
      years: 5,
      homeRunPct: 0.2,
      livingDeadPct: 0.6,
      lossPct: 0.2,
      homeRunMultiple: 10,
      livingDeadMultiple: 1,
      managementFeePctPerYear: 0,
      carryPct: 0,
    })

    expect(high.grossIrr).toBeGreaterThan(low.grossIrr)
  })

  it('required home-run multiple solves the target irr equation', () => {
    const required = requiredHomeRunMultiple({
      years: 5,
      targetIrr: 0.25,
      homeRunPct: 0.2,
      livingDeadPct: 0.6,
      lossPct: 0.2,
      livingDeadMultiple: 1,
    })

    const portfolio = computePortfolioOutcome({
      fundSize: 100_000_000,
      years: 5,
      homeRunPct: 0.2,
      livingDeadPct: 0.6,
      lossPct: 0.2,
      homeRunMultiple: required,
      livingDeadMultiple: 1,
      managementFeePctPerYear: 0,
      carryPct: 0,
    })

    expect(portfolio.grossIrr).toBeCloseTo(0.25, 3)
  })
})
