export interface AmortizationRow {
  period: number
  payment: number
  interest: number
  principal: number
  balance: number
}

export function periodicRate(apr: number, paymentsPerYear: number): number {
  return apr / paymentsPerYear
}

export function periodicPayment(
  principal: number,
  apr: number,
  years: number,
  paymentsPerYear: number,
): number {
  const n = years * paymentsPerYear
  const r = periodicRate(apr, paymentsPerYear)
  if (r === 0) return principal / n
  return principal * (r / (1 - Math.pow(1 + r, -n)))
}

export function amortizationSchedule(
  principal: number,
  apr: number,
  years: number,
  paymentsPerYear: number,
  extraPayment: number,
): AmortizationRow[] {
  const n = years * paymentsPerYear
  const r = periodicRate(apr, paymentsPerYear)
  const basePayment = periodicPayment(principal, apr, years, paymentsPerYear)
  const rows: AmortizationRow[] = []

  let balance = principal

  for (let period = 1; period <= n; period++) {
    if (balance <= 1e-8) break

    const interest = balance * r
    let principalPaid = basePayment - interest + extraPayment
    let payment = basePayment + extraPayment

    if (principalPaid > balance) {
      principalPaid = balance
      payment = interest + principalPaid
    }

    balance -= principalPaid

    rows.push({
      period,
      payment: Math.round(payment * 100) / 100,
      interest: Math.round(interest * 100) / 100,
      principal: Math.round(principalPaid * 100) / 100,
      balance: Math.max(0, Math.round(balance * 100) / 100),
    })
  }

  return rows
}
