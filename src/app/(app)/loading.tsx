export default function AppLoading() {
  return (
    <div className="animate-pulse space-y-6" role="status" aria-label="Loading content">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-4 w-24 bg-surface-container-high rounded" aria-hidden="true" />
          <div className="h-8 w-48 bg-surface-container-high rounded-lg" aria-hidden="true" />
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-24 bg-surface-container-high rounded-xl" aria-hidden="true" />
          <div className="h-10 w-32 bg-surface-container-high rounded-xl" aria-hidden="true" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/5">
            <div className="h-4 w-20 bg-surface-container-high rounded mb-4" aria-hidden="true" />
            <div className="h-8 w-28 bg-surface-container-high rounded-lg mb-2" aria-hidden="true" />
            <div className="h-3 w-24 bg-surface-container-high rounded" aria-hidden="true" />
          </div>
        ))}
      </div>
      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/10 overflow-hidden">
        <div className="h-14 bg-surface-container-high/50" aria-hidden="true" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 border-t border-outline-variant/5 flex items-center px-6 gap-4" aria-hidden="true">
            <div className="h-10 w-10 bg-surface-container-high rounded-full" aria-hidden="true" />
            <div className="h-4 w-40 bg-surface-container-high rounded flex-1" aria-hidden="true" />
            <div className="h-4 w-20 bg-surface-container-high rounded" aria-hidden="true" />
            <div className="h-4 w-32 bg-surface-container-high rounded" aria-hidden="true" />
            <div className="h-4 w-16 bg-surface-container-high rounded" aria-hidden="true" />
          </div>
        ))}
      </div>
      <span className="sr-only">Loading page content...</span>
    </div>
  )
}
