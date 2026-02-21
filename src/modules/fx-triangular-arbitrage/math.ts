export interface Quote {
  pair: string
  bid: number
  ask: number
}

export interface TriangularInput {
  baseCurrency: string
  secondCurrency: string
  thirdCurrency: string
  quotes: Quote[]
  notional: number
  feeBpsPerLeg: number
  slippageBpsPerLeg: number
}

export interface PathResult {
  path: string
  grossReturnPct: number
  netReturnPct: number
  endingAmount: number
}

export interface TriangularResult {
  path1: PathResult
  path2: PathResult
  best: PathResult
}

function parsePair(pair: string): { base: string; quote: string } {
  const [base, quote] = pair.split('/')
  if (!base || !quote) {
    throw new Error(`Invalid pair: ${pair}`)
  }
  return { base, quote }
}

function findQuote(from: string, to: string, quotes: Quote[]): Quote | null {
  for (const quote of quotes) {
    const parsed = parsePair(quote.pair)
    if (
      (parsed.base === from && parsed.quote === to) ||
      (parsed.base === to && parsed.quote === from)
    ) {
      return quote
    }
  }
  return null
}

function convert(amount: number, from: string, to: string, quotes: Quote[]): number {
  const quote = findQuote(from, to, quotes)
  if (!quote) {
    throw new Error(`Missing quote for ${from}/${to}`)
  }

  const { base, quote: quoteCurrency } = parsePair(quote.pair)

  if (base === from && quoteCurrency === to) {
    if (quote.bid <= 0) throw new Error(`Invalid bid for ${quote.pair}`)
    return amount * quote.bid
  }

  if (base === to && quoteCurrency === from) {
    if (quote.ask <= 0) throw new Error(`Invalid ask for ${quote.pair}`)
    return amount / quote.ask
  }

  throw new Error(`Unsupported conversion for ${from} -> ${to}`)
}

function runPath(
  notional: number,
  currencies: [string, string, string, string],
  quotes: Quote[],
  feeBpsPerLeg: number,
  slippageBpsPerLeg: number,
): PathResult {
  let amount = notional
  const costMultiplier = 1 - (feeBpsPerLeg + slippageBpsPerLeg) / 10000

  for (let i = 0; i < 3; i++) {
    amount = convert(amount, currencies[i], currencies[i + 1], quotes)
    amount *= costMultiplier
  }

  const grossAmount =
    convert(
      convert(convert(notional, currencies[0], currencies[1], quotes), currencies[1], currencies[2], quotes),
      currencies[2],
      currencies[3],
      quotes,
    )

  return {
    path: `${currencies[0]} -> ${currencies[1]} -> ${currencies[2]} -> ${currencies[3]}`,
    grossReturnPct: ((grossAmount / notional) - 1) * 100,
    netReturnPct: ((amount / notional) - 1) * 100,
    endingAmount: amount,
  }
}

export function evaluateTriangularArbitrage(input: TriangularInput): TriangularResult {
  const path1 = runPath(
    input.notional,
    [input.baseCurrency, input.secondCurrency, input.thirdCurrency, input.baseCurrency],
    input.quotes,
    input.feeBpsPerLeg,
    input.slippageBpsPerLeg,
  )

  const path2 = runPath(
    input.notional,
    [input.baseCurrency, input.thirdCurrency, input.secondCurrency, input.baseCurrency],
    input.quotes,
    input.feeBpsPerLeg,
    input.slippageBpsPerLeg,
  )

  return {
    path1,
    path2,
    best: path1.netReturnPct >= path2.netReturnPct ? path1 : path2,
  }
}
