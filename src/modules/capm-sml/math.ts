export function capmReturn(beta: number, rf: number, marketReturn: number): number {
  return rf + beta * (marketReturn - rf)
}

export function alpha(
  actualReturn: number,
  beta: number,
  rf: number,
  marketReturn: number,
): number {
  return actualReturn - capmReturn(beta, rf, marketReturn)
}

export function buildSmlSeries(
  rf: number,
  marketReturn: number,
  minBeta: number,
  maxBeta: number,
  steps: number,
): Array<{ beta: number; expected: number }> {
  const rows = []
  const step = (maxBeta - minBeta) / steps
  for (let i = 0; i <= steps; i++) {
    const beta = minBeta + i * step
    rows.push({
      beta: Math.round(beta * 100) / 100,
      expected: Math.round(capmReturn(beta, rf, marketReturn) * 10000) / 100,
    })
  }
  return rows
}
