"use client"

import Link from "next/link"
import { projects } from "@/lib/store"

export default function ClientsPage() {
  const activeProjects = projects
  const clientMap = new Map<string, { name: string; count: number; amount: number }>()
  activeProjects.forEach((p) => {
    const existing = clientMap.get(p.client)
    if (existing) { existing.count++; existing.amount += Number(p.amount.replace(/[^0-9.]/g, "")) || 0 }
    else clientMap.set(p.client, { name: p.client, count: 1, amount: Number(p.amount.replace(/[^0-9.]/g, "")) || 0 })
  })
  const allClients = [...clientMap.values()]

  if (allClients.length === 0) {
    return (
      <>
        <nav className="flex items-center gap-2 text-on-surface-variant mb-1"><span className="text-label-md">Workspace</span><span className="text-on-surface-variant/30">/</span><span className="text-label-md font-semibold text-on-surface">Clients</span></nav>
        <h2 className="text-headline-lg tracking-tight text-on-surface mb-8">Clients</h2>
        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/10 p-12 text-center">
          <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 mb-4" aria-hidden="true">group</span>
          <h3 className="text-title-lg text-on-surface mb-2">No clients yet</h3>
          <p className="text-body-md text-on-surface-variant">Clients appear here when a project is created.</p>
        </div>
      </>
    )
  }

  return (
    <>
      <nav className="flex items-center gap-2 text-on-surface-variant mb-1"><span className="text-label-md">Workspace</span><span className="text-on-surface-variant/30">/</span><span className="text-label-md font-semibold text-on-surface">Clients</span></nav>
      <h2 className="text-headline-lg tracking-tight text-on-surface mb-8">Clients ({allClients.length})</h2>
      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/10 shadow-sm overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-left border-b border-outline-variant/5">
              <th className="px-6 py-4 text-label-sm text-on-surface-variant uppercase">Client</th>
              <th className="px-6 py-4 text-label-sm text-on-surface-variant uppercase">Projects</th>
              <th className="px-6 py-4 text-label-sm text-on-surface-variant uppercase">Total Amount</th>
              <th className="px-6 py-4 text-label-sm text-on-surface-variant uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/5">
            {allClients.map((c) => (
              <tr key={c.name} className="hover:bg-surface-container/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center font-bold text-sm">
                      {c.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                    <Link href={`/clients/${encodeURIComponent(c.name)}`} className="text-body-md font-semibold text-on-surface hover:text-primary transition-colors">{c.name}</Link>
                  </div>
                </td>
                <td className="px-6 py-4 text-body-md text-on-surface">{c.count}</td>
                <td className="px-6 py-4 text-body-md font-semibold text-on-surface">${c.amount.toLocaleString()}</td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-secondary-container text-on-secondary-container">Active</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
