import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App home route', () => {
  it('renders home page content at root', () => {
    render(<App />)

    expect(screen.getByText(/Explore Interactive Finance Concepts/i)).toBeInTheDocument()
    expect(screen.getByText(/^Home$/i)).toBeInTheDocument()
  })
})
