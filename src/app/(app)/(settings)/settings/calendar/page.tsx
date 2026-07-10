"use client"

export default function CalendarSettingsPage() {
  return (
    <div className="max-w-2xl">
      <h2 className="text-headline-md text-on-surface mb-2">Calendar & Reminders</h2>
      <p className="text-body-md text-on-surface-variant mb-8">Manage your Google Calendar integration and project reminders.</p>

      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/5 p-6 mb-6">
        <h3 className="text-title-lg text-on-surface mb-4">Connected Accounts</h3>
        <div className="flex items-center justify-between py-3 border-b border-outline-variant/5">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant" aria-hidden="true">calendar_month</span>
            </span>
            <div>
              <p className="text-body-md font-medium text-on-surface">Google Calendar</p>
              <p className="text-label-sm text-on-surface-variant/80">alex@example.com</p>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-secondary-container text-on-secondary-container">Connected</span>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/5 p-6">
        <h3 className="text-title-lg text-on-surface mb-4">Project Reminders</h3>
        <p className="text-body-md text-on-surface-variant mb-4">When a new project is created, a calendar reminder is automatically set 1 day before the due date.</p>
        <div className="flex items-center justify-between py-3">
          <div>
            <p className="text-body-md font-medium text-on-surface">Auto-create reminders</p>
            <p className="text-label-sm text-on-surface-variant/80">Task due date -1 day</p>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-secondary-container text-on-secondary-container">Active</span>
        </div>
      </div>
    </div>
  )
}
