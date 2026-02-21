/** Price a fixed-coupon bond using discounted cash flows */
export function bondPrice(
  faceValue: number,
  couponRate: number,
  ytm: number,
  periods: number,
): number {
  const coupon = faceValue * couponRate
  let price = 0
  for (let t = 1; t <= periods; t++) {
    price += coupon / Math.pow(1 + ytm, t)
  }
  price += faceValue / Math.pow(1 + ytm, periods)
  return price
}

export function buildPriceVsYTMSeries(
  faceValue: number,
  couponRate: number,
  periods: number,
  minYTM: number,
  maxYTM: number,
  steps: number,
): { ytm: number; price: number }[] {
  const result = []
  const step = (maxYTM - minYTM) / steps
  for (let ytm = minYTM; ytm <= maxYTM + 0.0001; ytm += step) {
    result.push({
      ytm: Math.round(ytm * 1000) / 10, // as percentage, 1dp
      price: Math.round(bondPrice(faceValue, couponRate, ytm, periods) * 100) / 100,
    })
  }
  return result
}
