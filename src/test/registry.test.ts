import { describe, it, expect } from 'vitest'
import { registry } from '../registry'

describe('registry', () => {
  it('exports an array', () => {
    expect(Array.isArray(registry)).toBe(true)
  })

  it('each entry has required fields', () => {
    for (const mod of registry) {
      expect(mod.meta.id).toBeTruthy()
      expect(mod.meta.title).toBeTruthy()
      expect(mod.meta.category).toBeTruthy()
      expect(typeof mod.component).toBe('function')
      expect(typeof mod.notes).toBe('string')
    }
  })
})
