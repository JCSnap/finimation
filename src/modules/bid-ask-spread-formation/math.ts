export interface SpreadInputs {
  midPrice: number
  tickSize: number
  baseBps: number
  volatility: number
  informedProbability: number
  inventoryPosition: number
  inventoryAversion: number
  infoSensitivity: number
  competition: number
}

export interface SpreadQuote {
  processingBps: number
  inventoryBps: number
  adverseSelectionBps: number
  totalBps: number
  quotedSpread: number
  bid: number
  ask: number
}

export const defaultSpreadInputs: SpreadInputs = {
  midPrice: 100,
  tickSize: 0.01,
  baseBps: 2,
  volatility: 0.2,
  informedProbability: 0.2,
  inventoryPosition: 0,
  inventoryAversion: 20,
  infoSensitivity: 60,
  competition: 0.2,
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function roundUpToTick(value: number, tickSize: number): number {
  if (tickSize <= 0) return value
  return Math.ceil(value / tickSize) * tickSize
}

export function computeSpreadQuote(input: SpreadInputs): SpreadQuote {
  const tickSize = Math.max(input.tickSize, 1e-6)
  const midPrice = Math.max(input.midPrice, tickSize)

  const processingBps = Math.max(0, input.baseBps)
  const inventoryBps = Math.max(0, input.inventoryAversion * Math.abs(input.inventoryPosition) * input.volatility)
  const adverseSelectionBps = Math.max(0, input.infoSensitivity * input.informedProbability * input.volatility)

  const preCompetitionBps = processingBps + inventoryBps + adverseSelectionBps
  const competitionFactor = 1 - clamp(input.competition, 0, 0.95)
  const totalBps = preCompetitionBps * competitionFactor

  const rawSpread = (midPrice * totalBps) / 10000
  const quotedSpread = Math.max(tickSize, roundUpToTick(rawSpread, tickSize))
  const bid = midPrice - quotedSpread / 2
  const ask = midPrice + quotedSpread / 2

  return {
    processingBps,
    inventoryBps,
    adverseSelectionBps,
    totalBps,
    quotedSpread,
    bid,
    ask,
  }
}
