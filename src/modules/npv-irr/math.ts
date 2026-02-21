export function npv(cashFlows: number[], rate: number): number {
  return cashFlows.reduce((sum, cashFlow, t) => sum + cashFlow / Math.pow(1 + rate, t), 0)
}

export function irr(
  cashFlows: number[],
  low = -0.99,
  high = 1,
  tolerance = 1e-7,
  maxIterations = 200,
): number | null {
  let left = low
  let right = high
  let fLeft = npv(cashFlows, left)
  let fRight = npv(cashFlows, right)

  let expand = 0
  while (fLeft * fRight > 0 && expand < 25) {
    right *= 1.6
    fRight = npv(cashFlows, right)
    expand++
  }

  if (fLeft * fRight > 0) return null

  for (let i = 0; i < maxIterations; i++) {
    const mid = (left + right) / 2
    const fMid = npv(cashFlows, mid)

    if (Math.abs(fMid) < tolerance) return mid

    if (fLeft * fMid <= 0) {
      right = mid
      fRight = fMid
    } else {
      left = mid
      fLeft = fMid
    }

    if (Math.abs(right - left) < tolerance) {
      return (left + right) / 2
    }
  }

  return (left + right) / 2
}

export function buildNpvProfile(
  cashFlows: number[],
  minRate: number,
  maxRate: number,
  steps: number,
): Array<{ rate: number; npv: number }> {
  const rows = []
  const step = (maxRate - minRate) / steps
  for (let i = 0; i <= steps; i++) {
    const rate = minRate + i * step
    rows.push({
      rate: Math.round(rate * 10000) / 100,
      npv: Math.round(npv(cashFlows, rate) * 100) / 100,
    })
  }
  return rows
}
