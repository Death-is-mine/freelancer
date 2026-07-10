import { Sidebar } from "@/components/layout/Sidebar"
import { TopNav } from "@/components/layout/TopNav"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { CommandPalette } from "@/components/CommandPalette"
import { UndoHandler } from "@/components/UndoHandler"
import { Suspense } from "react"
import { SessionProvider } from "next-auth/react"

function SidebarFallback() {
  return (
    <aside className="fixed top-0 left-0 h-screen w-sidebar bg-surface-container-lowest border-r border-outline-variant/10 z-50 flex flex-col p-4 animate-pulse" aria-hidden="true">
      <div className="h-8 w-32 bg-surface-container-high rounded-lg mb-8" />
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-10 w-full bg-surface-container-high rounded-lg mb-2" />
      ))}
    </aside>
  )
}

function TopNavFallback() {
  return (
    <header className="sticky top-0 z-40 bg-surface-container-lowest/80 backdrop-blur-xl border-b border-outline-variant/10 h-16 flex items-center justify-between px-6 animate-pulse" aria-hidden="true">
      <div className="h-9 w-96 bg-surface-container-high rounded-full" />
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 bg-surface-container-high rounded-full" />
        <div className="h-9 w-20 bg-surface-container-high rounded-lg" />
      </div>
    </header>
  )
}

function NavProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CommandPalette />
      <UndoHandler />
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <Suspense fallback={<SidebarFallback />}>
        <Sidebar />
      </Suspense>
      <main id="main-content" className="ml-0 lg:ml-sidebar min-h-screen relative">
        <Suspense fallback={<TopNavFallback />}>
          <TopNav />
        </Suspense>
        <div className="max-w-max-width mx-auto px-margin-x py-margin-y animate-fade-in">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </div>
      </main>
    </>
  )
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <NavProvider>{children}</NavProvider>
    </SessionProvider>
  )
}
