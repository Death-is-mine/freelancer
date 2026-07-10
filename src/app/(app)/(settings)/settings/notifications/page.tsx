"use client"

export default function NotificationsPage() {
  return (
    <div className="max-w-3xl">
      <h2 className="text-headline-lg text-on-surface mb-2">Notifications</h2>
      <p className="text-body-md text-on-surface-variant mb-8">Manage your notification preferences.</p>
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 divide-y divide-outline-variant/10">
        {[
          { label: "Email Notifications", desc: "Receive updates via email" },
          { label: "Task Reminders", desc: "Get reminded about upcoming deadlines" },
          { label: "Invoice Alerts", desc: "Notifications for paid and overdue invoices" },
          { label: "Weekly Digest", desc: "Weekly summary of all activity" },
        ].map((n, i) => (
          <div key={i} className="p-6 flex items-center justify-between">
            <div>
              <span className="block text-label-md font-semibold mb-1">{n.label}</span>
              <p className="text-on-surface-variant text-body-md">{n.desc}</p>
            </div>
            <label className="relative inline-block w-9 h-5">
              <input type="checkbox" className="opacity-0 w-0 h-0 peer" defaultChecked={i < 2} aria-label={n.label} />
              <span className="absolute cursor-pointer inset-0 bg-outline rounded-full transition-colors peer-checked:bg-primary before:absolute before:h-4 before:w-4 before:left-0.5 before:bottom-0.5 before:bg-white before:rounded-full before:transition-transform peer-checked:before:translate-x-4"></span>
            </label>
          </div>
        ))}
      </div>
    </div>
  )
}
