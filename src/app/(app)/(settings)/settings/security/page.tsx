"use client"

export default function SecurityPage() {
  return (
    <div className="max-w-3xl">
      <h2 className="text-headline-lg text-on-surface mb-2">Security</h2>
      <p className="text-body-md text-on-surface-variant mb-8">Manage your account security and authentication methods.</p>
      <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/20 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-label-md font-semibold text-on-surface">Google Authentication</p>
            <p className="text-body-md text-on-surface-variant">Signed in with Google</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-label-sm font-bold">Active</span>
        </div>
        <div className="h-px bg-outline-variant/10" />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-label-md font-semibold text-on-surface">Sessions</p>
            <p className="text-body-md text-on-surface-variant">Manage active sessions</p>
          </div>
          <button className="px-4 py-2 rounded-xl bg-surface-container-high text-on-surface text-label-md hover:bg-surface-container-highest transition-colors">Manage</button>
        </div>
      </div>
    </div>
  )
}
