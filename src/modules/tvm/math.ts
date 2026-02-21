export function presentValue(fv: number, rate: number, periods: number): number {
  return fv / Math.pow(1 + rate, periods)
}

export function futureValue(pv: number, rate: number, periods: number): number {
  return pv * Math.pow(1 + rate, periods)
}

export function annuityPV(payment: number, rate: number, periods: number): number {
  if (rate === 0) return payment * periods
  return payment * (1 - Math.pow(1 + rate, -periods)) / rate
}

export function buildGrowthSeries(
  pv: number,
  rate: number,
  periods: number,
): { period: number; value: number }[] {
  const result = []
  for (let t = 0; t <= periods; t++) {
    result.push({ period: t, value: Math.round(futureValue(pv, rate, t) * 100) / 100 })
  }
  return result
}
