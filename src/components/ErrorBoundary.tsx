'use client'

import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex flex-col items-center justify-center p-12 text-center" role="alert">
            <span className="material-symbols-outlined text-5xl text-error mb-4" aria-hidden="true">
              error
            </span>
            <h2 className="text-headline-md text-on-surface mb-2">Something went wrong</h2>
            <p className="text-body-md text-on-surface-variant mb-4">
              {this.state.error?.message ?? 'An unexpected error occurred.'}
            </p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-semibold text-label-md"
            >
              Try again
            </button>
          </div>
        )
      )
    }
    return this.props.children
  }
}
