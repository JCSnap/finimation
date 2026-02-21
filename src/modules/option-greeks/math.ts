import { normalCdf, normalPdf } from '../../lib/quant'

export type OptionType = 'call' | 'put'

function d1d2(spot: number, strike: number, rate: number, vol: number, time: number) {
  const safeVol = Math.max(vol, 1e-6)
  const safeTime = Math.max(time, 1e-6)
  const rootT = Math.sqrt(safeTime)
  const d1 = (Math.log(spot / strike) + (rate + 0.5 * safeVol * safeVol) * safeTime) / (safeVol * rootT)
  const d2 = d1 - safeVol * rootT
  return { d1, d2, safeVol, safeTime, rootT }
}

export function blackScholesPrice(
  type: OptionType,
  spot: number,
  strike: number,
  rate: number,
  vol: number,
  time: number,
): number {
  if (time <= 0) {
    return type === 'call' ? Math.max(spot - strike, 0) : Math.max(strike - spot, 0)
  }

  const { d1, d2 } = d1d2(spot, strike, rate, vol, time)
  const disc = Math.exp(-rate * time)

  if (type === 'call') {
    return spot * normalCdf(d1) - strike * disc * normalCdf(d2)
  }
  return strike * disc * normalCdf(-d2) - spot * normalCdf(-d1)
}

export function greeks(
  type: OptionType,
  spot: number,
  strike: number,
  rate: number,
  vol: number,
  time: number,
): { delta: number; gamma: number; theta: number; vega: number; price: number } {
  const { d1, d2, safeVol, safeTime, rootT } = d1d2(spot, strike, rate, vol, time)
  const disc = Math.exp(-rate * safeTime)
  const delta = type === 'call' ? normalCdf(d1) : normalCdf(d1) - 1
  const gamma = normalPdf(d1) / (spot * safeVol * rootT)
  const vega = spot * normalPdf(d1) * rootT
  const thetaCore = -(spot * normalPdf(d1) * safeVol) / (2 * rootT)
  const theta = type === 'call'
    ? thetaCore - rate * strike * disc * normalCdf(d2)
    : thetaCore + rate * strike * disc * normalCdf(-d2)

  return {
    delta,
    gamma,
    theta,
    vega,
    price: blackScholesPrice(type, spot, strike, rate, vol, safeTime),
  }
}

export function buildGreeksSeries(
  type: OptionType,
  strike: number,
  rate: number,
  vol: number,
  time: number,
  minSpot: number,
  maxSpot: number,
  steps: number,
): Array<{ spot: number; delta: number; gamma: number; theta: number; vega: number; price: number }> {
  const rows = []
  const step = (maxSpot - minSpot) / steps
  for (let i = 0; i <= steps; i++) {
    const s = minSpot + i * step
    const g = greeks(type, s, strike, rate, vol, time)
    rows.push({
      spot: Math.round(s * 100) / 100,
      delta: Math.round(g.delta * 10000) / 10000,
      gamma: Math.round(g.gamma * 100000) / 100000,
      theta: Math.round(g.theta * 1000) / 1000,
      vega: Math.round(g.vega * 1000) / 1000,
      price: Math.round(g.price * 1000) / 1000,
    })
  }
  return rows
}
