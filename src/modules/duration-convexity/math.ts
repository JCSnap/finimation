import { bondPrice } from '../bonds/math'

export function macaulayDuration(
  faceValue: number,
  couponRate: number,
  ytm: number,
  periods: number,
): number {
  const price = bondPrice(faceValue, couponRate, ytm, periods)
  const coupon = faceValue * couponRate
  let weighted = 0

  for (let t = 1; t <= periods; t++) {
    const cashFlow = t === periods ? coupon + faceValue : coupon
    const pv = cashFlow / Math.pow(1 + ytm, t)
    weighted += t * pv
  }

  return weighted / price
}

export function modifiedDuration(
  faceValue: number,
  couponRate: number,
  ytm: number,
  periods: number,
): number {
  return macaulayDuration(faceValue, couponRate, ytm, periods) / (1 + ytm)
}

export function convexity(
  faceValue: number,
  couponRate: number,
  ytm: number,
  periods: number,
): number {
  const price = bondPrice(faceValue, couponRate, ytm, periods)
  const coupon = faceValue * couponRate
  let sum = 0

  for (let t = 1; t <= periods; t++) {
    const cashFlow = t === periods ? coupon + faceValue : coupon
    sum += (cashFlow * t * (t + 1)) / Math.pow(1 + ytm, t + 2)
  }

  return sum / price
}

export function buildShockSeries(
  faceValue: number,
  couponRate: number,
  ytm: number,
  periods: number,
  minShock: number,
  maxShock: number,
  steps: number,
): Array<{ shock: number; exact: number; durationApprox: number; durConvApprox: number }> {
  const price0 = bondPrice(faceValue, couponRate, ytm, periods)
  const modDur = modifiedDuration(faceValue, couponRate, ytm, periods)
  const conv = convexity(faceValue, couponRate, ytm, periods)

  const rows = []
  const step = (maxShock - minShock) / steps
  for (let i = 0; i <= steps; i++) {
    const shock = minShock + i * step
    const shockedYtm = Math.max(0.0001, ytm + shock)
    const exact = bondPrice(faceValue, couponRate, shockedYtm, periods)
    const durationApprox = price0 * (1 - modDur * shock)
    const durConvApprox = price0 * (1 - modDur * shock + 0.5 * conv * shock * shock)

    rows.push({
      shock: Math.round(shock * 10000) / 100,
      exact: Math.round(exact * 100) / 100,
      durationApprox: Math.round(durationApprox * 100) / 100,
      durConvApprox: Math.round(durConvApprox * 100) / 100,
    })
  }

  return rows
}
