export interface DilutionRoundInput {
  label: string
  investment: number
}

export interface DilutionScenarioInput {
  exitMetric: number
  exitMultiple: number
  yearsToExit: number
  targetIrr: number
  founderShares: number
  rounds: DilutionRoundInput[]
  esopPctAfterRound: number[]
}

export interface DilutionRoundResult {
  label: string
  newSharesIssued: number
  pricePerShare: number
  preMoney: number
  postMoney: number
  ownershipPct: Record<string, number>
}

export interface DilutionScenarioResult {
  exitValue: number
  pvAtTarget: number
  requiredOwnershipFirstRound: number
  rounds: DilutionRoundResult[]
}

function round2(value: number): number {
  return Math.round(value * 100) / 100
}

function totalShares(table: Record<string, number>): number {
  return Object.values(table).reduce((sum, shares) => sum + shares, 0)
}

function ownershipFromShares(table: Record<string, number>): Record<string, number> {
  const total = totalShares(table)
  const out: Record<string, number> = {}
  Object.entries(table).forEach(([key, shares]) => {
    out[key] = (shares / total) * 100
  })
  return out
}

export function requiredOwnership(
  exitValue: number,
  investment: number,
  targetIrr: number,
  yearsToExit: number,
): number {
  const pv = exitValue / Math.pow(1 + targetIrr, yearsToExit)
  return Math.max(0, Math.min(0.9999, investment / pv))
}

function applyEsopTopUp(
  capTable: Record<string, number>,
  targetEsopPct: number,
): void {
  if (targetEsopPct <= 0) return

  const target = targetEsopPct / 100
  const currentEsop = capTable.ESOP ?? 0
  const currentTotal = totalShares(capTable)

  const requiredEsop = (target * currentTotal - currentEsop) / (1 - target)
  if (requiredEsop > 0) {
    capTable.ESOP = currentEsop + requiredEsop
  }
}

export function buildDilutionScenario(input: DilutionScenarioInput): DilutionScenarioResult {
  const {
    exitMetric,
    exitMultiple,
    yearsToExit,
    targetIrr,
    founderShares,
    rounds,
    esopPctAfterRound,
  } = input

  const exitValue = exitMetric * exitMultiple
  const pvAtTarget = exitValue / Math.pow(1 + targetIrr, yearsToExit)

  const capTable: Record<string, number> = {
    Founder: founderShares,
  }

  const roundResults: DilutionRoundResult[] = []

  rounds.forEach((round, idx) => {
    const existingShares = totalShares(capTable)
    const preMoney = pvAtTarget
    const pricePerShare = preMoney / existingShares

    const newSharesIssued = round.investment / pricePerShare
    capTable[round.label] = (capTable[round.label] ?? 0) + newSharesIssued

    const postMoney = preMoney + round.investment

    applyEsopTopUp(capTable, esopPctAfterRound[idx] ?? 0)

    roundResults.push({
      label: round.label,
      newSharesIssued: round2(newSharesIssued),
      pricePerShare,
      preMoney,
      postMoney,
      ownershipPct: ownershipFromShares(capTable),
    })
  })

  return {
    exitValue,
    pvAtTarget,
    requiredOwnershipFirstRound: rounds[0]
      ? requiredOwnership(exitValue, rounds[0].investment, targetIrr, yearsToExit) * 100
      : 0,
    rounds: roundResults,
  }
}
