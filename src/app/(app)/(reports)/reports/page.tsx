"use client"

import { useState, useEffect } from "react"
import { getProjects, getLeads } from "@/lib/store"

interface ReportRow { month: string; value: number }
interface LeadSourceRow { source: string; total: number; converted: number; rate: string }

type ReportData = Record<string, { icon: string; data: ReportRow[] }>

const emptyReports: ReportData = {
  "Revenue Report": { icon: "bar_chart", data: [] },
  "Client Report": { icon: "group", data: [] },
  "Project Report": { icon: "work", data: [] },
  "Lead Sources": { icon: "leaderboard", data: [] },
}

function buildReports(): ReportData {
  const projects = getProjects()
  const leads = getLeads()
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  const revByMonth = new Array(12).fill(0)
  const clientsByMonth = new Array(12).fill(0)
  const projByMonth = new Array(12).fill(0)
  const seen = new Set<string>()

  projects.forEach(p => {
    const m = new Date().getMonth()
    revByMonth[m] += Number(p.amount.replace(/[^0-9.]/g, "")) || 0
    if (!seen.has(p.client)) { seen.add(p.client); clientsByMonth[m]++ }
    projByMonth[m]++
  })

  const bySource = new Map<string, { total: number; converted: number }>()
  leads.forEach(l => {
    const s = l.source || "Unknown"
    if (!bySource.has(s)) bySource.set(s, { total: 0, converted: 0 })
    const entry = bySource.get(s)!
    entry.total++
    if (l.status === "Converted") entry.converted++
  })

  const sourceData: ReportRow[] = [...bySource.entries()]
    .sort((a, b) => b[1].total - a[1].total)
    .map(([source, counts]) => ({
      month: source,
      value: counts.total > 0 ? Math.round((counts.converted / counts.total) * 100) : 0,
    }))

  return {
    "Revenue Report": { icon: "bar_chart", data: months.map((month, i) => ({ month, value: revByMonth[i] })).filter(r => r.value > 0) },
    "Client Report": { icon: "group", data: months.map((month, i) => ({ month, value: clientsByMonth[i] })).filter(r => r.value > 0) },
    "Project Report": { icon: "work", data: months.map((month, i) => ({ month, value: projByMonth[i] })).filter(r => r.value > 0) },
    "Lead Sources": { icon: "leaderboard", data: sourceData },
  }
}

function maxValue(data: ReportRow[]) {
  return data.reduce((m, r) => Math.max(m, r.value), 0) || 1
}

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData>(emptyReports)
  const [selected, setSelected] = useState<string | null>(null)

  useEffect(() => { setReportData(buildReports()) }, [])

  return (
    <>
      <h2 className="text-headline-lg tracking-tight text-on-surface mb-8">Reports</h2>

      {selected ? (
        <div>
          <button onClick={() => setSelected(null)} className="flex items-center gap-2 text-label-md text-primary font-semibold mb-6 hover:underline">
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">arrow_back</span>
            Back to reports
          </button>
          <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/5">
            <h3 className="text-title-lg text-on-surface mb-4">{selected}</h3>
            {reportData[selected]?.data.length === 0 ? (
              <p className="text-body-md text-on-surface-variant">{selected === "Lead Sources" ? "Import leads to see conversion by source." : "No data yet. Create projects to see reports."}</p>
            ) : selected === "Lead Sources" ? (
              <div className="space-y-3">
                {(() => {
                  const leads = getLeads()
                  const bySource = new Map<string, { total: number; converted: number }>()
                  leads.forEach(l => {
                    const s = l.source || "Unknown"
                    if (!bySource.has(s)) bySource.set(s, { total: 0, converted: 0 })
                    const entry = bySource.get(s)!
                    entry.total++
                    if (l.status === "Converted") entry.converted++
                  })
                  const sorted = [...bySource.entries()].sort((a, b) => b[1].total - a[1].total)
                  const maxTotal = sorted.reduce((m, [, v]) => Math.max(m, v.total), 1)
                  return sorted.map(([source, counts], i) => (
                    <div key={i} className="flex items-center gap-4">
                      <span className="text-label-md text-on-surface-variant w-28 truncate" title={source}>{source}</span>
                      <div className="flex-1 h-6 bg-surface-container-high rounded-full overflow-hidden relative">
                        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(counts.total / maxTotal) * 100}%` }}></div>
                      </div>
                      <span className="text-label-md font-semibold text-on-surface w-12 text-right">{counts.total}</span>
                      <span className="text-label-md text-secondary w-16 text-right">{counts.converted}/{counts.total}</span>
                      <span className="text-label-md font-semibold text-on-surface w-14 text-right">{counts.total > 0 ? `${Math.round((counts.converted / counts.total) * 100)}%` : "—"}</span>
                    </div>
                  ))
                })()}
              </div>
            ) : (
              <div className="space-y-3">
                {reportData[selected].data.map((d, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <span className="text-label-md text-on-surface-variant w-16">{d.month}</span>
                    <div className="flex-1 h-6 bg-surface-container-high rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(d.value / maxValue(reportData[selected].data)) * 100}%` }}></div>
                    </div>
                    <span className="text-label-md font-semibold text-on-surface w-20 text-right">{d.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Object.entries(reportData).map(([title, r], i) => (
            <button key={i} onClick={() => setSelected(title)} className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/5 shadow-sm hover:shadow-md transition-shadow cursor-pointer text-left">
              <span className="material-symbols-outlined text-3xl text-primary" aria-hidden="true">{r.icon}</span>
              <h3 className="text-title-lg text-on-surface mt-4 mb-1">{title}</h3>
              <p className="text-body-md text-on-surface-variant">
                {title === "Revenue Report" ? "Monthly revenue from projects" :
                 title === "Client Report" ? "Unique clients per month" :
                 title === "Lead Sources" ? "Conversion rate by lead source" :
                 "Projects created per month"}
              </p>
            </button>
          ))}
        </div>
      )}
    </>
  )
}
