import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ErrorBoundary } from './ErrorBoundary'

describe('ErrorBoundary', () => {
  it('renders children when no error', () => {
    render(
      <ErrorBoundary>
        <div>hello</div>
      </ErrorBoundary>,
    )
    expect(screen.getByText('hello')).toBeDefined()
  })

  it('shows error UI on throw', () => {
    const Throws = () => {
      throw new Error('boom')
    }
    render(
      <ErrorBoundary>
        <Throws />
      </ErrorBoundary>,
    )
    expect(screen.getByText(/Something went wrong/i)).toBeDefined()
    expect(screen.getByText(/Try again/i)).toBeDefined()
  })
})
