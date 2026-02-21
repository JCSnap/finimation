import { describe, expect, it } from 'vitest'
import { amortizationSchedule, periodicPayment } from './math'

describe('loan amortization math', () => {
  it('computes positive periodic payment', () => {
    const pmt = periodicPayment(300000, 0.06, 30, 12)
    expect(pmt).toBeGreaterThan(0)
  })

  it('builds schedule and pays down to near zero', () => {
    const rows = amortizationSchedule(200000, 0.05, 30, 12, 0)
    expect(rows.length).toBe(360)
    expect(rows.at(-1)?.balance ?? 1).toBeLessThan(1)
  })

  it('extra payment shortens schedule', () => {
    const base = amortizationSchedule(200000, 0.05, 30, 12, 0)
    const extra = amortizationSchedule(200000, 0.05, 30, 12, 200)
    expect(extra.length).toBeLessThan(base.length)
  })
})
