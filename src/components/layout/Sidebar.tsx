'use client'

import { useCallback, memo, useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { navItems } from '@/lib/design-tokens'

function usePrefetcher(href: string) {
  const router = useRouter()
  return useCallback(() => {
    router.prefetch(href)
  }, [router, href])
}

function NavLink({
  href,
  icon,
  label,
  isActive,
  onNavigate,
}: {
  href: string
  icon: string
  label: string
  isActive: boolean
  onNavigate?: () => void
}) {
  const onHover = usePrefetcher(href)

  return (
    <Link
      href={href}
      prefetch={false}
      onMouseEnter={onHover}
      onClick={onNavigate}
      className={`flex items-center px-3 py-2.5 rounded-r-xl transition-all duration-200 ${
        isActive
          ? 'sidebar-item-active text-primary font-semibold'
          : 'text-on-surface-variant hover:bg-surface-container-high'
      }`}
    >
      <span className="material-symbols-outlined mr-3 text-[20px]" aria-hidden="true">
        {icon}
      </span>
      <span className="text-body-md">{label}</span>
    </Link>
  )
}

const NavLinkMemo = memo(NavLink)

function NavSection({
  items,
  activePath,
  onNavigate,
}: {
  items: typeof navItems
  activePath: string
  onNavigate?: () => void
}) {
  return (
    <>
      {items.map((item) => (
        <NavLinkMemo
          key={item.href}
          href={item.href}
          icon={item.icon}
          label={item.label}
          isActive={
            item.href === '/dashboard'
              ? activePath === '/dashboard'
              : activePath.startsWith(item.href)
          }
          onNavigate={onNavigate}
        />
      ))}
    </>
  )
}

const NavSectionMemo = memo(NavSection)

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  useEffect(() => {
    function handler(e: MouseEvent) {
      const target = e.target as HTMLElement
      if (mobileOpen && !target.closest('[data-sidebar]')) setMobileOpen(false)
    }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [mobileOpen])

  const closeMobile = () => setMobileOpen(false)

  const sidebar = (
    <aside
      data-sidebar
      className={`w-sidebar h-screen fixed left-0 top-0 bg-surface-container-low border-r border-outline-variant/10 flex flex-col py-base z-50 transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="px-6 py-4 flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center text-on-primary-container"
          aria-hidden="true"
        >
          <span className="material-symbols-outlined text-sm" aria-hidden="true">
            rocket_launch
          </span>
        </div>
        <div>
          <h1 className="text-headline-md font-bold text-on-surface">FreelanceOS</h1>
        </div>
      </div>

      <nav
        className="mt-6 flex-1 px-3 space-y-1 custom-scrollbar overflow-y-auto"
        aria-label="Primary"
      >
        <NavSectionMemo items={navItems} activePath={pathname} onNavigate={closeMobile} />
      </nav>

      <div className="px-3 mt-auto space-y-1">
        <button
          onClick={() => {
            router.push('/projects?new=true')
            closeMobile()
          }}
          className="w-full bg-primary text-on-primary py-3 rounded-xl font-semibold text-body-md mb-6 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-lg shadow-primary/20"
          aria-label="Create new project"
        >
          <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
            add
          </span>
          New Project
        </button>
      </div>
    </aside>
  )

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-3 left-3 z-50 lg:hidden p-2 rounded-xl bg-surface-container-lowest border border-outline-variant/20 shadow-md"
        aria-label="Open navigation menu"
      >
        <span className="material-symbols-outlined" aria-hidden="true">
          menu
        </span>
      </button>

      {mobileOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={closeMobile} />
      )}

      {sidebar}
    </>
  )
}
