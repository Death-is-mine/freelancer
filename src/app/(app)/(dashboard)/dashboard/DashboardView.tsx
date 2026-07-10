"use client"

import { useRouter } from "next/navigation"
import { getProjects, getLeads, evaluateRules, type Project, type Lead } from "@/lib/store"
import { useEffect, useState, useRef } from "react"
import { useSession } from "next-auth/react"

function useTime() {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 30000)
    return () => clearInterval(id)
  }, [])
  return time
}

function formatDate(d: Date) {
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })
}

function formatTime(d: Date) {
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
}

function getGreeting(h: number) {
  if (h < 12) return "Good morning"
  if (h < 17) return "Good afternoon"
  return "Good evening"
}

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

function tomorrowStr() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

function next7Days() {
  const dates: string[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date()
    d.setDate(d.getDate() + i)
    dates.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`)
  }
  return dates
}

function formatDeadlineLabel(d: string) {
  const today = todayStr()
  const tomorrow = tomorrowStr()
  if (d === today) return "Today"
  if (d === tomorrow) return "Tomorrow"
  const date = new Date(d + "T12:00:00")
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
}

interface CalendarEvent {
  id: string; summary: string; start: string; end: string; link: string
}

function formatEventTime(iso: string) {
  const d = new Date(iso)
  if (iso.length <= 10) return iso
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
}

export function DashboardView() {
  const router = useRouter()
  const { data: session } = useSession()
  const now = useTime()
  const [projects, setProjects] = useState<Project[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [loaded, setLoaded] = useState(false)
  const [calEvents, setCalEvents] = useState<CalendarEvent[]>([])
  const [calError, setCalError] = useState(false)

  useEffect(() => {
    setProjects(getProjects())
    setLeads(getLeads())
    setLoaded(true)
  }, [])

  const pjs = loaded ? projects : []
  const lds = loaded ? leads : []

  useEffect(() => {
    fetch("/api/calendar/events").then((r) => r.ok ? r.json() : null).then((d) => { if (d?.events) setCalEvents(d.events); else setCalError(true) }).catch(() => setCalError(true))
  }, [])
  const userName = session?.user?.name || "Freelancer"

  const checkRef = useRef(false)
  useEffect(() => {
    if (checkRef.current) return
    checkRef.current = true
    const p = getProjects()
    const overdue = p.filter((x) => x.dueDate !== "—" && x.amountStatus === "Pending" && new Date(x.dueDate) < new Date())
    overdue.forEach((x) => evaluateRules("invoice.overdue", { projectId: x.id, client: x.client, number: x.invoiceNum }))
  }, [])

  const totalOutstanding = pjs
    .filter((p) => p.amountStatus === "Pending" || p.amountStatus === "Overdue")
    .reduce((s, p) => s + (Number(p.amount.replace(/[^0-9.]/g, "")) || 0), 0)
  const overdueCount = pjs.filter((p) => p.amountStatus === "Overdue").length
  const dueToday = pjs.filter((p) => p.dueDate === todayStr())
  const dueTomorrow = pjs.filter((p) => p.dueDate === tomorrowStr())
  const pendingAgreements = pjs.filter((p) => p.agreementNum === "—")
  const invoicesAwaiting = pjs.filter((p) => p.invoiceNum !== "—" && (p.amountStatus === "Pending" || p.amountStatus === "Overdue"))
  const newLeads = lds.filter((l) => l.status === "New")
  const upcomingDeadlines = next7Days().flatMap((d) => pjs.filter((p) => p.dueDate === d && p.dueDate !== "—"))
  const recentActivity = [
    ...pjs.slice(0, 5).map((p) => ({ type: "project" as const, text: `New project: ${p.requirement}`, client: p.client })),
    ...lds.filter((l) => l.status === "Converted").slice(0, 3).map((l) => ({ type: "lead" as const, text: `Lead converted: ${l.name}`, client: l.company })),
  ]

  if (!loaded) return null

  return (
    <>
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-headline-xl text-on-surface tracking-tight font-bold">
            {now ? `${getGreeting(now.getHours())}, ${userName.split(" ")[0]}` : "Good morning"}
          </h1>
          {now && (
            <p className="text-body-lg text-on-surface-variant mt-1">
              <span className="font-semibold">{formatTime(now)}</span>
              <span className="mx-2 text-outline">·</span>
              {formatDate(now)}
            </p>
          )}
        </div>
      </div>

      {overdueCount > 0 && (
        <div className="mb-6 p-5 rounded-xl bg-error-container text-on-error-container border border-error/10 flex items-center gap-4">
          <span className="material-symbols-outlined text-2xl" aria-hidden="true">warning</span>
          <div className="flex-1">
            <p className="font-semibold text-label-md">{overdueCount} {overdueCount === 1 ? "invoice is" : "invoices are"} overdue</p>
            <p className="text-body-md text-on-error-container/80">Outstanding balance: ${totalOutstanding.toLocaleString()}</p>
          </div>
          <button onClick={() => router.push("/payments")} className="px-4 py-2 rounded-lg bg-error text-on-error text-label-md font-bold hover:bg-error/90 transition-colors">
            View Payments
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/5 shadow-sm">
          <div className="flex items-center gap-3 mb-1">
            <span className="material-symbols-outlined text-error" aria-hidden="true">payments</span>
            <span className="text-label-md text-on-surface-variant uppercase tracking-wider">Outstanding</span>
          </div>
          <p className="text-headline-lg font-bold text-on-surface mt-2">${totalOutstanding.toLocaleString()}</p>
          <p className="text-body-md text-on-surface-variant mt-1">{overdueCount > 0 ? `${overdueCount} overdue` : "All paid"}</p>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/5 shadow-sm">
          <div className="flex items-center gap-3 mb-1">
            <span className="material-symbols-outlined text-primary" aria-hidden="true">calendar_today</span>
            <span className="text-label-md text-on-surface-variant uppercase tracking-wider">Due Today</span>
          </div>
          <p className="text-headline-lg font-bold text-on-surface mt-2">{dueToday.length}</p>
          <p className="text-body-md text-on-surface-variant mt-1">{dueToday.length ? dueToday.map((p) => p.client).join(", ") : "Nothing due today"}</p>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/5 shadow-sm">
          <div className="flex items-center gap-3 mb-1">
            <span className="material-symbols-outlined text-secondary" aria-hidden="true">upcoming</span>
            <span className="text-label-md text-on-surface-variant uppercase tracking-wider">Due Tomorrow</span>
          </div>
          <p className="text-headline-lg font-bold text-on-surface mt-2">{dueTomorrow.length}</p>
          <p className="text-body-md text-on-surface-variant mt-1">{dueTomorrow.length ? dueTomorrow.map((p) => p.client).join(", ") : "Clear tomorrow"}</p>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/5 shadow-sm">
          <div className="flex items-center gap-3 mb-1">
            <span className="material-symbols-outlined text-tertiary" aria-hidden="true">contract</span>
            <span className="text-label-md text-on-surface-variant uppercase tracking-wider">Pending Agreements</span>
          </div>
          <p className="text-headline-lg font-bold text-on-surface mt-2">{pendingAgreements.length}</p>
          <p className="text-body-md text-on-surface-variant mt-1">{pendingAgreements.length ? `${pendingAgreements.length} need agreements` : "All set"}</p>
        </div>
      </div>

      {upcomingDeadlines.length > 0 && (
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/5 shadow-sm mb-8">
          <h3 className="text-title-lg text-on-surface mb-4">Upcoming Deadlines</h3>
          <div className="space-y-3">
            {upcomingDeadlines.slice(0, 10).map((p) => (
              <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low hover:bg-surface-container-high transition-colors cursor-pointer" onClick={() => router.push(`/projects/${p.id}`)}>
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${p.dueDate === todayStr() ? "bg-error/10 text-error" : "bg-primary/10 text-primary"}`}>
                    <span className="material-symbols-outlined text-[20px]" aria-hidden="true">event</span>
                  </div>
                  <div>
                    <p className="text-body-md font-medium text-on-surface">{p.requirement}</p>
                    <p className="text-label-sm text-on-surface-variant">{p.client}</p>
                  </div>
                </div>
                <span className={`text-label-sm font-semibold px-3 py-1 rounded-full ${p.dueDate === todayStr() ? "bg-error/10 text-error" : "bg-secondary-container/30 text-secondary"}`}>
                  {formatDeadlineLabel(p.dueDate)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {calEvents.length > 0 && (
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/5 shadow-sm mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-title-lg text-on-surface">Upcoming Calendar Events</h3>
            {!calError && <span className="text-label-sm text-on-surface-variant/60">Next 7 days</span>}
          </div>
          <div className="space-y-2">
            {calEvents.slice(0, 5).map((e) => (
              <a key={e.id} href={e.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-3 rounded-lg hover:bg-surface-container-low transition-colors group">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                  <span className="material-symbols-outlined text-[20px]" aria-hidden="true">event</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-body-md font-medium text-on-surface truncate group-hover:text-primary transition-colors">{e.summary}</p>
                  <p className="text-label-sm text-on-surface-variant">{formatEventTime(e.start)}{e.end ? ` – ${formatEventTime(e.end)}` : ""}</p>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant/40 text-[18px] opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true">open_in_new</span>
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/5 shadow-sm">
          <h3 className="text-title-lg text-on-surface mb-4">Invoices Awaiting Payment</h3>
          {invoicesAwaiting.length === 0 ? (
            <p className="text-body-md text-on-surface-variant">No outstanding invoices</p>
          ) : (
            <div className="space-y-3">
              {invoicesAwaiting.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low hover:bg-surface-container-high transition-colors">
                  <div>
                    <p className="text-body-md font-medium text-on-surface">{p.client}</p>
                    <p className="text-label-md text-on-surface-variant">{p.invoiceNum} · {p.dueDate}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-body-md font-semibold text-on-surface">{p.amount}</p>
                    <span className={`text-label-sm font-bold ${p.amountStatus === "Overdue" ? "text-error" : "text-warning"}`}>{p.amountStatus}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          {invoicesAwaiting.length > 0 && (
            <button onClick={() => router.push("/payments")} className="mt-4 w-full py-2.5 text-label-md font-bold text-primary hover:bg-primary/5 rounded-xl transition-all">
              View All Payments
            </button>
          )}
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/5 shadow-sm">
          <h3 className="text-title-lg text-on-surface mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => router.push("/leads")} className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/5 hover:border-primary/20 hover:bg-primary/5 transition-all text-left">
              <span className="material-symbols-outlined text-primary" aria-hidden="true">leaderboard</span>
              <p className="text-body-md font-semibold text-on-surface mt-2">New Lead</p>
              <p className="text-label-sm text-on-surface-variant">Add a lead</p>
            </button>
            <button onClick={() => router.push("/projects?new=true")} className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/5 hover:border-primary/20 hover:bg-primary/5 transition-all text-left">
              <span className="material-symbols-outlined text-primary" aria-hidden="true">work</span>
              <p className="text-body-md font-semibold text-on-surface mt-2">New Project</p>
              <p className="text-label-sm text-on-surface-variant">Start working</p>
            </button>
            <button onClick={() => router.push("/tasks")} className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/5 hover:border-primary/20 hover:bg-primary/5 transition-all text-left">
              <span className="material-symbols-outlined text-primary" aria-hidden="true">assignment</span>
              <p className="text-body-md font-semibold text-on-surface mt-2">New Task</p>
              <p className="text-label-sm text-on-surface-variant">Track work</p>
            </button>
            <button onClick={() => router.push("/projects")} className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/5 hover:border-primary/20 hover:bg-primary/5 transition-all text-left">
              <span className="material-symbols-outlined text-primary" aria-hidden="true">contract</span>
              <p className="text-body-md font-semibold text-on-surface mt-2">Agreement</p>
              <p className="text-label-sm text-on-surface-variant">Manage agreements</p>
            </button>
          </div>
          <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/10">
            <p className="text-body-md font-semibold text-on-surface">New leads ready</p>
            <p className="text-label-md text-on-surface-variant mt-1">{newLeads.length} {newLeads.length === 1 ? "lead needs" : "leads need"} attention</p>
            {newLeads.length > 0 && (
              <button onClick={() => router.push("/leads")} className="mt-3 px-4 py-2 rounded-lg bg-primary text-on-primary text-label-md font-bold hover:bg-primary/90 transition-colors">
                View Leads
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/5 shadow-sm mb-8">
        <h3 className="text-title-lg text-on-surface mb-4">Recent Activity</h3>
        {recentActivity.length === 0 ? (
          <p className="text-body-md text-on-surface-variant">No activity yet. Create your first project to get started.</p>
        ) : (
          <div className="space-y-4">
            {recentActivity.map((a, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-lg hover:bg-surface-container-low transition-colors">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${a.type === "project" ? "bg-primary/10 text-primary" : "bg-secondary-container/30 text-secondary"}`}>
                  <span className="material-symbols-outlined text-[20px]" aria-hidden="true">{a.type === "project" ? "work" : "conversion_path"}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-body-md text-on-surface font-medium truncate">{a.text}</p>
                  <p className="text-label-sm text-on-surface-variant">{a.client}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
