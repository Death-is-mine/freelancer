"use client"

import { useState } from "react"

export default function PortalPage() {
  const [publicAccess, setPublicAccess] = useState(true)
  const [clientUploads, setClientUploads] = useState(false)

  return (
    <div>
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
        <button onClick={() => { const link = `${window.location.origin}/portal/share/${crypto.randomUUID().slice(0, 8)}`; navigator.clipboard?.writeText(link); alert(`Share link copied:\n${link}`) }} className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-semibold text-body-md shadow-lg shadow-primary/10">
          Share New Link
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="col-span-2 bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/5">
          <h3 className="text-title-lg text-on-surface mb-4">Recent Shares</h3>
          {[
            { client: "Nexus Systems", item: "Q3 Proposal", type: "Proposal", date: "2 hours ago" },
            { client: "Stellar Media", item: "Brand Guidelines", type: "File", date: "Yesterday" },
            { client: "Arcane Labs", item: "Invoice INV-003", type: "Invoice", date: "3 days ago" },
          ].map((share) => (
            <div key={share.client} className="flex items-center justify-between py-3 border-b border-outline-variant/5 last:border-0">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-on-surface-variant" aria-hidden="true">
                  {share.type === "Proposal" ? "description" : share.type === "File" ? "folder" : "receipt"}
                </span>
                <div>
                  <p className="text-body-md font-medium text-on-surface">{share.item}</p>
                  <p className="text-label-sm text-on-surface-variant/80">{share.client} &bull; {share.date}</p>
                </div>
              </div>
              <button onClick={() => alert(`Opening ${share.item}`)} className="text-label-sm text-primary cursor-pointer hover:underline">View</button>
            </div>
          ))}
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/5">
          <h3 className="text-title-lg text-on-surface mb-4">Portal Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-body-md text-on-surface">Public Access</span>
              <button aria-label="Toggle public access" onClick={() => setPublicAccess(!publicAccess)} className={`w-10 h-6 rounded-full relative transition-colors ${publicAccess ? "bg-primary" : "bg-surface-container-high"}`}>
                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 shadow-sm transition-transform ${publicAccess ? "right-1" : "left-1"}`}></div>
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-body-md text-on-surface">Client Uploads</span>
              <button aria-label="Toggle client uploads" onClick={() => setClientUploads(!clientUploads)} className={`w-10 h-6 rounded-full relative transition-colors ${clientUploads ? "bg-primary" : "bg-surface-container-high"}`}>
                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 shadow-sm transition-transform ${clientUploads ? "right-1" : "left-1"}`}></div>
              </button>
            </div>
            <p className="text-label-sm text-on-surface-variant/80 pt-4 border-t border-outline-variant/5">Clients can view shared files and proposals without signing in.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
