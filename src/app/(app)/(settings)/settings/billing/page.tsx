'use client'

export default function BillingPage() {
  return (
    <div className="max-w-3xl">
      <h2 className="text-headline-lg text-on-surface mb-2">Billing</h2>
      <p className="text-body-md text-on-surface-variant mb-8">
        Manage your subscription and billing information.
      </p>
      <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/20 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-label-md font-semibold text-on-surface">Current Plan</p>
            <p className="text-body-md text-on-surface-variant">Freelancer - Free</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-label-sm font-bold">
            Active
          </span>
        </div>
        <div className="h-px bg-outline-variant/10" />
        <p className="text-body-md text-on-surface-variant">
          No payment methods on file. Billing will be available in a future update.
        </p>
      </div>
    </div>
  )
}
