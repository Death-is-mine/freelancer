"use client"

import { useState, useEffect } from "react"
import { getProjects } from "@/lib/store"

interface ReportRow { month: string; value: number }

type ReportData = Record<string, { icon: string; data: ReportRow[] }>

const emptyReports: ReportData = {
  "Revenue Report": { icon: "bar_chart", data: [] },
  "Client Report": { icon: "group", data: [] },
  "Project Report": { icon: "work", data: [] },
}

function buildReports(): ReportData {
  const projects = getProjects()
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

  return {
    "Revenue Report": { icon: "bar_chart", data: months.map((month, i) => ({ month, value: revByMonth[i] })).filter(r => r.value > 0) },
    "Client Report": { icon: "group", data: months.map((month, i) => ({ month, value: clientsByMonth[i] })).filter(r => r.value > 0) },
    "Project Report": { icon: "work", data: months.map((month, i) => ({ month, value: projByMonth[i] })).filter(r => r.value > 0) },
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
      <nav className="flex items-center gap-2 text-on-surface-variant mb-1">
        <span className="text-label-md">Analytics</span>
        <span className="text-on-surface-variant/30">/</span>
        <span className="text-label-md font-semibold text-on-surface">Reports</span>
      </nav>
      <h2 className="text-headline-lg tracking-tight text-on-surface mb-8">Reports & Analytics</h2>

      {selected ? (
        <div>
          <button onClick={() => setSelected(null)} className="flex items-center gap-2 text-label-md text-primary font-semibold mb-6 hover:underline">
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">arrow_back</span>
            Back to reports
          </button>
          <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/5">
            <h3 className="text-title-lg text-on-surface mb-4">{selected}</h3>
            {reportData[selected]?.data.length === 0 ? (
              <p className="text-body-md text-on-surface-variant">No data yet. Create projects to see reports.</p>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(reportData).map(([title, r], i) => (
            <button key={i} onClick={() => setSelected(title)} className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/5 shadow-sm hover:shadow-md transition-shadow cursor-pointer text-left">
              <span className="material-symbols-outlined text-3xl text-primary" aria-hidden="true">{r.icon}</span>
              <h3 className="text-title-lg text-on-surface mt-4 mb-1">{title}</h3>
              <p className="text-body-md text-on-surface-variant">
                {title === "Revenue Report" ? "Monthly revenue from projects" :
                 title === "Client Report" ? "Unique clients per month" :
                 "Projects created per month"}
              </p>
            </button>
          ))}
        </div>
      )}
    </>
  )
}
