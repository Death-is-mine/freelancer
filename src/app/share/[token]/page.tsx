"use client"

import { useEffect, useState } from "react"
import { use } from "react"
import { getShareByToken, type Share, type Project } from "@/lib/store"

export default function ShareView({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)
  const [data, setData] = useState<{ share: Share; project: Project } | null | undefined>(undefined)

  useEffect(() => { setData(getShareByToken(token)) }, [token])

  if (data === undefined) return <div className="flex items-center justify-center min-h-screen"><p>Loading…</p></div>
  if (!data) return (
    <div className="flex items-center justify-center min-h-screen p-8">
      <div className="text-center max-w-md">
        <span className="material-symbols-outlined text-6xl text-on-surface-variant/30 mb-4" aria-hidden="true">lock</span>
        <h1 className="text-2xl font-bold mb-2">Link Expired or Invalid</h1>
        <p className="text-on-surface-variant">This share link is no longer available. Contact the sender for a new link.</p>
      </div>
    </div>
  )

  const { project } = data
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-outline-variant/10 bg-surface-container-lowest/80 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center gap-3">
          <span className="material-symbols-outlined text-primary" aria-hidden="true">rocket_launch</span>
          <span className="font-semibold text-lg">FreelanceOS</span>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/5 p-8">
          <div className="flex items-center gap-2 text-label-sm text-on-surface-variant mb-6">
            <span className="material-symbols-outlined text-base" aria-hidden="true">lock_open</span>
            Shared via secure link
          </div>
          <h1 className="text-3xl font-bold mb-2">{project.requirement}</h1>
          <p className="text-xl text-on-surface-variant mb-8">Client: {project.client}</p>
          <div className="grid grid-cols-2 gap-6">
            <div className="p-4 rounded-xl bg-surface-container-high">
              <p className="text-label-sm text-on-surface-variant mb-1">Amount</p>
              <p className="text-xl font-semibold">{project.amount || "—"}</p>
            </div>
            <div className="p-4 rounded-xl bg-surface-container-high">
              <p className="text-label-sm text-on-surface-variant mb-1">Status</p>
              <p className="text-xl font-semibold">{project.amountStatus}</p>
            </div>
            <div className="p-4 rounded-xl bg-surface-container-high">
              <p className="text-label-sm text-on-surface-variant mb-1">Invoice</p>
              <p className="text-xl font-semibold">{project.invoiceNum}</p>
            </div>
            <div className="p-4 rounded-xl bg-surface-container-high">
              <p className="text-label-sm text-on-surface-variant mb-1">Due Date</p>
              <p className="text-xl font-semibold">{project.dueDate}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
