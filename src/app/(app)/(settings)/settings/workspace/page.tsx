'use client'

import { useEffect, useState, useCallback } from 'react'
import { getCurrency, setCurrency } from '@/lib/store'
import { backupToSheets, restoreFromBackup, getLastBackupTime } from '@/lib/backup'

const CURRENCIES = ['USD', 'INR', 'EUR', 'GBP', 'CAD', 'AUD', 'SGD', 'AED', 'JPY', 'BRL']
const CURRENCY_LABELS: Record<string, string> = {
  USD: 'US Dollar ($)',
  INR: 'Indian Rupee (₹)',
  EUR: 'Euro (€)',
  GBP: 'British Pound (£)',
  CAD: 'Canadian Dollar (C$)',
  AUD: 'Australian Dollar (A$)',
  SGD: 'Singapore Dollar (S$)',
  AED: 'UAE Dirham (د.إ)',
  JPY: 'Japanese Yen (¥)',
  BRL: 'Brazilian Real (R$)',
}

export default function WorkspaceSettingsPage() {
  const [timezone, setTimezone] = useState('UTC')
  const [name, setName] = useState('My Workspace')
  const [currency, setCurr] = useState('USD')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    setTimezone(tz)
    const stored = localStorage.getItem('fos_workspace_name')
    if (stored) setName(stored)
    setCurr(getCurrency())
  }, [])

  function handleSave() {
    localStorage.setItem('fos_workspace_name', name)
    setCurrency(currency)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="max-w-3xl">
      <h2 className="text-headline-lg text-on-surface mb-2">Workspace</h2>
      <p className="text-body-md text-on-surface-variant mb-8">Manage your workspace settings.</p>
      <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/20 space-y-6">
        <div>
          <label
            htmlFor="workspace-name"
            className="text-label-md text-on-surface font-semibold block mb-2"
          >
            Workspace Name
          </label>
          <input
            id="workspace-name"
            className="w-full bg-surface-container-low border-none rounded-lg px-4 py-2.5 text-body-md focus:ring-2 focus:ring-primary/20"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label
            htmlFor="timezone"
            className="text-label-md text-on-surface font-semibold block mb-2"
          >
            Timezone
          </label>
          <input
            id="timezone"
            className="w-full bg-surface-container-low border-none rounded-lg px-4 py-2.5 text-body-md focus:ring-2 focus:ring-primary/20"
            value={timezone}
            readOnly
          />
          <p className="text-label-sm text-on-surface-variant mt-1">
            Auto-detected from your browser
          </p>
        </div>
        <div>
          <label
            htmlFor="currency"
            className="text-label-md text-on-surface font-semibold block mb-2"
          >
            Currency
          </label>
          <select
            id="currency"
            value={currency}
            onChange={(e) => setCurr(e.target.value)}
            className="w-full bg-surface-container-low border-none rounded-lg px-4 py-2.5 text-body-md focus:ring-2 focus:ring-primary/20 cursor-pointer"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {CURRENCY_LABELS[c] || c}
              </option>
            ))}
          </select>
          <p className="text-label-sm text-on-surface-variant mt-1">
            Used for all monetary displays across the workspace.
          </p>
        </div>
      </div>
      <div className="mt-8 flex justify-end items-center gap-4">
        {saved && (
          <span className="text-label-sm text-secondary flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
              check
            </span>
            Saved
          </span>
        )}
        <button
          onClick={handleSave}
          className="px-8 py-2.5 bg-primary text-white text-label-md font-semibold rounded-lg shadow-lg shadow-primary/20"
        >
          Save
        </button>
      </div>

      <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/20 mt-8">
        <h3 className="text-title-lg text-on-surface mb-2">Backup to Google Sheets</h3>
        <p className="text-body-md text-on-surface-variant mb-4">
          Snapshot all data to the connected Google Sheet for safekeeping.
        </p>
        <BackupSection />
      </div>
    </div>
  )
}

function BackupSection() {
  const [lastBackup, setLastBackup] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const flash = (m: string) => {
    setMsg(m)
    setTimeout(() => setMsg(''), 3000)
  }
  const refresh = useCallback(() => setLastBackup(getLastBackupTime()), [])
  useEffect(() => {
    setLastBackup(getLastBackupTime())
  }, [])
  return (
    <div>
      {msg && (
        <div
          className="mb-3 px-4 py-2 rounded-lg bg-surface-container-high text-body-sm text-on-surface"
          role="status"
        >
          {msg}
        </div>
      )}
      <div className="flex items-center gap-4 flex-wrap">
        <p className="text-label-sm text-on-surface-variant">
          Last backup: {lastBackup ? new Date(lastBackup).toLocaleString() : 'Never'}
        </p>
        <button
          onClick={async () => {
            setBusy(true)
            const ts = await backupToSheets()
            if (ts) {
              flash(`Backup complete — ${new Date(ts).toLocaleString()}`)
              refresh()
            } else {
              flash('Backup failed — check SHEETS_ID and auth')
            }
            setBusy(false)
          }}
          disabled={busy}
          className="px-4 py-2 rounded-lg bg-primary text-on-primary text-label-md font-semibold disabled:opacity-40 flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
            {busy ? 'sync' : 'cloud_upload'}
          </span>
          {busy ? 'Backing up…' : 'Backup Now'}
        </button>
        <button
          onClick={async () => {
            if (!confirm('Restore will overwrite all local data. Continue?')) return
            setBusy(true)
            const ts = await restoreFromBackup()
            if (ts) {
              flash(`Restored from backup — ${new Date(ts).toLocaleString()}`)
              refresh()
            } else {
              flash('Restore failed')
            }
            setBusy(false)
          }}
          disabled={busy}
          className="px-4 py-2 rounded-lg border border-outline-variant/30 text-on-surface text-label-md disabled:opacity-40 flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
            cloud_download
          </span>
          Restore
        </button>
      </div>
    </div>
  )
}
