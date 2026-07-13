'use client'

import Link from 'next/link'

const sections = [
  { label: 'Profile', href: '/settings/profile', icon: 'person', desc: 'Name, email, avatar' },
  {
    label: 'Workspace',
    href: '/settings/workspace',
    icon: 'workspaces',
    desc: 'Backup layout, workspace settings',
  },
  {
    label: 'Integrations',
    href: '/settings/integrations',
    icon: 'integration_instructions',
    desc: 'Google Drive, Calendar',
  },
  {
    label: 'Templates',
    href: '/settings/templates',
    icon: 'description',
    desc: 'Invoice and proposal templates',
  },
  {
    label: 'Billing',
    href: '/settings/billing',
    icon: 'credit_card',
    desc: 'Payment methods and plans',
  },
  {
    label: 'Security',
    href: '/settings/security',
    icon: 'security',
    desc: 'Password, 2FA, sessions',
  },
  {
    label: 'Notifications',
    href: '/settings/notifications',
    icon: 'notifications',
    desc: 'Email and push preferences',
  },
  { label: 'Appearance', href: '/settings/appearance', icon: 'palette', desc: 'Dark mode, theme' },
  { label: 'Calendar', href: '/settings/calendar', icon: 'calendar_month', desc: 'Calendar sync' },
  { label: 'Help', href: '/settings/help', icon: 'help', desc: 'Docs, support, shortcuts' },
]

export default function SettingsPage() {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-headline-lg tracking-tight text-on-surface">Settings</h2>
        <p className="text-body-md text-on-surface-variant mt-1">
          Manage your account and workspace.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="flex items-start gap-4 p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/5 hover:border-outline-variant/20 transition-colors group"
          >
            <span
              className="material-symbols-outlined text-2xl text-primary mt-0.5"
              aria-hidden="true"
            >
              {s.icon}
            </span>
            <div>
              <h3 className="text-body-md font-semibold text-on-surface group-hover:text-primary transition-colors">
                {s.label}
              </h3>
              <p className="text-label-sm text-on-surface-variant mt-0.5">{s.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
