"use client"

import { useSession } from "next-auth/react"

export default function ProfileSettingsPage() {
  const { data: session } = useSession()
  const user = session?.user
  const nameParts = (user?.name || "").split(" ")
  const firstName = nameParts[0] || ""
  const lastName = nameParts.slice(1).join(" ") || ""
  const initials = (user?.name || "F").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()

  return (
    <div className="max-w-3xl">
      <h2 className="text-headline-lg text-on-surface mb-2">Profile</h2>
      <p className="text-body-md text-on-surface-variant mb-8">Your personal profile synced from Google.</p>
      <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/20 space-y-6">
        <div className="flex items-center gap-6">
          {user?.image ? (
            <img src={user.image} alt="" className="w-16 h-16 rounded-full border-2 border-surface-container-high object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-secondary-container flex items-center justify-center text-2xl font-bold text-on-secondary-container">{initials}</div>
          )}
          <button className="px-4 py-2 rounded-xl bg-surface-container-high text-on-surface text-label-md hover:bg-surface-container-highest transition-colors">Change Photo</button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="first-name" className="text-label-md text-on-surface font-semibold block mb-2">First Name</label>
            <input id="first-name" className="w-full bg-surface-container-low border-none rounded-lg px-4 py-2.5 text-body-md focus:ring-2 focus:ring-primary/20" defaultValue={firstName} />
          </div>
          <div>
            <label htmlFor="last-name" className="text-label-md text-on-surface font-semibold block mb-2">Last Name</label>
            <input id="last-name" className="w-full bg-surface-container-low border-none rounded-lg px-4 py-2.5 text-body-md focus:ring-2 focus:ring-primary/20" defaultValue={lastName} />
          </div>
        </div>
        <div>
          <label htmlFor="email" className="text-label-md text-on-surface font-semibold block mb-2">Email</label>
          <input id="email" className="w-full bg-surface-container-low border-none rounded-lg px-4 py-2.5 text-body-md focus:ring-2 focus:ring-primary/20" defaultValue={user?.email || ""} />
        </div>
      </div>
      <div className="mt-8 flex justify-end gap-4">
        <button className="px-6 py-2.5 text-label-md text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-colors">Cancel</button>
        <button className="px-8 py-2.5 bg-primary text-white text-label-md font-semibold rounded-lg shadow-lg shadow-primary/20">Save</button>
      </div>
    </div>
  )
}
