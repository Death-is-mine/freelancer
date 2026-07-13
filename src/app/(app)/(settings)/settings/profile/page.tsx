'use client'

import { useSession } from 'next-auth/react'

export default function ProfileSettingsPage() {
  const { data: session } = useSession()
  const user = session?.user
  const nameParts = (user?.name || '').split(' ')
  const firstName = nameParts[0] || ''
  const lastName = nameParts.slice(1).join(' ') || ''
  const initials = (user?.name || 'F')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="max-w-3xl">
      <h2 className="text-headline-lg text-on-surface mb-2">Profile</h2>
      <p className="text-body-md text-on-surface-variant mb-2">
        Your personal profile synced from Google.
      </p>
      <p className="text-label-sm text-on-surface-variant mb-8">
        To update your name, photo, or email, edit your Google account.
      </p>
      <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/20 space-y-6">
        <div className="flex items-center gap-6">
          {user?.image ? (
            <img
              src={user.image}
              alt="Profile photo"
              className="w-16 h-16 rounded-full border-2 border-surface-container-high object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-secondary-container flex items-center justify-center text-2xl font-bold text-on-secondary-container">
              {initials}
            </div>
          )}
          <div>
            <p className="text-body-md font-semibold text-on-surface">{user?.name}</p>
            <p className="text-label-sm text-on-surface-variant">Connected via Google</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="first-name"
              className="text-label-md text-on-surface font-semibold block mb-2"
            >
              First Name
            </label>
            <input
              id="first-name"
              className="w-full bg-surface-container-low border-none rounded-lg px-4 py-2.5 text-body-md"
              defaultValue={firstName}
              readOnly
            />
          </div>
          <div>
            <label
              htmlFor="last-name"
              className="text-label-md text-on-surface font-semibold block mb-2"
            >
              Last Name
            </label>
            <input
              id="last-name"
              className="w-full bg-surface-container-low border-none rounded-lg px-4 py-2.5 text-body-md"
              defaultValue={lastName}
              readOnly
            />
          </div>
        </div>
        <div>
          <label htmlFor="email" className="text-label-md text-on-surface font-semibold block mb-2">
            Email
          </label>
          <input
            id="email"
            className="w-full bg-surface-container-low border-none rounded-lg px-4 py-2.5 text-body-md"
            defaultValue={user?.email || ''}
            readOnly
          />
        </div>
      </div>
    </div>
  )
}
