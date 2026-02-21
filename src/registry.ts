import type { FinanceModule } from './types/module'
import { meta as optionsMeta } from './modules/options/meta'
import OptionsPayoff from './modules/options/index'
import optionsNotes from './modules/options/notes.md?raw'

import { meta as bondsMeta } from './modules/bonds/meta'
import BondPricing from './modules/bonds/index'
import bondsNotes from './modules/bonds/notes.md?raw'

import { meta as portfolioMeta } from './modules/portfolio/meta'
import EfficientFrontier from './modules/portfolio/index'
import portfolioNotes from './modules/portfolio/notes.md?raw'

import { meta as tvmMeta } from './modules/tvm/meta'
import TVM from './modules/tvm/index'
import tvmNotes from './modules/tvm/notes.md?raw'

export const registry: FinanceModule[] = [
  { meta: optionsMeta, component: OptionsPayoff, notes: optionsNotes },
  { meta: bondsMeta, component: BondPricing, notes: bondsNotes },
  { meta: portfolioMeta, component: EfficientFrontier, notes: portfolioNotes },
  { meta: tvmMeta, component: TVM, notes: tvmNotes },
]
