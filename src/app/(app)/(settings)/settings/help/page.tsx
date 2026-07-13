'use client'

export default function HelpPage() {
  return (
    <div className="max-w-3xl">
      <h2 className="text-headline-lg text-on-surface mb-2">Help</h2>
      <p className="text-body-md text-on-surface-variant mb-8">
        Documentation and support resources.
      </p>
      <div className="space-y-4">
        {[
          {
            title: 'Getting Started',
            desc: 'Learn how to set up your workspace and first project',
          },
          {
            title: 'Managing Clients',
            desc: 'How to convert leads and manage client relationships',
          },
          { title: 'Invoicing', desc: 'Create and send professional invoices' },
          { title: 'Google Workspace Sync', desc: 'Understanding how your data syncs with Google' },
          { title: 'Keyboard Shortcuts', desc: 'Cmd+K to open command palette, Ctrl+Z to undo' },
        ].map((h) => (
          <div
            key={h.title}
            className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/10 hover:border-primary/20 transition-colors cursor-pointer"
          >
            <p className="text-label-md font-semibold text-on-surface">{h.title}</p>
            <p className="text-body-md text-on-surface-variant mt-1">{h.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
