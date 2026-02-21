import { describe, expect, it } from 'vitest'
import { buildPlaybackSnapshot, simulateDailyOptionMargin } from './math'

describe('simulateDailyOptionMargin', () => {
  it('shows writer losses when short call path trends up', () => {
    const result = simulateDailyOptionMargin({
      type: 'call',
      strike: 100,
      premium: 6,
      initialSpot: 100,
      days: 20,
      rate: 0.03,
      vol: 0,
      drift: 0.2,
      contracts: 1,
      lotSize: 100,
      initialMargin: 5000,
      maintenanceMargin: 3000,
      seed: 7,
    })

    const totalTransfer = result.rows.slice(1).reduce((sum, row) => sum + row.dailyTransfer, 0)
    expect(totalTransfer).toBeLessThan(0)
  })

  it('triggers margin calls and tops up to initial margin', () => {
    const result = simulateDailyOptionMargin({
      type: 'call',
      strike: 100,
      premium: 4,
      initialSpot: 100,
      days: 45,
      rate: 0.03,
      vol: 0,
      drift: 0.4,
      contracts: 3,
      lotSize: 100,
      initialMargin: 2500,
      maintenanceMargin: 1800,
      seed: 42,
    })

    expect(result.marginCalls).toBeGreaterThan(0)
    expect(result.totalTopUps).toBeGreaterThan(0)
    const anyCallRow = result.rows.find((r) => r.topUp > 0)
    expect(anyCallRow).toBeTruthy()
    expect(anyCallRow?.balance).toBeCloseTo(2500, 6)
  })

  it('has no margin calls when margins are generous', () => {
    const result = simulateDailyOptionMargin({
      type: 'put',
      strike: 100,
      premium: 8,
      initialSpot: 100,
      days: 30,
      rate: 0.03,
      vol: 0.12,
      drift: -0.01,
      contracts: 1,
      lotSize: 100,
      initialMargin: 12000,
      maintenanceMargin: 9000,
      seed: 12,
    })

    expect(result.marginCalls).toBe(0)
    expect(result.totalTopUps).toBe(0)
  })
})

describe('buildPlaybackSnapshot', () => {
  it('calculates daily and cumulative transfer at a specific day', () => {
    const result = simulateDailyOptionMargin({
      type: 'call',
      strike: 100,
      premium: 4,
      initialSpot: 100,
      days: 30,
      rate: 0.03,
      vol: 0,
      drift: 0.3,
      contracts: 2,
      lotSize: 100,
      initialMargin: 3000,
      maintenanceMargin: 2000,
      seed: 4,
    })

    const day = 10
    const snapshot = buildPlaybackSnapshot(result.rows, day)
    const expectedCumulative = result.rows.slice(1, day + 1).reduce((sum, row) => sum + row.dailyTransfer, 0)

    expect(snapshot.day).toBe(day)
    expect(snapshot.dailyTransfer).toBeCloseTo(result.rows[day].dailyTransfer, 6)
    expect(snapshot.cumulativeTransfer).toBeCloseTo(expectedCumulative, 6)
  })

  it('flags margin call when top-up occurs on selected day', () => {
    const result = simulateDailyOptionMargin({
      type: 'call',
      strike: 100,
      premium: 4,
      initialSpot: 100,
      days: 45,
      rate: 0.03,
      vol: 0,
      drift: 0.4,
      contracts: 3,
      lotSize: 100,
      initialMargin: 2500,
      maintenanceMargin: 1800,
      seed: 42,
    })

    const firstCall = result.rows.find((row) => row.topUp > 0)
    expect(firstCall).toBeTruthy()

    const snapshot = buildPlaybackSnapshot(result.rows, firstCall?.day ?? 0)
    expect(snapshot.marginCallToday).toBe(true)
    expect(snapshot.topUp).toBeGreaterThan(0)
  })

  it('clamps out-of-range day values', () => {
    const result = simulateDailyOptionMargin({
      type: 'put',
      strike: 100,
      premium: 8,
      initialSpot: 100,
      days: 12,
      rate: 0.03,
      vol: 0.12,
      drift: -0.01,
      contracts: 1,
      lotSize: 100,
      initialMargin: 12000,
      maintenanceMargin: 9000,
      seed: 12,
    })

    const under = buildPlaybackSnapshot(result.rows, -5)
    const over = buildPlaybackSnapshot(result.rows, 999)

    expect(under.day).toBe(0)
    expect(over.day).toBe(result.rows.length - 1)
  })
})
