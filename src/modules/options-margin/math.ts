import { blackScholesPrice, type OptionType } from '../option-greeks/math'

const TRADING_DAYS = 252

export interface MarginSimulationInput {
  type: OptionType
  strike: number
  premium: number
  initialSpot: number
  days: number
  rate: number
  vol: number
  drift: number
  contracts: number
  lotSize: number
  initialMargin: number
  maintenanceMargin: number
  seed: number
}

export interface MarginSimulationRow {
  day: number
  spot: number
  optionMark: number
  dailyTransfer: number
  balance: number
  topUp: number
  cumulativeTopUps: number
}

export interface MarginSimulationResult {
  rows: MarginSimulationRow[]
  marginCalls: number
  totalTopUps: number
  totalTransfers: number
  finalBalance: number
}

export interface MarginPlaybackSnapshot {
  day: number
  dailyTransfer: number
  cumulativeTransfer: number
  balance: number
  topUp: number
  cumulativeTopUps: number
  marginCallToday: boolean
}

function lcg(seed: number): () => number {
  let state = (seed >>> 0) || 1
  return () => {
    state = (1664525 * state + 1013904223) >>> 0
    return state / 0x100000000
  }
}

function normalSample(rand: () => number): number {
  const u1 = Math.max(rand(), 1e-12)
  const u2 = Math.max(rand(), 1e-12)
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
}

function nextSpot(spot: number, drift: number, vol: number, dt: number, z: number): number {
  if (vol === 0) {
    return spot * Math.exp(drift * dt)
  }
  return spot * Math.exp((drift - 0.5 * vol * vol) * dt + vol * Math.sqrt(dt) * z)
}

function timeLeft(day: number, totalDays: number): number {
  if (day >= totalDays) return 0
  return Math.max((totalDays - day) / TRADING_DAYS, 1 / TRADING_DAYS)
}

export function simulateDailyOptionMargin(input: MarginSimulationInput): MarginSimulationResult {
  const {
    type,
    strike,
    premium,
    initialSpot,
    days,
    rate,
    vol,
    drift,
    contracts,
    lotSize,
    initialMargin,
    maintenanceMargin,
    seed,
  } = input

  const quantity = contracts * lotSize
  const dt = 1 / TRADING_DAYS
  const rand = lcg(seed)

  const rows: MarginSimulationRow[] = []

  let spot = initialSpot
  let mark = blackScholesPrice(type, spot, strike, rate, vol, timeLeft(0, days)) * quantity
  let balance = initialMargin + premium * quantity
  let cumulativeTopUps = 0
  let marginCalls = 0
  let totalTransfers = 0

  rows.push({
    day: 0,
    spot: Math.round(spot * 100) / 100,
    optionMark: Math.round(mark * 100) / 100,
    dailyTransfer: 0,
    balance: Math.round(balance * 100) / 100,
    topUp: 0,
    cumulativeTopUps: 0,
  })

  for (let day = 1; day <= days; day++) {
    const z = normalSample(rand)
    spot = nextSpot(spot, drift, vol, dt, z)
    const newMark = blackScholesPrice(type, spot, strike, rate, vol, timeLeft(day, days)) * quantity

    const dailyTransfer = mark - newMark
    totalTransfers += dailyTransfer
    balance += dailyTransfer

    let topUp = 0
    if (balance < maintenanceMargin) {
      topUp = initialMargin - balance
      balance = initialMargin
      cumulativeTopUps += topUp
      marginCalls += 1
    }

    rows.push({
      day,
      spot: Math.round(spot * 100) / 100,
      optionMark: Math.round(newMark * 100) / 100,
      dailyTransfer: Math.round(dailyTransfer * 100) / 100,
      balance: Math.round(balance * 100) / 100,
      topUp: Math.round(topUp * 100) / 100,
      cumulativeTopUps: Math.round(cumulativeTopUps * 100) / 100,
    })

    mark = newMark
  }

  return {
    rows,
    marginCalls,
    totalTopUps: Math.round(cumulativeTopUps * 100) / 100,
    totalTransfers: Math.round(totalTransfers * 100) / 100,
    finalBalance: Math.round(balance * 100) / 100,
  }
}

export function buildPlaybackSnapshot(rows: MarginSimulationRow[], requestedDay: number): MarginPlaybackSnapshot {
  const maxDay = Math.max(0, rows.length - 1)
  const day = Math.min(Math.max(Math.floor(requestedDay), 0), maxDay)
  const row = rows[day] ?? rows[0]

  const cumulativeTransfer = rows
    .slice(1, day + 1)
    .reduce((sum, current) => sum + current.dailyTransfer, 0)

  return {
    day,
    dailyTransfer: row?.dailyTransfer ?? 0,
    cumulativeTransfer: Math.round(cumulativeTransfer * 100) / 100,
    balance: row?.balance ?? 0,
    topUp: row?.topUp ?? 0,
    cumulativeTopUps: row?.cumulativeTopUps ?? 0,
    marginCallToday: (row?.topUp ?? 0) > 0,
  }
}
