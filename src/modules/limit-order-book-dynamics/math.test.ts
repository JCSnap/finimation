import { describe, expect, it } from 'vitest'
import { applyMarketOrder, createBook, defaultSimulationParams, runSimulation } from './math'

describe('limit order book dynamics math', () => {
  it('market buy consumes ask side from best price upward', () => {
    const book = createBook(100, 0.5, 3, 10)
    const { nextBook, filledQty } = applyMarketOrder(book, 'buy', 16)

    expect(filledQty).toBe(16)
    expect(nextBook.asks[0].size).toBe(0)
    expect(nextBook.asks[1].size).toBe(4)
  })

  it('simulation is deterministic with fixed seed', () => {
    const first = runSimulation(defaultSimulationParams, 20)
    const second = runSimulation(defaultSimulationParams, 20)

    expect(first.events).toEqual(second.events)
    expect(first.snapshots).toEqual(second.snapshots)
  })

  it('keeps spread non-negative in all snapshots', () => {
    const run = runSimulation(defaultSimulationParams, 30)
    expect(run.snapshots.every((s) => s.spread >= 0)).toBe(true)
  })
})
