export interface LinkageInput {
  openingRevenue: number
  openingCash: number
  openingDebt: number
  openingPPE: number
  openingRetainedEarnings: number
  growthRate: number
  grossMargin: number
  sgaRate: number
  daRate: number
  capexRate: number
  dso: number
  dio: number
  dpo: number
  taxRate: number
  interestRate: number
  minCash: number
  horizon: number
}

export interface StatementRow {
  year: number
  revenue: number
  netIncome: number
  cash: number
  debt: number
  equity: number
  assets: number
  cfo: number
  cfi: number
  cff: number
}

export const defaultLinkageInput: LinkageInput = {
  openingRevenue: 1_000,
  openingCash: 120,
  openingDebt: 220,
  openingPPE: 480,
  openingRetainedEarnings: 260,
  growthRate: 0.08,
  grossMargin: 0.45,
  sgaRate: 0.2,
  daRate: 0.08,
  capexRate: 0.09,
  dso: 45,
  dio: 50,
  dpo: 35,
  taxRate: 0.25,
  interestRate: 0.06,
  minCash: 100,
  horizon: 5,
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function computeNwc(revenue: number, cogs: number, dso: number, dio: number, dpo: number): number {
  const safeRevenue = Math.max(1e-9, revenue)
  const safeCogs = Math.max(1e-9, cogs)
  const ar = (safeRevenue * dso) / 365
  const inventory = (safeCogs * dio) / 365
  const ap = (safeCogs * dpo) / 365
  return ar + inventory - ap
}

export function projectStatements(input: LinkageInput): StatementRow[] {
  const growthRate = clamp(input.growthRate, -0.5, 1)
  const grossMargin = clamp(input.grossMargin, 0.05, 0.95)
  const sgaRate = clamp(input.sgaRate, 0, 0.9)
  const daRate = clamp(input.daRate, 0, 0.5)
  const capexRate = clamp(input.capexRate, 0, 0.8)
  const taxRate = clamp(input.taxRate, 0, 0.5)
  const interestRate = clamp(input.interestRate, 0, 0.4)

  const openingCogs = input.openingRevenue * (1 - grossMargin)
  const openingNwc = computeNwc(input.openingRevenue, openingCogs, input.dso, input.dio, input.dpo)
  const shareCapital =
    input.openingCash + openingNwc + input.openingPPE - input.openingDebt - input.openingRetainedEarnings

  let prevRevenue = input.openingRevenue
  let prevCash = input.openingCash
  let prevDebt = Math.max(0, input.openingDebt)
  let prevPPE = Math.max(0, input.openingPPE)
  let prevNwc = openingNwc
  let retained = input.openingRetainedEarnings

  const rows: StatementRow[] = []

  for (let year = 1; year <= input.horizon; year++) {
    const revenue = prevRevenue * (1 + growthRate)
    const cogs = revenue * (1 - grossMargin)
    const sga = revenue * sgaRate
    const da = prevPPE * daRate
    const ebit = revenue - cogs - sga - da
    const interest = prevDebt * interestRate
    const ebt = ebit - interest
    const tax = Math.max(0, ebt * taxRate)
    const netIncome = ebt - tax

    const nwc = computeNwc(revenue, cogs, input.dso, input.dio, input.dpo)
    const deltaNwc = nwc - prevNwc

    const cfo = netIncome + da - deltaNwc
    const capex = revenue * capexRate
    const cfi = -capex

    const cashBeforeFinancing = prevCash + cfo + cfi

    let debtChange = 0
    if (cashBeforeFinancing < input.minCash) {
      debtChange = input.minCash - cashBeforeFinancing
    } else if (cashBeforeFinancing > input.minCash && prevDebt > 0) {
      debtChange = -Math.min(prevDebt, cashBeforeFinancing - input.minCash)
    }

    const debt = Math.max(0, prevDebt + debtChange)
    const cff = debtChange
    const cash = cashBeforeFinancing + cff

    const ppe = Math.max(0, prevPPE + capex - da)
    retained += netIncome
    const equity = shareCapital + retained

    const assets = cash + nwc + ppe

    rows.push({
      year,
      revenue,
      netIncome,
      cash,
      debt,
      equity,
      assets,
      cfo,
      cfi,
      cff,
    })

    prevRevenue = revenue
    prevCash = cash
    prevDebt = debt
    prevPPE = ppe
    prevNwc = nwc
  }

  return rows
}
