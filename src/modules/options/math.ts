export function callPayoff(spotPrice: number, strikePrice: number, premium: number): number {
  return Math.max(spotPrice - strikePrice, 0) - premium
}

export function putPayoff(spotPrice: number, strikePrice: number, premium: number): number {
  return Math.max(strikePrice - spotPrice, 0) - premium
}

export function buildPayoffSeries(
  type: 'call' | 'put',
  strikePrice: number,
  premium: number,
  minPrice: number,
  maxPrice: number,
  steps: number,
): { price: number; payoff: number }[] {
  const fn = type === 'call' ? callPayoff : putPayoff
  const result = []
  const step = (maxPrice - minPrice) / steps
  for (let price = minPrice; price <= maxPrice + 0.001; price += step) {
    result.push({ price: Math.round(price * 100) / 100, payoff: fn(price, strikePrice, premium) })
  }
  return result
}
