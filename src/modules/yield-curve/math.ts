export interface RatePoint {
  tenor: number
  rate: number
}

export function buildInterpolatedCurve(points: RatePoint[], step = 1): RatePoint[] {
  const sorted = [...points].sort((a, b) => a.tenor - b.tenor)
  if (sorted.length <= 1) return sorted

  const out: RatePoint[] = []

  for (let i = 0; i < sorted.length - 1; i++) {
    const left = sorted[i]
    const right = sorted[i + 1]
    const span = right.tenor - left.tenor
    if (span <= 0) continue

    const steps = Math.max(1, Math.round(span / step))
    for (let j = 0; j < steps; j++) {
      const tenor = left.tenor + (span * j) / steps
      const t = (tenor - left.tenor) / span
      const rate = left.rate + (right.rate - left.rate) * t
      out.push({ tenor: Math.round(tenor * 100) / 100, rate })
    }
  }

  out.push(sorted[sorted.length - 1])
  return out
}

export function discountFactor(rate: number, tenor: number): number {
  return 1 / Math.pow(1 + rate, tenor)
}

export function zeroCouponPrice(faceValue: number, rate: number, tenor: number): number {
  return faceValue * discountFactor(rate, tenor)
}

export function buildZeroPriceSeries(
  points: RatePoint[],
  faceValue: number,
  maxTenor: number,
): Array<{ tenor: number; rate: number; price: number }> {
  return buildInterpolatedCurve(points, 1)
    .filter((p) => p.tenor <= maxTenor)
    .map((p) => ({
      tenor: p.tenor,
      rate: p.rate,
      price: Math.round(zeroCouponPrice(faceValue, p.rate, p.tenor) * 100) / 100,
    }))
}
