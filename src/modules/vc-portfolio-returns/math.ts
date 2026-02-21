export interface PortfolioInput {
  fundSize: number
  years: number
  homeRunPct: number
  livingDeadPct: number
  lossPct: number
  homeRunMultiple: number
  livingDeadMultiple: number
  managementFeePctPerYear: number
  carryPct: number
}

export interface PortfolioOutcome {
  grossTerminalValue: number
  grossMoic: number
  grossIrr: number
  netTerminalValue: number
  netMoic: number
  netIrr: number
  feePaid: number
  carryPaid: number
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value))
}

export function computePortfolioOutcome(input: PortfolioInput): PortfolioOutcome {
  const {
    fundSize,
    years,
    homeRunPct,
    livingDeadPct,
    lossPct,
    homeRunMultiple,
    livingDeadMultiple,
    managementFeePctPerYear,
    carryPct,
  } = input

  const h = clamp01(homeRunPct)
  const l = clamp01(livingDeadPct)
  const loss = clamp01(lossPct)
  const totalPct = h + l + loss
  const scale = totalPct > 0 ? 1 / totalPct : 0

  const homeCapital = fundSize * h * scale
  const livingCapital = fundSize * l * scale
  const lossCapital = fundSize * loss * scale

  const grossTerminalValue =
    homeCapital * homeRunMultiple +
    livingCapital * livingDeadMultiple +
    lossCapital * 0

  const grossMoic = grossTerminalValue / fundSize
  const grossIrr = Math.pow(Math.max(grossMoic, 1e-9), 1 / years) - 1

  const feePaid = fundSize * managementFeePctPerYear * years
  const profitAfterFee = Math.max(grossTerminalValue - fundSize - feePaid, 0)
  const carryPaid = profitAfterFee * carryPct
  const netTerminalValue = Math.max(grossTerminalValue - feePaid - carryPaid, 0)

  const netMoic = netTerminalValue / fundSize
  const netIrr = Math.pow(Math.max(netMoic, 1e-9), 1 / years) - 1

  return {
    grossTerminalValue,
    grossMoic,
    grossIrr,
    netTerminalValue,
    netMoic,
    netIrr,
    feePaid,
    carryPaid,
  }
}

export function requiredHomeRunMultiple(input: {
  years: number
  targetIrr: number
  homeRunPct: number
  livingDeadPct: number
  lossPct: number
  livingDeadMultiple: number
}): number {
  const {
    years,
    targetIrr,
    homeRunPct,
    livingDeadPct,
    lossPct,
    livingDeadMultiple,
  } = input

  const h = clamp01(homeRunPct)
  const l = clamp01(livingDeadPct)
  const loss = clamp01(lossPct)
  const totalPct = h + l + loss

  if (h <= 0 || totalPct <= 0) return Infinity

  const scale = 1 / totalPct
  const hs = h * scale
  const ls = l * scale

  const targetMoic = Math.pow(1 + targetIrr, years)
  return (targetMoic - ls * livingDeadMultiple) / hs
}
