import type { FinanceModule } from './types/module'
import { meta as optionsMeta } from './modules/options/meta'
import OptionsPayoff from './modules/options/index'
import optionsNotes from './modules/options/notes.md?raw'
import { meta as greeksMeta } from './modules/option-greeks/meta'
import OptionGreeksExplorer from './modules/option-greeks/index'
import greeksNotes from './modules/option-greeks/notes.md?raw'
import { meta as volSurfaceMeta } from './modules/volatility-surface/meta'
import VolatilitySurface from './modules/volatility-surface/index'
import volSurfaceNotes from './modules/volatility-surface/notes.md?raw'
import { meta as optionsMarginMeta } from './modules/options-margin/meta'
import OptionsDailyMargin from './modules/options-margin/index'
import optionsMarginNotes from './modules/options-margin/notes.md?raw'

import { meta as bondsMeta } from './modules/bonds/meta'
import BondPricing from './modules/bonds/index'
import bondsNotes from './modules/bonds/notes.md?raw'
import { meta as durationConvexityMeta } from './modules/duration-convexity/meta'
import DurationConvexityLab from './modules/duration-convexity/index'
import durationConvexityNotes from './modules/duration-convexity/notes.md?raw'
import { meta as yieldCurveMeta } from './modules/yield-curve/meta'
import YieldCurveBuilder from './modules/yield-curve/index'
import yieldCurveNotes from './modules/yield-curve/notes.md?raw'

import { meta as portfolioMeta } from './modules/portfolio/meta'
import EfficientFrontier from './modules/portfolio/index'
import portfolioNotes from './modules/portfolio/notes.md?raw'
import { meta as calTangencyMeta } from './modules/cal-tangency/meta'
import CalTangencyPortfolio from './modules/cal-tangency/index'
import calTangencyNotes from './modules/cal-tangency/notes.md?raw'
import { meta as capmMeta } from './modules/capm-sml/meta'
import CapmSml from './modules/capm-sml/index'
import capmNotes from './modules/capm-sml/notes.md?raw'

import { meta as tvmMeta } from './modules/tvm/meta'
import TVM from './modules/tvm/index'
import tvmNotes from './modules/tvm/notes.md?raw'
import { meta as npvIrrMeta } from './modules/npv-irr/meta'
import NpvIrrAnalyzer from './modules/npv-irr/index'
import npvIrrNotes from './modules/npv-irr/notes.md?raw'
import { meta as loanAmortizationMeta } from './modules/loan-amortization/meta'
import LoanAmortizationStudio from './modules/loan-amortization/index'
import loanAmortizationNotes from './modules/loan-amortization/notes.md?raw'

export const registry: FinanceModule[] = [
  { meta: optionsMeta, component: OptionsPayoff, notes: optionsNotes },
  { meta: greeksMeta, component: OptionGreeksExplorer, notes: greeksNotes },
  { meta: volSurfaceMeta, component: VolatilitySurface, notes: volSurfaceNotes },
  { meta: optionsMarginMeta, component: OptionsDailyMargin, notes: optionsMarginNotes },
  { meta: bondsMeta, component: BondPricing, notes: bondsNotes },
  { meta: durationConvexityMeta, component: DurationConvexityLab, notes: durationConvexityNotes },
  { meta: yieldCurveMeta, component: YieldCurveBuilder, notes: yieldCurveNotes },
  { meta: portfolioMeta, component: EfficientFrontier, notes: portfolioNotes },
  { meta: calTangencyMeta, component: CalTangencyPortfolio, notes: calTangencyNotes },
  { meta: capmMeta, component: CapmSml, notes: capmNotes },
  { meta: tvmMeta, component: TVM, notes: tvmNotes },
  { meta: npvIrrMeta, component: NpvIrrAnalyzer, notes: npvIrrNotes },
  { meta: loanAmortizationMeta, component: LoanAmortizationStudio, notes: loanAmortizationNotes },
]
