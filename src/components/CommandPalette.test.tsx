import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CommandPalette } from './CommandPalette'

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }))

function openPalette() {
  render(<CommandPalette />)
  fireEvent.keyDown(document, { key: 'k', metaKey: true })
}

describe('CommandPalette', () => {
  it('renders nothing when closed', () => {
    const { container } = render(<CommandPalette />)
    expect(container.innerHTML).toBe('')
  })

  it('renders items when open', () => {
    openPalette()
    expect(screen.getAllByText('Dashboard').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Invoices').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Proposals').length).toBeGreaterThanOrEqual(1)
  })

  it('filters items on input', () => {
    openPalette()
    const input = screen.getByPlaceholderText('Go to...')
    fireEvent.change(input, { target: { value: 'inv' } })
    expect(screen.getAllByText('Invoices').length).toBeGreaterThanOrEqual(1)
    expect(screen.queryAllByText('Dashboard').length).toBe(0)
  })

  it('shows Settings item', () => {
    openPalette()
    expect(screen.getAllByText('Settings').length).toBeGreaterThanOrEqual(1)
  })
})
