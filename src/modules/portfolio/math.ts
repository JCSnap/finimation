/** Portfolio return and risk for 2-asset portfolio */
export function portfolioStats(
  ret1: number, risk1: number,
  ret2: number, risk2: number,
  correlation: number,
  weight1: number,
): { ret: number; risk: number } {
  const w2 = 1 - weight1
  const ret = weight1 * ret1 + w2 * ret2
  const variance =
    weight1 ** 2 * risk1 ** 2 +
    w2 ** 2 * risk2 ** 2 +
    2 * weight1 * w2 * correlation * risk1 * risk2
  return { ret, risk: Math.sqrt(variance) }
}

export function buildFrontier(
  ret1: number, risk1: number,
  ret2: number, risk2: number,
  correlation: number,
  steps: number,
): { risk: number; ret: number; weight1: number }[] {
  const result = []
  for (let i = 0; i <= steps; i++) {
    const weight1 = i / steps
    const { ret, risk } = portfolioStats(ret1, risk1, ret2, risk2, correlation, weight1)
    result.push({
      risk: Math.round(risk * 10000) / 100, // as %
      ret: Math.round(ret * 10000) / 100,   // as %
      weight1: Math.round(weight1 * 100),
    })
  }
  return result
}
