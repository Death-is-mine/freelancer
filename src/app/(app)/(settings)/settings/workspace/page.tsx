"use client"

import { useEffect, useState } from "react"

export default function WorkspaceSettingsPage() {
  const [timezone, setTimezone] = useState("UTC")

  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    setTimezone(tz)
  }, [])

  return (
    <div className="max-w-3xl">
      <h2 className="text-headline-lg text-on-surface mb-2">Workspace</h2>
      <p className="text-body-md text-on-surface-variant mb-8">Manage your workspace settings.</p>
      <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/20 space-y-6">
        <div>
          <label htmlFor="workspace-name" className="text-label-md text-on-surface font-semibold block mb-2">Workspace Name</label>
          <input id="workspace-name" className="w-full bg-surface-container-low border-none rounded-lg px-4 py-2.5 text-body-md focus:ring-2 focus:ring-primary/20" defaultValue="My Workspace" />
        </div>
        <div>
          <label htmlFor="timezone" className="text-label-md text-on-surface font-semibold block mb-2">Timezone</label>
          <input id="timezone" className="w-full bg-surface-container-low border-none rounded-lg px-4 py-2.5 text-body-md focus:ring-2 focus:ring-primary/20" value={timezone} readOnly />
          <p className="text-label-sm text-on-surface-variant mt-1">Auto-detected from your browser</p>
        </div>
      </div>
    </div>
  )
}
