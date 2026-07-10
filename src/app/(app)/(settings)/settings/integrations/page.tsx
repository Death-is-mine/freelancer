"use client"

import { useEffect, useState } from "react"

export default function IntegrationsPage() {
  const [dbReady, setDbReady] = useState(false)
  const [calStatus, setCalStatus] = useState<"checking" | "connected" | "error">("checking")

  useEffect(() => {
    if (typeof window !== "undefined") {
      setDbReady(!!localStorage.getItem("fos_spreadsheet_id"))
    }
    fetch("/api/calendar/events").then(r => setCalStatus(r.ok ? "connected" : "error")).catch(() => setCalStatus("error"))
  }, [])

  return (
    <div className="max-w-3xl">
      <h2 className="text-headline-lg text-on-surface mb-2">Google Workspace</h2>
      <p className="text-body-md text-on-surface-variant mb-8">Your workspace is connected to Google. Everything syncs automatically.</p>

      <div className="space-y-4">
        {[
          { name: "Google Drive", desc: "Files, templates, and documents stored securely", status: "Active" },
          { name: "Google Sheets", desc: dbReady ? "Database ready and syncing" : "Setting up your database...", status: dbReady ? "Active" : "Configuring" },
          { name: "Google Calendar", desc: "Meeting and deadline sync", status: calStatus === "connected" ? "Active" : "Needs reauth" },
          { name: "Google Gmail", desc: "Email and communication tracking", status: "Coming soon" },
        ].map((integration) => (
          <div key={integration.name} className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center">
                <span className="material-symbols-outlined text-on-surface-variant" aria-hidden="true">google</span>
              </div>
              <div>
                <p className="text-body-md font-semibold text-on-surface">{integration.name}</p>
                <p className="text-label-md text-on-surface-variant">{integration.desc}</p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-label-sm font-bold ${integration.status === "Active" ? "bg-secondary-container text-on-secondary-container" : "bg-surface-container-high text-on-surface-variant"}`}>
              {integration.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
