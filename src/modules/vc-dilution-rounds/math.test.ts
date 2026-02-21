import { describe, expect, it } from 'vitest'
import { buildDilutionScenario, requiredOwnership } from './math'

describe('vc dilution math', () => {
  it('required ownership rises with higher target irr', () => {
    const low = requiredOwnership(10_000_000, 1_000_000, 0.2, 5)
    const high = requiredOwnership(10_000_000, 1_000_000, 0.5, 5)

    expect(high).toBeGreaterThan(low)
  })

  it('ownership stays approximately 100% across rounds', () => {
    const scenario = buildDilutionScenario({
      exitMetric: 1_500_000,
      exitMultiple: 8,
      yearsToExit: 5,
      targetIrr: 0.45,
      founderShares: 2_000_000,
      rounds: [
        { label: 'Round 1', investment: 1_000_000 },
        { label: 'Round 2', investment: 1_000_000 },
      ],
      esopPctAfterRound: [0, 0],
    })

    const last = scenario.rounds.at(-1)
    expect(last).toBeTruthy()
    const totalPct = Object.values(last?.ownershipPct ?? {}).reduce((sum, value) => sum + value, 0)
    expect(totalPct).toBeCloseTo(100, 4)
  })

  it('later rounds dilute prior holders', () => {
    const scenario = buildDilutionScenario({
      exitMetric: 1_200_000,
      exitMultiple: 10,
      yearsToExit: 5,
      targetIrr: 0.5,
      founderShares: 2_000_000,
      rounds: [
        { label: 'Round 1', investment: 1_000_000 },
        { label: 'Round 2', investment: 1_000_000 },
      ],
      esopPctAfterRound: [0, 0],
    })

    const founderRound1 = scenario.rounds[0].ownershipPct['Founder']
    const founderRound2 = scenario.rounds[1].ownershipPct['Founder']
    expect(founderRound2).toBeLessThan(founderRound1)
  })
})
