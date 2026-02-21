export type BookSide = 'buy' | 'sell'

export interface Level {
  price: number
  size: number
}

export interface BookState {
  bids: Level[]
  asks: Level[]
  lastTradePrice: number
}

export interface MetricsSnapshot {
  spread: number
  imbalance: number
  microprice: number
}

export interface SimulationParams {
  seed: number
  mid: number
  tickSize: number
  levels: number
  baseSize: number
  limitArrivalRate: number
  cancelRate: number
  marketRate: number
  marketOrderSize: number
}

export interface SimulationRun {
  events: string[]
  snapshots: MetricsSnapshot[]
}

export const defaultSimulationParams: SimulationParams = {
  seed: 42,
  mid: 100,
  tickSize: 0.5,
  levels: 6,
  baseSize: 20,
  limitArrivalRate: 0.45,
  cancelRate: 0.3,
  marketRate: 0.25,
  marketOrderSize: 8,
}

function mulberry32(seed: number): () => number {
  let t = seed >>> 0
  return () => {
    t += 0x6d2b79f5
    let x = Math.imul(t ^ (t >>> 15), 1 | t)
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x)
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296
  }
}

export function createBook(mid: number, tickSize: number, levels: number, baseSize: number): BookState {
  const bids: Level[] = []
  const asks: Level[] = []

  for (let i = 1; i <= levels; i++) {
    bids.push({ price: mid - i * tickSize, size: baseSize })
    asks.push({ price: mid + i * tickSize, size: baseSize })
  }

  return { bids, asks, lastTradePrice: mid }
}

export function applyMarketOrder(
  book: BookState,
  side: BookSide,
  quantity: number,
): { nextBook: BookState; filledQty: number; avgPrice: number } {
  const nextBook: BookState = {
    bids: book.bids.map((level) => ({ ...level })),
    asks: book.asks.map((level) => ({ ...level })),
    lastTradePrice: book.lastTradePrice,
  }

  let remaining = Math.max(0, quantity)
  let filledQty = 0
  let notional = 0

  const levels = side === 'buy' ? nextBook.asks : nextBook.bids

  for (const level of levels) {
    if (remaining <= 0) break
    const taken = Math.min(level.size, remaining)
    level.size -= taken
    remaining -= taken
    filledQty += taken
    notional += taken * level.price
    if (taken > 0) {
      nextBook.lastTradePrice = level.price
    }
  }

  const avgPrice = filledQty > 0 ? notional / filledQty : nextBook.lastTradePrice
  return { nextBook, filledQty, avgPrice }
}

export function computeSnapshot(book: BookState): MetricsSnapshot {
  const bestBid = book.bids.find((level) => level.size > 0)
  const bestAsk = book.asks.find((level) => level.size > 0)

  const bid = bestBid?.price ?? book.lastTradePrice
  const ask = bestAsk?.price ?? book.lastTradePrice
  const bidSize = bestBid?.size ?? 0
  const askSize = bestAsk?.size ?? 0

  const spread = Math.max(0, ask - bid)
  const imbalanceDenom = bidSize + askSize
  const imbalance = imbalanceDenom > 0 ? (bidSize - askSize) / imbalanceDenom : 0
  const microprice =
    imbalanceDenom > 0 ? (ask * bidSize + bid * askSize) / imbalanceDenom : (ask + bid) / 2

  return { spread, imbalance, microprice }
}

function replenishBook(book: BookState, baseSize: number): void {
  for (const bid of book.bids) {
    if (bid.size <= 0) {
      bid.size = Math.max(1, Math.round(baseSize / 2))
    }
  }
  for (const ask of book.asks) {
    if (ask.size <= 0) {
      ask.size = Math.max(1, Math.round(baseSize / 2))
    }
  }
}

export function runSimulation(params: SimulationParams, steps: number): SimulationRun {
  const rand = mulberry32(params.seed)
  let book = createBook(params.mid, params.tickSize, params.levels, params.baseSize)

  const events: string[] = []
  const snapshots: MetricsSnapshot[] = [computeSnapshot(book)]

  for (let i = 0; i < steps; i++) {
    const r = rand()

    if (r < params.marketRate) {
      const side: BookSide = rand() < 0.5 ? 'buy' : 'sell'
      const { nextBook, filledQty, avgPrice } = applyMarketOrder(book, side, params.marketOrderSize)
      book = nextBook
      events.push(`MKT_${side.toUpperCase()}_${filledQty}@${avgPrice.toFixed(2)}`)
    } else if (r < params.marketRate + params.cancelRate) {
      const isAsk = rand() < 0.5
      const side = isAsk ? book.asks : book.bids
      const index = Math.floor(rand() * side.length)
      const drop = Math.max(1, Math.round(params.baseSize * 0.35))
      side[index].size = Math.max(0, side[index].size - drop)
      events.push(`CANCEL_${isAsk ? 'ASK' : 'BID'}_${index}`)
    } else {
      const isAsk = rand() < 0.5
      const side = isAsk ? book.asks : book.bids
      const index = Math.floor(rand() * side.length)
      const add = Math.max(1, Math.round(params.baseSize * params.limitArrivalRate))
      side[index].size += add
      events.push(`LIMIT_${isAsk ? 'ASK' : 'BID'}_${index}`)
    }

    replenishBook(book, params.baseSize)
    snapshots.push(computeSnapshot(book))
  }

  return { events, snapshots }
}
