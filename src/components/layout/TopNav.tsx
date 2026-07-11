"use client"

import { memo, useState, useCallback, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { signOut, useSession } from "next-auth/react"

interface NotificationItem {
  key: string; msg: string; time: string; read: boolean
}

function getNotifications(): NotificationItem[] {
  if (typeof window === "undefined") return []
  const items: NotificationItem[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith("fos_notification_")) {
      try {
        const val = JSON.parse(localStorage.getItem(key) || "{}")
        items.push({ key, msg: val.msg || "", time: val.time || "", read: val.read || false })
      } catch {}
    }
  }
  return items.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
}

function formatNotifTime(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 60000) return "just now"
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

const SETUP_KEY = "fos_setup_done"
const SPREADSHEET_KEY = "fos_spreadsheet_id"

type SyncState = "synced" | "syncing" | "offline" | "retrying" | "failed"

const profileItems = [
  { label: "Profile", icon: "person", href: "/settings/profile" },
  { label: "Workspace", icon: "corporate_fare", href: "/settings/workspace" },
  { label: "Templates", icon: "folder", href: "/settings/templates" },
  { label: "Integrations", icon: "google", href: "/settings/integrations" },
  { label: "Appearance", icon: "palette", href: "/settings/appearance" },
  { label: "Security", icon: "lock", href: "/settings/security" },
  { label: "Billing", icon: "credit_card", href: "/settings/billing" },
  { label: "Help", icon: "help", href: "/settings/help" },
]

export const TopNav = memo(function TopNav() {
  const router = useRouter()
  const { data: session } = useSession()
  const [syncState, setSyncState] = useState<SyncState>("synced")
  const [profileOpen, setProfileOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const menuRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)
  const syncTimerRef = useRef<ReturnType<typeof setInterval>>(undefined)

  useEffect(() => {
    setNotifications(getNotifications())
    const id = setInterval(() => setNotifications(getNotifications()), 10000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setProfileOpen(false)
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  function dismissNotif(key: string) {
    try { localStorage.removeItem(key) } catch {}
    setNotifications(getNotifications())
  }

  function markRead(key: string) {
    try {
      const val = JSON.parse(localStorage.getItem(key) || "{}")
      val.read = true
      localStorage.setItem(key, JSON.stringify(val))
    } catch {}
    setNotifications(getNotifications())
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  const user = session?.user
  const displayName = user?.name || "Freelancer"
  const initials = displayName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() || "F"
  const avatarUrl = user?.image

  useEffect(() => {
    if (!session?.user || typeof window === "undefined") return
    if (localStorage.getItem(SETUP_KEY)) return
    localStorage.setItem(SETUP_KEY, "pending")
    fetch("/api/setup", { method: "POST" })
      .then((r) => r.json())
      .then((data) => {
        localStorage.setItem(SETUP_KEY, "done")
        if (data.spreadsheetId) localStorage.setItem(SPREADSHEET_KEY, data.spreadsheetId)
      })
      .catch(() => localStorage.removeItem(SETUP_KEY))
  }, [session?.user])

  const doSync = useCallback(async () => {
    if (typeof window === "undefined" || !("indexedDB" in window)) return
    try {
      const { syncAll } = await import("@/lib/offline")
      await syncAll()
      setSyncState("synced")
    } catch {
      setSyncState((s) => s === "syncing" ? "failed" : s)
    }
  }, [])

  useEffect(() => {
    setSyncState("syncing")
    doSync()
    syncTimerRef.current = setInterval(() => {
      setSyncState("syncing")
      doSync()
    }, 60000)
    return () => { if (syncTimerRef.current) clearInterval(syncTimerRef.current) }
  }, [doSync])

  useEffect(() => {
    if (!("onLine" in navigator)) return
    const goOnline = () => { setSyncState("syncing"); doSync().finally(() => setSyncState("synced")) }
    const goOffline = () => setSyncState("offline")
    window.addEventListener("online", goOnline)
    window.addEventListener("offline", goOffline)
    return () => { window.removeEventListener("online", goOnline); window.removeEventListener("offline", goOffline) }
  }, [doSync])

  const syncColors: Record<SyncState, string> = {
    synced: "text-success",
    syncing: "text-primary",
    offline: "text-warning",
    retrying: "text-warning",
    failed: "text-error",
  }

  const syncLabels: Record<SyncState, string> = {
    synced: "Synced",
    syncing: "Syncing...",
    offline: "Offline",
    retrying: "Retrying...",
    failed: "Sync failed",
  }

  return (
    <header className="h-16 w-full sticky top-0 z-40 bg-surface/80 backdrop-blur-md flex justify-between items-center px-margin-x border-b border-outline-variant/5" role="banner">
      <div className="flex items-center flex-1">
        <div className="relative w-96 max-w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" aria-hidden="true">search</span>
          <input
            className="w-full bg-surface-container-low border-none rounded-full pl-10 pr-4 py-2 text-body-md focus:ring-2 focus:ring-primary/20 transition-all outline-none cursor-pointer"
            placeholder="Search files, clients, or projects..."
            type="search"
            aria-label="Search files, clients, or projects"
            onFocus={() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }))}
            readOnly
          />
        </div>
      </div>
      <div className="flex items-center gap-4 relative">
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-surface-container-low" aria-label={`Sync status: ${syncLabels[syncState]}`}>
          <span className={`material-symbols-outlined text-[18px] ${syncColors[syncState]} ${syncState === "syncing" ? "animate-spin" : ""}`} aria-hidden="true">
            {syncState === "syncing" ? "sync" : syncState === "offline" ? "cloud_off" : syncState === "failed" ? "cloud_off" : "cloud_done"}
          </span>
          <span className={`text-[11px] font-semibold ${syncColors[syncState]}`}>{syncLabels[syncState]}</span>
        </div>
        <div ref={notifRef} className="relative">
          <button onClick={() => { setNotifOpen((o) => !o); if (!notifOpen) setNotifications(getNotifications()) }} className="p-2 rounded-full hover:bg-surface-container-high text-on-surface-variant transition-all relative" aria-label="Notifications" aria-expanded={notifOpen}>
            <span className="material-symbols-outlined" aria-hidden="true">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-error text-[10px] font-bold text-on-error flex items-center justify-center">{unreadCount > 9 ? "9+" : unreadCount}</span>
            )}
          </button>
          {notifOpen && (
            <div className="absolute top-full right-0 mt-2 w-80 bg-surface-container-lowest border border-outline-variant/10 rounded-xl shadow-2xl z-50 max-h-96 flex flex-col" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant/10">
                <span className="text-label-md font-semibold text-on-surface">Notifications</span>
                {unreadCount > 0 && <button onClick={() => { notifications.forEach((n) => { if (!n.read) markRead(n.key) }) }} className="text-label-sm text-primary cursor-pointer hover:underline">Mark all read</button>}
              </div>
              <div className="overflow-y-auto flex-1">
                {notifications.length === 0 ? (
                  <p className="text-body-md text-on-surface-variant/60 text-center py-8">No notifications</p>
                ) : (
                  notifications.slice(0, 20).map((n) => (
                    <div key={n.key} className={`flex items-start gap-3 px-4 py-3 border-b border-outline-variant/5 hover:bg-surface-container-high transition-colors ${!n.read ? "bg-primary/[0.02]" : ""}`}>
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.read ? "bg-transparent" : "bg-primary"}`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-body-md ${n.read ? "text-on-surface-variant/80" : "text-on-surface font-medium"}`}>{n.msg}</p>
                        <p className="text-label-sm text-on-surface-variant/60 mt-0.5">{formatNotifTime(n.time)}</p>
                      </div>
                      <button onClick={() => dismissNotif(n.key)} className="shrink-0 text-on-surface-variant/40 hover:text-error transition-colors" aria-label="Dismiss notification">
                        <span className="material-symbols-outlined text-[16px]" aria-hidden="true">close</span>
                      </button>
                    </div>
                  ))
                )}
              </div>
              <button onClick={() => { setNotifOpen(false); router.push("/settings/notifications") }} className="w-full py-2.5 text-label-md font-semibold text-primary hover:bg-primary/5 transition-colors border-t border-outline-variant/10 cursor-pointer">
                Notification Settings
              </button>
            </div>
          )}
        </div>
        <div className="h-8 w-px bg-outline-variant/30 mx-2" aria-hidden="true"></div>
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setProfileOpen((o) => !o)}
            className="flex items-center gap-3 pl-2 rounded-xl hover:bg-surface-container-high pr-2 py-1 transition-colors"
            aria-label="Profile menu"
            aria-expanded={profileOpen}
          >
            <div className="text-right hidden lg:block">
              <p className="text-label-md font-semibold text-on-surface">My Workspace</p>
            </div>
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="w-11 h-11 rounded-full border-2 border-surface-container-high object-cover" />
            ) : (
              <div className="w-11 h-11 rounded-full bg-secondary-container border-2 border-surface-container-high flex items-center justify-center text-on-secondary-container font-bold text-sm" aria-hidden="true">
                {initials}
              </div>
            )}
          </button>
          {profileOpen && (
            <div className="absolute top-full right-0 mt-2 w-56 bg-surface-container-lowest border border-outline-variant/10 rounded-xl shadow-2xl py-2 z-50" onClick={(e) => e.stopPropagation()}>
              {profileItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => { router.push(item.href); setProfileOpen(false) }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-body-md text-on-surface hover:bg-surface-container-high transition-colors text-left"
                >
                  <span className="material-symbols-outlined text-[20px] text-on-surface-variant" aria-hidden="true">{item.icon}</span>
                  {item.label}
                </button>
              ))}
              <div className="h-px bg-outline-variant/20 my-2 mx-4" aria-hidden="true"></div>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-body-md text-error hover:bg-error/5 transition-colors text-left"
              >
                <span className="material-symbols-outlined text-[20px]" aria-hidden="true">logout</span>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
})
