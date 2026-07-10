"use client"

import { useEffect, useRef, useState } from "react"

const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL"]
const revenueValues = [85, 90, 75, 80, 95, 92, 88]
const expenseValues = [40, 55, 45, 70, 60, 85, 90]

export function BarChart() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  const [barHeights, setBarHeights] = useState<{ rev: number; exp: number }[]>([])

  useEffect(() => {
    setMounted(true)
    const el = containerRef.current
    if (!el) return
    const h = el.clientHeight
    setBarHeights(
      months.map((_, i) => ({
        rev: Math.round((revenueValues[i] / 100) * h),
        exp: Math.round((expenseValues[i] / 100) * h),
      })),
    )
  }, [])

  return (
    <div className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant/5 shadow-sm">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h4 className="text-title-lg text-on-surface">Financial Performance</h4>
          <p className="text-body-md text-on-surface-variant">Revenue vs Expenses (Year to Date)</p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-primary"></span>
            <span className="text-label-md text-on-surface-variant">Revenue</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-secondary-fixed-dim"></span>
            <span className="text-label-md text-on-surface-variant">Expenses</span>
          </div>
        </div>
      </div>
      <div ref={containerRef} className="relative h-[280px] w-full flex items-end justify-between gap-4 px-2">
        {months.map((m, i) => {
          const maxH = barHeights[i]?.exp ?? 0
          const revH = barHeights[i]?.rev ?? 0
          return (
            <div key={m} className="flex-1 flex flex-col justify-end gap-1 h-full">
              <div className="relative w-full bg-secondary-fixed-dim/20 rounded-t-lg transition-all duration-700" style={{ height: maxH || 1 }}>
                {mounted && (
                  <div
                    className="absolute bottom-0 w-full bg-primary rounded-t-lg transition-all duration-1000 ease-out"
                    style={{ height: `${revH}px`, maxHeight: "100%" }}
                  />
                )}
              </div>
              <span className="text-center text-[10px] text-on-surface-variant font-bold mt-2">{m}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
