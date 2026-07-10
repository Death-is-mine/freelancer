"use client"

import { useState, useEffect } from "react"
import { getShares, addShare, revokeShare, getProjects, type Share } from "@/lib/store"

export default function PortalPage() {
  const [shares, setShares] = useState<Share[]>([])
  const [toast, setToast] = useState("")

  async function refresh() { setShares(await getShares()) }
  useEffect(() => { refresh() }, [])

  async function handleCreate() {
    const projects = getProjects()
    if (projects.length === 0) { setToast("Create a project first"); return }
    const share = await addShare(projects[0].id)
    if (!share) return
    const url = `${window.location.origin}/share/${share.token}`
    navigator.clipboard?.writeText(url)
    setToast(`Link copied: ${url}`)
    refresh()
  }

  async function handleRevoke(id: string) {
    await revokeShare(id)
    setToast("Share link revoked")
    refresh()
  }

  const projectNames = Object.fromEntries(getProjects().map((p) => [p.id, p.client]))

  return (
    <div>
      {toast && (
        <div className="fixed bottom-6 right-6 bg-surface-container-high text-on-surface px-5 py-3 rounded-xl shadow-xl z-50 animate-fade-in text-body-md font-medium" role="alert">
          {toast}
          <button onClick={() => setToast("")} className="ml-4 text-on-surface-variant cursor-pointer" aria-label="Dismiss">×</button>
        </div>
      )}
      <nav className="flex items-center gap-2 text-on-surface-variant mb-6">
        <span className="text-label-md">Workspace</span>
        <span className="text-on-surface-variant/30">/</span>
        <span className="text-label-md font-semibold text-on-surface">Client Portal</span>
      </nav>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-headline-lg tracking-tight text-on-surface">Client Portal</h2>
          <p className="text-body-md text-on-surface-variant mt-1">Share files, invoices, and proposals with clients.</p>
        </div>
        <button onClick={handleCreate} className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-semibold text-body-md shadow-lg shadow-primary/10 cursor-pointer">
          Share New Link
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="col-span-2 bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/5">
          <h3 className="text-title-lg text-on-surface mb-4">Recent Shares</h3>
          {shares.length === 0 ? (
            <p className="text-body-md text-on-surface-variant py-8 text-center">No shares yet. Click &quot;Share New Link&quot; to create one.</p>
          ) : (
            shares.map((s) => (
              <div key={s.id} className="flex items-center justify-between py-3 border-b border-outline-variant/5 last:border-0">
                <div className="flex items-center gap-3">
                  <span className={`material-symbols-outlined ${s.enabled ? "text-primary" : "text-on-surface-variant/40"}`} aria-hidden="true">link</span>
                  <div>
                    <p className="text-body-md font-medium text-on-surface">{projectNames[s.projectId] || "Unknown"} <span className={`text-label-sm ${s.enabled ? "text-success" : "text-on-surface-variant"}`}>{s.enabled ? "Active" : "Revoked"}</span></p>
                    <p className="text-label-sm text-on-surface-variant">{new Date(s.createdAt).toLocaleDateString()} {s.expiresAt ? `· Expires ${new Date(s.expiresAt).toLocaleDateString()}` : ""}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {s.enabled && (
                    <button onClick={() => { navigator.clipboard?.writeText(`${window.location.origin}/share/${s.token}`); setToast("Link copied") }} className="text-label-sm text-primary cursor-pointer hover:underline" aria-label="Copy share link">
                      Copy
                    </button>
                  )}
                  {s.enabled && (
                    <button onClick={() => handleRevoke(s.id)} className="text-label-sm text-error cursor-pointer hover:underline" aria-label="Revoke share link">
                      Revoke
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/5">
          <h3 className="text-title-lg text-on-surface mb-4">Portal Settings</h3>
          <p className="text-label-sm text-on-surface-variant">Shares are accessible at <code className="text-primary">/share/[token]</code> without sign-in. Revoke a link to disable it immediately.</p>
          <p className="text-label-sm text-on-surface-variant pt-4 border-t border-outline-variant/5 mt-4">Share links are created from the most recent project. To share a specific project, use the Share button on its detail page.</p>
        </div>
      </div>
    </div>
  )
}
