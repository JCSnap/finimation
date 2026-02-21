export function twoAssetStats(
  ret1: number,
  risk1: number,
  ret2: number,
  risk2: number,
  correlation: number,
  w1: number,
): { ret: number; risk: number } {
  const w2 = 1 - w1
  const ret = w1 * ret1 + w2 * ret2
  const variance =
    w1 * w1 * risk1 * risk1 +
    w2 * w2 * risk2 * risk2 +
    2 * w1 * w2 * correlation * risk1 * risk2

  return { ret, risk: Math.sqrt(Math.max(variance, 0)) }
}

export function tangencyWeights(
  ret1: number,
  risk1: number,
  ret2: number,
  risk2: number,
  correlation: number,
  rf: number,
): { w1: number; w2: number } {
  const cov = correlation * risk1 * risk2
  const var1 = risk1 * risk1
  const var2 = risk2 * risk2
  const ex1 = ret1 - rf
  const ex2 = ret2 - rf
  const det = var1 * var2 - cov * cov

  if (Math.abs(det) < 1e-10) {
    return { w1: 0.5, w2: 0.5 }
  }

  const a = (var2 * ex1 - cov * ex2) / det
  const b = (var1 * ex2 - cov * ex1) / det
  const scale = a + b

  if (Math.abs(scale) < 1e-10) {
    return { w1: 0.5, w2: 0.5 }
  }

  return { w1: a / scale, w2: b / scale }
}

export function buildRiskyFrontier(
  ret1: number,
  risk1: number,
  ret2: number,
  risk2: number,
  correlation: number,
  steps: number,
): Array<{ risk: number; ret: number; w1: number }> {
  const rows = []
  for (let i = 0; i <= steps; i++) {
    const w1 = i / steps
    const stats = twoAssetStats(ret1, risk1, ret2, risk2, correlation, w1)
    rows.push({
      risk: Math.round(stats.risk * 10000) / 100,
      ret: Math.round(stats.ret * 10000) / 100,
      w1: Math.round(w1 * 10000) / 100,
    })
  }
  return rows
}

export function buildCalSeries(
  rf: number,
  tangencyRisk: number,
  tangencyReturn: number,
  minAllocation: number,
  maxAllocation: number,
  steps: number,
): Array<{ allocation: number; risk: number; ret: number }> {
  const rows = [{ allocation: 0, risk: 0, ret: rf * 100 }]
  const step = (maxAllocation - minAllocation) / steps

  for (let i = 0; i <= steps; i++) {
    const y = minAllocation + i * step
    if (Math.abs(y) < 1e-8) continue
    rows.push({
      allocation: Math.round(y * 10000) / 100,
      risk: Math.round(Math.abs(y) * tangencyRisk * 10000) / 100,
      ret: Math.round((rf + y * (tangencyReturn - rf)) * 10000) / 100,
    })
  }

  return rows
}
