'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'

const items = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Leads', path: '/leads' },
  { label: 'Projects', path: '/projects' },
  { label: 'Clients', path: '/clients' },
  { label: 'Invoices', path: '/invoices' },
  { label: 'Agreements', path: '/agreements' },
  { label: 'Proposals', path: '/proposals' },
  { label: 'Payments', path: '/payments' },
  { label: 'Tasks', path: '/tasks' },
  { label: 'Templates', path: '/templates' },
  { label: 'Automation', path: '/automation' },
  { label: 'Reports', path: '/reports' },
  { label: 'Client Portal', path: '/portal' },
  { label: 'Settings', path: '/settings' },
  { label: 'Appearance', path: '/settings/appearance' },
  { label: 'Notifications', path: '/settings/notifications' },
  { label: 'Integrations', path: '/settings/integrations' },
  { label: 'Workspace', path: '/settings/workspace' },
  { label: 'Calendar', path: '/settings/calendar' },
  { label: 'Templates', path: '/settings/templates' },
]

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [idx, setIdx] = useState(0)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    if (open) inputRef.current?.focus()
    setQuery('')
    setIdx(0)
  }, [open])

  const filtered = items.filter((i) => i.label.toLowerCase().includes(query.toLowerCase()))

  const navigate = useCallback(
    (path: string) => {
      setOpen(false)
      router.push(path)
    },
    [router],
  )

  const onKey = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setIdx((i) => Math.min(i + 1, filtered.length - 1))
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setIdx((i) => Math.max(i - 1, 0))
      }
      if (e.key === 'Enter' && filtered[idx]) navigate(filtered[idx].path)
    },
    [filtered, idx, navigate],
  )

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
      <div className="fixed inset-0 bg-black/40" onClick={() => setOpen(false)} />
      <div
        className="relative bg-surface-container-lowest w-full max-w-lg rounded-2xl border border-outline-variant/10 shadow-2xl overflow-hidden z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 border-b border-outline-variant/5">
          <span className="material-symbols-outlined text-on-surface-variant" aria-hidden="true">
            search
          </span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setIdx(0)
            }}
            onKeyDown={onKey}
            placeholder="Go to..."
            aria-label="Search pages"
            className="flex-1 bg-transparent border-0 outline-none py-4 text-body-md text-on-surface placeholder:text-on-surface-variant/70"
          />
          <kbd className="text-label-sm text-on-surface-variant/40 bg-surface-container-high px-1.5 py-0.5 rounded">
            ESC
          </kbd>
        </div>
        <div className="max-h-64 overflow-y-auto p-2">
          {filtered.length === 0 && (
            <p className="text-body-md text-on-surface-variant/70 text-center py-6">No results</p>
          )}
          {filtered.map((item, i) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${i === idx ? 'bg-surface-container-high text-on-surface' : 'text-on-surface hover:bg-surface-container/50'}`}
            >
              <span className="text-label-sm text-on-surface-variant w-8">
                {item.path.split('/')[1]}
              </span>
              <span className="text-body-md font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
