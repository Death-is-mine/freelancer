"use client"

import { useEffect, useState } from "react"

export default function WorkspaceSettingsPage() {
  const [timezone, setTimezone] = useState("UTC")
  const [name, setName] = useState("My Workspace")
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    setTimezone(tz)
    const stored = localStorage.getItem("fos_workspace_name")
    if (stored) setName(stored)
  }, [])

  function handleSave() {
    localStorage.setItem("fos_workspace_name", name)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="max-w-3xl">
      <h2 className="text-headline-lg text-on-surface mb-2">Workspace</h2>
      <p className="text-body-md text-on-surface-variant mb-8">Manage your workspace settings.</p>
      <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/20 space-y-6">
        <div>
          <label htmlFor="workspace-name" className="text-label-md text-on-surface font-semibold block mb-2">Workspace Name</label>
          <input id="workspace-name" className="w-full bg-surface-container-low border-none rounded-lg px-4 py-2.5 text-body-md focus:ring-2 focus:ring-primary/20" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label htmlFor="timezone" className="text-label-md text-on-surface font-semibold block mb-2">Timezone</label>
          <input id="timezone" className="w-full bg-surface-container-low border-none rounded-lg px-4 py-2.5 text-body-md focus:ring-2 focus:ring-primary/20" value={timezone} readOnly />
          <p className="text-label-sm text-on-surface-variant mt-1">Auto-detected from your browser</p>
        </div>
      </div>
      <div className="mt-8 flex justify-end items-center gap-4">
        {saved && <span className="text-label-sm text-secondary flex items-center gap-1"><span className="material-symbols-outlined text-[14px]" aria-hidden="true">check</span>Saved</span>}
        <button onClick={handleSave} className="px-8 py-2.5 bg-primary text-white text-label-md font-semibold rounded-lg shadow-lg shadow-primary/20">Save</button>
      </div>
    </div>
  )
}
