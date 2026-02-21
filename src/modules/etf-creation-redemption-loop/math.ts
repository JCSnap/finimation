export interface EtfState {
  nav: number
  etfPrice: number
  cumulativeProfit: number
}

export interface EtfParams {
  thresholdBps: number
  creationFeeBps: number
  redemptionFeeBps: number
  transactionCostBps: number
  slippageBps: number
  liquidity: number
}

export interface StepResult {
  action: 'creation' | 'redemption' | 'none'
  before: {
    premiumPct: number
  }
  next: EtfState & {
    premiumPct: number
  }
  netBps: number
}

export const defaultEtfState: EtfState = {
  nav: 100,
  etfPrice: 100,
  cumulativeProfit: 0,
}

export const defaultEtfParams: EtfParams = {
  thresholdBps: 5,
  creationFeeBps: 2,
  redemptionFeeBps: 2,
  transactionCostBps: 1,
  slippageBps: 1,
  liquidity: 0.35,
}

function premiumPct(nav: number, etfPrice: number): number {
  return (etfPrice - nav) / nav
}

export function stepEtfArbitrage(state: EtfState, params: EtfParams): StepResult {
  const beforePremiumPct = premiumPct(state.nav, state.etfPrice)
  const beforePremiumBps = beforePremiumPct * 10000

  let action: StepResult['action'] = 'none'
  let costBps = 0

  if (beforePremiumBps > params.thresholdBps) {
    action = 'creation'
    costBps = params.creationFeeBps + params.transactionCostBps + params.slippageBps
  } else if (beforePremiumBps < -params.thresholdBps) {
    action = 'redemption'
    costBps = params.redemptionFeeBps + params.transactionCostBps + params.slippageBps
  }

  const grossBps = Math.abs(beforePremiumBps)
  const netBps = action === 'none' ? 0 : grossBps - costBps

  if (action !== 'none' && netBps <= 0) {
    action = 'none'
  }

  let nextNav = state.nav
  let nextEtfPrice = state.etfPrice
  let cumulativeProfit = state.cumulativeProfit

  if (action === 'creation') {
    const gap = state.etfPrice - state.nav
    nextEtfPrice = state.etfPrice - gap * params.liquidity
    nextNav = state.nav + gap * params.liquidity * 0.05
    cumulativeProfit += (netBps / 10000) * state.nav
  } else if (action === 'redemption') {
    const gap = state.nav - state.etfPrice
    nextEtfPrice = state.etfPrice + gap * params.liquidity
    nextNav = state.nav - gap * params.liquidity * 0.05
    cumulativeProfit += (netBps / 10000) * state.nav
  } else {
    const gap = state.etfPrice - state.nav
    nextEtfPrice = state.etfPrice - gap * 0.1
    nextNav = state.nav + gap * 0.01
  }

  const next: EtfState & { premiumPct: number } = {
    nav: nextNav,
    etfPrice: nextEtfPrice,
    cumulativeProfit,
    premiumPct: premiumPct(nextNav, nextEtfPrice),
  }

  return {
    action,
    before: {
      premiumPct: beforePremiumPct,
    },
    next,
    netBps,
  }
}
