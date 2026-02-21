import { describe, expect, it } from 'vitest'
import { defaultLinkageInput, projectStatements } from './math'

describe('three statement linkage math', () => {
  it('keeps assets equal to liabilities plus equity each year', () => {
    const rows = projectStatements(defaultLinkageInput)

    for (const row of rows) {
      expect(Math.abs(row.assets - (row.debt + row.equity))).toBeLessThan(1e-6)
    }
  })

  it('matches cash movement with total cash flow identity', () => {
    const rows = projectStatements(defaultLinkageInput)

    for (let i = 1; i < rows.length; i++) {
      const prev = rows[i - 1]
      const curr = rows[i]
      expect(curr.cash - prev.cash).toBeCloseTo(curr.cfo + curr.cfi + curr.cff, 8)
    }
  })

  it('maintains minimum cash through debt plug', () => {
    const rows = projectStatements({
      ...defaultLinkageInput,
      minCash: 120,
      openingCash: 80,
    })

    for (const row of rows) {
      expect(row.cash).toBeGreaterThanOrEqual(120 - 1e-6)
    }
  })
})
