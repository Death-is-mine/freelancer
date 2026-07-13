'use client'

import { useEffect } from 'react'

function resolveTheme(saved: string | null): 'light' | 'dark' {
  if (saved === 'dark') return 'dark'
  if (saved === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return 'light'
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const saved = localStorage.getItem('freelancer-theme')
    const theme = resolveTheme(saved)
    document.documentElement.classList.toggle('dark', theme === 'dark')

    const accent = localStorage.getItem('freelancer-accent')
    if (accent) {
      document.documentElement.style.setProperty('--color-primary', accent)
    }

    if (saved === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = (e: MediaQueryListEvent) => {
        document.documentElement.classList.toggle('dark', e.matches)
      }
      mq.addEventListener('change', handler)
      return () => mq.removeEventListener('change', handler)
    }
  }, [])

  useEffect(() => {
    function handler() {
      const saved = localStorage.getItem('freelancer-theme')
      const theme = resolveTheme(saved)
      document.documentElement.classList.toggle('dark', theme === 'dark')
      const accent = localStorage.getItem('freelancer-accent')
      if (accent) document.documentElement.style.setProperty('--color-primary', accent)
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  return <>{children}</>
}
