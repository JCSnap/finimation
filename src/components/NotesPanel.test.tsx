import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { NotesPanel } from './NotesPanel'

describe('NotesPanel', () => {
  it('renders module header chrome and styled markdown wrappers', () => {
    render(
      <NotesPanel
        title="Bond Pricing"
        description="Present value, yield, and duration concepts"
        notes={[
          '## Pricing Formula',
          '',
          '| Condition | Result |',
          '|---|---|',
          '| YTM = Coupon | Par |',
          '',
          '```ts',
          'const price = 1000',
          '```',
        ].join('\n')}
      />,
    )

    expect(screen.getByText('Study Notes')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Bond Pricing' })).toBeInTheDocument()
    expect(screen.getByText('Present value, yield, and duration concepts')).toBeInTheDocument()
    expect(document.querySelector('.notes-table-wrap')).toBeInTheDocument()
    expect(document.querySelector('.notes-code-block')).toBeInTheDocument()
  })
})
