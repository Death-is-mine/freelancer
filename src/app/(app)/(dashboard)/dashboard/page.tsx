import { Suspense } from "react"
import { DashboardView } from "./DashboardView"

function DashboardFallback() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-4 w-40 bg-surface-container-high rounded" />
          <div className="h-8 w-64 bg-surface-container-high rounded-lg" />
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-28 bg-surface-container-high rounded-xl" />
          <div className="h-10 w-28 bg-surface-container-high rounded-xl" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/5">
            <div className="h-10 w-10 bg-surface-container-high rounded-xl mb-4" />
            <div className="h-3 w-20 bg-surface-container-high rounded mb-2" />
            <div className="h-7 w-28 bg-surface-container-high rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardFallback />}>
      <DashboardView />
    </Suspense>
  )
}
