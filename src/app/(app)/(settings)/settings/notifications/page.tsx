"use client"

import { useState, useEffect } from "react"

const NOTIF_KEYS = ["email_notifications", "task_reminders", "invoice_alerts", "weekly_digest"]

const NOTIF_ITEMS = [
  { key: NOTIF_KEYS[0], label: "Email Notifications", desc: "Receive updates via email" },
  { key: NOTIF_KEYS[1], label: "Task Reminders", desc: "Get reminded about upcoming deadlines" },
  { key: NOTIF_KEYS[2], label: "Invoice Alerts", desc: "Notifications for paid and overdue invoices" },
  { key: NOTIF_KEYS[3], label: "Weekly Digest", desc: "Weekly summary of all activity" },
]

function loadPrefs(): Record<string, boolean> {
  if (typeof window === "undefined") return {}
  try {
    const saved = localStorage.getItem("fos_notification_prefs")
    return saved ? JSON.parse(saved) : {}
  } catch { return {} }
}

function savePrefs(prefs: Record<string, boolean>) {
  localStorage.setItem("fos_notification_prefs", JSON.stringify(prefs))
}

export default function NotificationsPage() {
  const [prefs, setPrefs] = useState<Record<string, boolean>>({})

  useEffect(() => {
    setPrefs(loadPrefs())
  }, [])

  function toggle(key: string) {
    const next = { ...prefs, [key]: !prefs[key] }
    setPrefs(next)
    savePrefs(next)
  }

  return (
    <div className="max-w-3xl">
      <h2 className="text-headline-lg text-on-surface mb-2">Notifications</h2>
      <p className="text-body-md text-on-surface-variant mb-8">Manage your notification preferences.</p>
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 divide-y divide-outline-variant/10">
        {NOTIF_ITEMS.map((n) => {
          const checked = prefs[n.key] ?? (n.key === "email_notifications" || n.key === "task_reminders")
          return (
            <div key={n.key} className="p-6 flex items-center justify-between">
              <div>
                <span className="block text-label-md font-semibold mb-1">{n.label}</span>
                <p className="text-on-surface-variant text-body-md">{n.desc}</p>
              </div>
              <label className="relative inline-block w-9 h-5">
                <input type="checkbox" className="opacity-0 w-0 h-0 peer" checked={checked} onChange={() => toggle(n.key)} aria-label={n.label} />
                <span className="absolute cursor-pointer inset-0 bg-outline rounded-full transition-colors peer-checked:bg-primary before:absolute before:h-4 before:w-4 before:left-0.5 before:bottom-0.5 before:bg-white before:rounded-full before:transition-transform peer-checked:before:translate-x-4"></span>
              </label>
            </div>
          )
        })}
      </div>
    </div>
  )
}
