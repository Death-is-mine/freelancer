'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getClients, getProjects, formatNumber, type Client } from '@/lib/store'

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [projectCounts, setProjectCounts] = useState<Record<string, number>>({})
  const [revenues, setRevenues] = useState<Record<string, number>>({})
  useEffect(() => {
    setClients(getClients())
    const projects = getProjects()
    const counts: Record<string, number> = {}
    const revs: Record<string, number> = {}
    for (const p of projects) {
      const k = p.clientId || p.client
      counts[k] = (counts[k] || 0) + 1
      revs[k] = (revs[k] || 0) + (Number(p.amount.replace(/[^0-9.]/g, '')) || 0)
    }
    setProjectCounts(counts)
    setRevenues(revs)
  }, [])

  return (
    <>
      <h2 className="text-headline-lg tracking-tight text-on-surface mb-8">
        Clients {clients.length > 0 && `(${clients.length})`}
      </h2>
      {clients.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/10 p-12 text-center">
          <span
            className="material-symbols-outlined text-5xl text-on-surface-variant/30 mb-4"
            aria-hidden="true"
          >
            group
          </span>
          <h3 className="text-title-lg text-on-surface mb-2">No clients yet</h3>
          <p className="text-body-md text-on-surface-variant">
            Clients appear here when a project is created.
          </p>
        </div>
      ) : (
        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/10 shadow-sm overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left border-b border-outline-variant/5">
                <th
                  scope="col"
                  className="px-6 py-4 text-label-sm text-on-surface-variant uppercase"
                >
                  Client
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-label-sm text-on-surface-variant uppercase"
                >
                  Projects
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-label-sm text-on-surface-variant uppercase"
                >
                  Total Amount
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-label-sm text-on-surface-variant uppercase"
                >
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/5">
              {clients.map((c) => (
                <tr key={c.id} className="hover:bg-surface-container/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center font-bold text-sm">
                        {c.name
                          .split(' ')
                          .map((w) => w[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div>
                        <Link
                          href={`/clients/${encodeURIComponent(c.name)}`}
                          className="text-body-md font-semibold text-on-surface hover:text-primary transition-colors"
                        >
                          {c.name}
                        </Link>
                        {c.email && (
                          <p className="text-label-sm text-on-surface-variant">{c.email}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-body-md text-on-surface">
                    {projectCounts[c.id] || 0}
                  </td>
                  <td className="px-6 py-4 text-body-md font-semibold text-on-surface">
                    {formatNumber(revenues[c.id] || 0)}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-secondary-container text-on-secondary-container">
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
