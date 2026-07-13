'use client'

import { useRouter } from 'next/navigation'
import {
  getProjects,
  getLeads,
  evaluateRules,
  formatNumber,
  type Project,
  type Lead,
} from '@/lib/store'
import { useEffect, useState, useRef } from 'react'

function getGreeting(h: number) {
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function tomorrowStr() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function next7Days() {
  const dates: string[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date()
    d.setDate(d.getDate() + i)
    dates.push(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
    )
  }
  return dates
}

function formatDeadlineLabel(d: string) {
  const today = todayStr()
  const tomorrow = tomorrowStr()
  if (d === today) return 'Today'
  if (d === tomorrow) return 'Tomorrow'
  const date = new Date(d + 'T12:00:00')
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

type GraphPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly'

export function DashboardView() {
  const router = useRouter()
  const [greeting] = useState(() => getGreeting(new Date().getHours()))
  const [projects, setProjects] = useState<Project[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [loaded, setLoaded] = useState(false)
  const [graphPeriod, setGraphPeriod] = useState<GraphPeriod>('monthly')

  useEffect(() => {
    setProjects(getProjects())
    setLeads(getLeads())
    setLoaded(true)
  }, [])

  const pjs = loaded ? projects : []
  const lds = loaded ? leads : []

  const checkRef = useRef(false)
  useEffect(() => {
    if (checkRef.current) return
    checkRef.current = true
    const p = getProjects()
    const overdue = p.filter(
      (x) => x.dueDate !== '—' && x.amountStatus === 'Pending' && new Date(x.dueDate) < new Date(),
    )
    overdue.forEach((x) =>
      evaluateRules('invoice.overdue', { projectId: x.id, client: x.client, number: x.invoiceNum }),
    )
  }, [])

  const totalOutstanding = pjs
    .filter((p) => p.amountStatus === 'Pending' || p.amountStatus === 'Overdue')
    .reduce((s, p) => s + (Number(p.amount.replace(/[^0-9.]/g, '')) || 0), 0)
  const overdueCount = pjs.filter((p) => p.amountStatus === 'Overdue').length
  const pendingAgreements = pjs.filter((p) => p.agreementNum === '—').length
  const invoicesAwaiting = pjs.filter(
    (p) => p.invoiceNum !== '—' && (p.amountStatus === 'Pending' || p.amountStatus === 'Overdue'),
  )
  const newLeadsCount = lds.filter((l) => l.status === 'New').length
  const upcomingDeadlines = next7Days().flatMap((d) =>
    pjs.filter((p) => p.dueDate === d && p.dueDate !== '—'),
  )
  const recentActivity = [
    ...pjs.slice(0, 5).map((p) => ({
      type: 'project' as const,
      text: `New project: ${p.requirement}`,
      client: p.client,
    })),
    ...lds
      .filter((l) => l.status === 'Converted')
      .slice(0, 3)
      .map((l) => ({
        type: 'lead' as const,
        text: `Lead converted: ${l.name}`,
        client: l.company,
      })),
  ]

  const graphData = {
    'New Leads': newLeadsCount,
    Converted: lds.filter((l) => l.status === 'Converted').length,
    Lost: lds.filter((l) => l.status === 'Lost').length,
    Won: pjs.filter((p) => p.amountStatus === 'Paid').length,
    Pipeline: pjs.filter((p) => p.amountStatus === 'Pending').length,
  }

  const graphMax = Math.max(...Object.values(graphData), 1)
  const graphColors: Record<string, string> = {
    'New Leads': 'bg-primary',
    Converted: 'bg-secondary',
    Lost: 'bg-error',
    Won: 'bg-success',
    Pipeline: 'bg-warning',
  }

  if (!loaded) return null

  return (
    <>
      <div className="mb-8 flex items-start justify-between">
        <h1 className="text-headline-xl text-on-surface tracking-tight font-bold">{greeting}</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/leads')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-high text-on-surface text-body-md font-semibold hover:bg-surface-container-highest transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
              leaderboard
            </span>
            New Lead
          </button>
          <button
            onClick={() => router.push('/projects?new=true')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-on-primary font-semibold text-body-md shadow-lg shadow-primary/10"
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
              add
            </span>
            New Project
          </button>
        </div>
      </div>

      {overdueCount > 0 && (
        <div className="mb-6 p-5 rounded-xl bg-error-container text-on-error-container border border-error/10 flex items-center gap-4">
          <span className="material-symbols-outlined text-2xl" aria-hidden="true">
            warning
          </span>
          <div className="flex-1">
            <p className="font-semibold text-label-md">
              {overdueCount} {overdueCount === 1 ? 'invoice is' : 'invoices are'} overdue
            </p>
            <p className="text-body-md text-on-error-container/80">
              Outstanding balance: {formatNumber(totalOutstanding)}
            </p>
          </div>
          <button
            onClick={() => router.push('/payments')}
            className="px-4 py-2 rounded-lg bg-error text-on-error text-label-md font-bold hover:bg-error/90 transition-colors"
          >
            View Payments
          </button>
        </div>
      )}

      <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/5 shadow-sm mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-title-lg text-on-surface font-semibold">Lead Conversion</h3>
          <div className="flex gap-1 bg-surface-container-high rounded-lg p-0.5">
            {(['daily', 'weekly', 'monthly', 'yearly'] as GraphPeriod[]).map((p) => (
              <button
                key={p}
                onClick={() => setGraphPeriod(p)}
                className={`px-3 py-1.5 rounded-md text-label-sm capitalize ${graphPeriod === p ? 'bg-surface-container-lowest text-on-surface font-semibold shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-5 gap-4">
          {Object.entries(graphData).map(([label, value]) => (
            <div key={label} className="text-center">
              <div className="h-32 flex items-end justify-center mb-2">
                <div
                  className={`w-8 rounded-t-lg transition-all ${graphColors[label]}`}
                  style={{ height: `${(value / graphMax) * 100}%` }}
                ></div>
              </div>
              <p className="text-headline-md font-bold text-on-surface">{value}</p>
              <p className="text-label-sm text-on-surface-variant">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/5 shadow-sm">
          <div className="flex items-center gap-3 mb-1">
            <span className="material-symbols-outlined text-error" aria-hidden="true">
              payments
            </span>
            <span className="text-label-md text-on-surface-variant uppercase tracking-wider">
              Outstanding
            </span>
          </div>
          <p className="text-headline-md font-bold text-on-surface mt-2">
            {formatNumber(totalOutstanding)}
          </p>
          <p className="text-body-md text-on-surface-variant mt-1">
            {overdueCount > 0 ? `${overdueCount} overdue` : 'All paid'}
          </p>
        </div>
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/5 shadow-sm">
          <div className="flex items-center gap-3 mb-1">
            <span className="material-symbols-outlined text-warning" aria-hidden="true">
              assignment_late
            </span>
            <span className="text-label-md text-on-surface-variant uppercase tracking-wider">
              Overdue Projects
            </span>
          </div>
          <p className="text-headline-md font-bold text-on-surface mt-2">{overdueCount}</p>
          <p className="text-body-md text-on-surface-variant mt-1">
            {overdueCount > 0 ? 'Require attention' : 'All on track'}
          </p>
        </div>
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/5 shadow-sm">
          <div className="flex items-center gap-3 mb-1">
            <span className="material-symbols-outlined text-tertiary" aria-hidden="true">
              contract
            </span>
            <span className="text-label-md text-on-surface-variant uppercase tracking-wider">
              Pending Agreements
            </span>
          </div>
          <p className="text-headline-md font-bold text-on-surface mt-2">{pendingAgreements}</p>
          <p className="text-body-md text-on-surface-variant mt-1">
            {pendingAgreements > 0 ? `${pendingAgreements} need signatures` : 'All set'}
          </p>
        </div>
      </div>

      {upcomingDeadlines.length > 0 && (
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/5 shadow-sm mb-8">
          <h3 className="text-title-lg text-on-surface mb-4">Upcoming Deadlines</h3>
          <div className="space-y-3">
            {upcomingDeadlines.slice(0, 10).map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low hover:bg-surface-container-high transition-colors cursor-pointer"
                onClick={() => router.push(`/projects/${p.id}`)}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${p.dueDate === todayStr() ? 'bg-error/10 text-error' : 'bg-primary/10 text-primary'}`}
                  >
                    <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                      event
                    </span>
                  </div>
                  <div>
                    <p className="text-body-md font-medium text-on-surface">{p.requirement}</p>
                    <p className="text-label-sm text-on-surface-variant">{p.client}</p>
                  </div>
                </div>
                <span
                  className={`text-label-sm font-semibold px-3 py-1 rounded-full ${p.dueDate === todayStr() ? 'bg-error/10 text-error' : 'bg-secondary-container/30 text-secondary'}`}
                >
                  {formatDeadlineLabel(p.dueDate)}
                </span>
              </div>
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
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low hover:bg-surface-container-high transition-colors"
                >
                  <div>
                    <p className="text-body-md font-medium text-on-surface">{p.client}</p>
                    <p className="text-label-md text-on-surface-variant">
                      {p.invoiceNum} · {p.dueDate}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-body-md font-semibold text-on-surface">{p.amount}</p>
                    <span
                      className={`text-label-sm font-bold ${p.amountStatus === 'Overdue' ? 'text-error' : 'text-warning'}`}
                    >
                      {p.amountStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
          {invoicesAwaiting.length > 0 && (
            <button
              onClick={() => router.push('/payments')}
              className="mt-4 w-full py-2.5 text-label-md font-bold text-primary hover:bg-primary/5 rounded-xl transition-all"
            >
              View All Payments
            </button>
          )}
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/5 shadow-sm">
          <h3 className="text-title-lg text-on-surface mb-4">Recent Activity</h3>
          {recentActivity.length === 0 ? (
            <p className="text-body-md text-on-surface-variant">
              No activity yet. Create your first project to get started.
            </p>
          ) : (
            <div className="space-y-4">
              {recentActivity.map((a, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-surface-container-low transition-colors"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${a.type === 'project' ? 'bg-primary/10 text-primary' : 'bg-secondary-container/30 text-secondary'}`}
                  >
                    <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                      {a.type === 'project' ? 'work' : 'conversion_path'}
                    </span>
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
      </div>
    </>
  )
}
