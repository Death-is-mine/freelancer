'use client'

import { useState, useEffect } from 'react'

interface Proposal {
  id: string
  title: string
  client: string
  amount: string
  status: string
  createdAt: string
}

function getProposals(): Proposal[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem('fos_proposals') || '[]')
  } catch {
    return []
  }
}

export default function ProposalsPage() {
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])
  useEffect(() => {
    if (mounted) setProposals(getProposals())
  }, [mounted])

  const stats = [
    { label: 'Total', value: proposals.length },
    { label: 'Sent', value: proposals.filter((p) => p.status === 'Sent').length },
    { label: 'Accepted', value: proposals.filter((p) => p.status === 'Accepted').length },
    { label: 'Draft', value: proposals.filter((p) => p.status === 'Draft').length },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-headline-lg tracking-tight text-on-surface">Proposals</h2>
          <p className="text-body-md text-on-surface-variant mt-1">
            Create and send project proposals.
          </p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary font-semibold text-body-md shadow-lg shadow-primary/10">
          <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
            note_add
          </span>
          New Proposal
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/5"
          >
            <p className="text-label-md text-on-surface-variant">{s.label}</p>
            <h3 className="text-headline-md font-bold mt-1">{s.value}</h3>
          </div>
        ))}
      </div>

      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/10 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b border-outline-variant/10">
              <th scope="col" className="px-6 py-4 text-label-sm text-on-surface-variant uppercase">
                Title
              </th>
              <th scope="col" className="px-6 py-4 text-label-sm text-on-surface-variant uppercase">
                Client
              </th>
              <th scope="col" className="px-6 py-4 text-label-sm text-on-surface-variant uppercase">
                Amount
              </th>
              <th scope="col" className="px-6 py-4 text-label-sm text-on-surface-variant uppercase">
                Status
              </th>
              <th scope="col" className="px-6 py-4 text-label-sm text-on-surface-variant uppercase">
                Created
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/5">
            {proposals.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-16 text-center text-body-md text-on-surface-variant/75"
                >
                  No proposals yet. Click "New Proposal" to create one.
                </td>
              </tr>
            )}
            {proposals.map((p) => (
              <tr key={p.id} className="hover:bg-surface-container/50 transition-colors">
                <td className="px-6 py-4 text-body-md font-semibold text-on-surface">{p.title}</td>
                <td className="px-6 py-4 text-body-md text-on-surface">{p.client}</td>
                <td className="px-6 py-4 text-body-md text-on-surface">{p.amount}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${p.status === 'Accepted' ? 'bg-secondary-container text-on-secondary-container' : p.status === 'Sent' ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container-high text-on-surface-variant'}`}
                  >
                    {p.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-body-md text-on-surface-variant">
                  {new Date(p.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
