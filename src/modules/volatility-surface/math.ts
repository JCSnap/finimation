import { clamp } from '../../lib/quant'

export function smileIV(
  strike: number,
  baseStrike: number,
  maturity: number,
  atmVol: number,
  skew: number,
  curvature: number,
  termSlope: number,
): number {
  const moneyness = strike / baseStrike - 1
  const term = termSlope * maturity
  const iv = atmVol + skew * moneyness + curvature * moneyness * moneyness + term
  return clamp(iv, 0.01, 2)
}

export function buildSmileSeries(
  baseStrike: number,
  maturity: number,
  atmVol: number,
  skew: number,
  curvature: number,
  termSlope: number,
  minStrike: number,
  maxStrike: number,
  steps: number,
): Array<{ strike: number; iv: number; ivPct: number }> {
  const rows = []
  const step = (maxStrike - minStrike) / steps
  for (let i = 0; i <= steps; i++) {
    const strike = minStrike + i * step
    const iv = smileIV(strike, baseStrike, maturity, atmVol, skew, curvature, termSlope)
    rows.push({
      strike: Math.round(strike * 100) / 100,
      iv,
      ivPct: Math.round(iv * 10000) / 100,
    })
  }
  return rows
}

export function buildSurfaceGrid(
  baseStrike: number,
  maturities: number[],
  strikes: number[],
  atmVol: number,
  skew: number,
  curvature: number,
  termSlope: number,
): Array<{ maturity: number; strike: number; iv: number; ivPct: number }> {
  const rows = []
  for (const maturity of maturities) {
    for (const strike of strikes) {
      const iv = smileIV(strike, baseStrike, maturity, atmVol, skew, curvature, termSlope)
      rows.push({ maturity, strike, iv, ivPct: Math.round(iv * 10000) / 100 })
    }
  }
  return rows
}
