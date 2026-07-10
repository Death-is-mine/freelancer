"use client"

import { memo, useState, useCallback, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { signOut, useSession } from "next-auth/react"

const SETUP_KEY = "fos_setup_done"
const SPREADSHEET_KEY = "fos_spreadsheet_id"

const profileItems = [
  { label: "Profile", icon: "person", href: "/settings/profile" },
  { label: "Workspace", icon: "corporate_fare", href: "/settings/workspace" },
  { label: "Google Workspace", icon: "google", href: "/settings/integrations" },
  { label: "Templates", icon: "folder", href: "/settings/templates" },
  { label: "Appearance", icon: "palette", href: "/settings/appearance" },
  { label: "Notifications", icon: "notifications_active", href: "/settings/notifications" },
  { label: "Security", icon: "lock", href: "/settings/security" },
  { label: "Billing", icon: "credit_card", href: "/settings/billing" },
  { label: "Help", icon: "help", href: "/settings/help" },
]

export const TopNav = memo(function TopNav() {
  const router = useRouter()
  const { data: session } = useSession()
  const [syncing, setSyncing] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const user = session?.user
  const displayName = user?.name || "Freelancer"
  const initials = displayName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() || "F"
  const avatarUrl = user?.image

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

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

  const handleSync = useCallback(() => {
    setSyncing(true)
    setTimeout(() => setSyncing(false), 1500)
  }, [])

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
        <button onClick={handleSync} className="p-2 rounded-full hover:bg-surface-container-high text-on-surface-variant transition-all relative" aria-label="Sync now">
          <span className={`material-symbols-outlined ${syncing ? "animate-spin" : ""}`} aria-hidden="true">sync</span>
        </button>
        <button onClick={() => setNotifOpen((o) => !o)} className="p-2 rounded-full hover:bg-surface-container-high text-on-surface-variant transition-all relative" aria-label="Notifications">
          <span className="material-symbols-outlined" aria-hidden="true">notifications</span>
          <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-surface" aria-hidden="true"></span>
          {notifOpen && (
            <div className="absolute top-full right-0 mt-2 w-72 bg-surface-container-lowest border border-outline-variant/10 rounded-xl shadow-2xl p-4 text-left z-50" onClick={(e) => e.stopPropagation()}>
              <p className="text-label-md font-semibold text-on-surface mb-2">Notifications</p>
              <p className="text-body-md text-on-surface-variant/80">No new notifications</p>
            </div>
          )}
        </button>
        <div className="h-8 w-px bg-outline-variant/30 mx-2" aria-hidden="true"></div>
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setProfileOpen((o) => !o)}
            className="flex items-center gap-3 pl-2 rounded-xl hover:bg-surface-container-high pr-2 py-1 transition-colors"
            aria-label="Profile menu"
            aria-expanded={profileOpen}
          >
            <div className="text-right hidden lg:block">
              <p className="text-label-md font-semibold text-on-surface">{displayName}</p>
              <p className="text-[10px] text-on-surface-variant">Freelancer</p>
            </div>
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="w-10 h-10 rounded-full border-2 border-surface-container-high object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-secondary-container border-2 border-surface-container-high flex items-center justify-center text-on-secondary-container font-bold text-sm" aria-hidden="true">
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
