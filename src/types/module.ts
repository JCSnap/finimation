import type { ComponentType } from 'react'

export interface ModuleMeta {
  id: string
  title: string
  category: string
  description: string
}

export interface FinanceModule {
  meta: ModuleMeta
  component: ComponentType
  notes: string
}
