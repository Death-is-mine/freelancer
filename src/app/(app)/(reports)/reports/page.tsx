"use client"

import { useState } from "react"

const reportData = {
  "Revenue Report": { icon: "bar_chart", data: [{ month: "Jan", rev: 42000 }, { month: "Feb", rev: 38500 }, { month: "Mar", rev: 51000 }, { month: "Apr", rev: 47200 }, { month: "May", rev: 53800 }, { month: "Jun", rev: 49200 }] },
  "Client Report": { icon: "group", data: [{ month: "Jan", total: 18 }, { month: "Feb", total: 22 }, { month: "Mar", total: 27 }, { month: "Apr", total: 31 }, { month: "May", total: 36 }, { month: "Jun", total: 42 }] },
  "Project Report": { icon: "work", data: [{ month: "Jan", completed: 3 }, { month: "Feb", completed: 5 }, { month: "Mar", completed: 7 }, { month: "Apr", completed: 4 }, { month: "May", completed: 8 }, { month: "Jun", completed: 6 }] },
}

export default function ReportsPage() {
  const [selected, setSelected] = useState<string | null>(null)

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
            <div className="space-y-3">
              {reportData[selected as keyof typeof reportData].data.map((d: Record<string, string | number>, i: number) => (
                <div key={i} className="flex items-center gap-4">
                  <span className="text-label-md text-on-surface-variant w-16">{String(d.month)}</span>
                  <div className="flex-1 h-6 bg-surface-container-high rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${Math.min(100, (Number(Object.values(d)[1]) / 60) * 100)}%` }}></div>
                  </div>
                  <span className="text-label-md font-semibold text-on-surface w-20 text-right">{String(Object.values(d)[1])}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(reportData).map(([title, r], i) => (
            <button key={i} onClick={() => setSelected(title)} className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/5 shadow-sm hover:shadow-md transition-shadow cursor-pointer text-left">
              <span className="material-symbols-outlined text-3xl text-primary" aria-hidden="true">{r.icon}</span>
              <h3 className="text-title-lg text-on-surface mt-4 mb-1">{title}</h3>
              <p className="text-body-md text-on-surface-variant">
                {title === "Revenue Report" ? "Monthly, quarterly, and annual revenue breakdowns" :
                 title === "Client Report" ? "Client acquisition, retention, and LTV analysis" :
                 "Project completion rates, budget tracking, and profitability"}
              </p>
            </button>
          ))}
        </div>
      )}
    </>
  )
}
