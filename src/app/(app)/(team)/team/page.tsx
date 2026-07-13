'use client'

import { useState } from 'react'

type Member = {
  id: string
  name: string
  email: string
  role: 'Owner' | 'Admin' | 'Manager' | 'Employee' | 'Viewer'
  status: 'Active' | 'Pending'
  joined: string
}

const defaultMembers: Member[] = [
  {
    id: '1',
    name: 'You',
    email: 'you@example.com',
    role: 'Owner',
    status: 'Active',
    joined: 'Jan 2026',
  },
]

const roles = ['Owner', 'Admin', 'Manager', 'Employee', 'Viewer'] as const

export default function TeamPage() {
  const [members, setMembers] = useState<Member[]>(defaultMembers)
  const [showInvite, setShowInvite] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<Member['role']>('Employee')

  function handleInvite() {
    if (!inviteEmail.trim()) return
    const newMember: Member = {
      id: Date.now().toString(),
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: inviteRole,
      status: 'Pending',
      joined: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    }
    setMembers([...members, newMember])
    setInviteEmail('')
    setShowInvite(false)
  }

  const pendingInvites = members.filter((m) => m.status === 'Pending')

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-headline-lg tracking-tight text-on-surface">Team</h2>
          <p className="text-body-md text-on-surface-variant mt-1">
            {members.length} member{members.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setShowInvite(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary font-semibold text-body-md shadow-lg shadow-primary/10"
        >
          <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
            person_add
          </span>
          Invite Member
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {[
          { label: 'Total Members', value: members.length, icon: 'group', color: 'text-primary' },
          {
            label: 'Active',
            value: members.filter((m) => m.status === 'Active').length,
            icon: 'check_circle',
            color: 'text-success',
          },
          {
            label: 'Pending Invites',
            value: pendingInvites.length,
            icon: 'hourglass_empty',
            color: 'text-warning',
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/5"
          >
            <div className="flex items-center gap-3 mb-1">
              <span className={`material-symbols-outlined ${s.color}`} aria-hidden="true">
                {s.icon}
              </span>
              <p className="text-label-md text-on-surface-variant uppercase tracking-wider">
                {s.label}
              </p>
            </div>
            <p className="text-headline-md font-bold text-on-surface mt-2">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/10 overflow-hidden mb-8">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b border-outline-variant/10">
              <th scope="col" className="px-6 py-4 text-label-sm text-on-surface-variant uppercase">
                Member
              </th>
              <th scope="col" className="px-6 py-4 text-label-sm text-on-surface-variant uppercase">
                Role
              </th>
              <th scope="col" className="px-6 py-4 text-label-sm text-on-surface-variant uppercase">
                Status
              </th>
              <th scope="col" className="px-6 py-4 text-label-sm text-on-surface-variant uppercase">
                Joined
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/5">
            {members.map((m) => (
              <tr key={m.id} className="hover:bg-surface-container/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center font-bold text-sm">
                      {m.name
                        .split(' ')
                        .map((w) => w[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <div>
                      <p className="text-body-md font-semibold text-on-surface">{m.name}</p>
                      <p className="text-label-sm text-on-surface-variant">{m.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <select
                    value={m.role}
                    onChange={(e) =>
                      setMembers(
                        members.map((x) =>
                          x.id === m.id ? { ...x, role: e.target.value as Member['role'] } : x,
                        ),
                      )
                    }
                    aria-label={`Role for ${m.name}`}
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border-0 outline-none ${m.role === 'Owner' ? 'bg-primary/10 text-primary' : 'bg-surface-container-high text-on-surface-variant'}`}
                  >
                    {roles.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${m.status === 'Active' ? 'bg-secondary-container text-on-secondary-container' : 'bg-warning/10 text-warning'}`}
                  >
                    {m.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-body-md text-on-surface-variant">{m.joined}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/5">
        <h3 className="text-title-lg text-on-surface mb-4">Roles & Permissions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { role: 'Owner', desc: 'Full access to all settings, billing, and members' },
            { role: 'Admin', desc: 'Manage projects, invoices, and team members' },
            { role: 'Manager', desc: 'Create and edit projects, view reports' },
            { role: 'Employee', desc: 'View and update assigned projects' },
            { role: 'Viewer', desc: 'Read-only access to workspace data' },
          ].map((r) => (
            <div
              key={r.role}
              className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/5"
            >
              <p className="text-body-md font-semibold text-on-surface">{r.role}</p>
              <p className="text-label-sm text-on-surface-variant mt-1">{r.desc}</p>
            </div>
          ))}
        </div>
        <p className="text-label-sm text-on-surface-variant/60 mt-6">
          Integrates with Google Workspace for SSO and directory sync.
        </p>
      </div>

      {showInvite && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40" onClick={() => setShowInvite(false)} />
          <div
            className="relative bg-surface-container-lowest w-full max-w-md rounded-2xl border border-outline-variant/10 shadow-2xl p-6 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-title-lg text-on-surface mb-4">Invite Member</h3>
            <div className="space-y-4">
              <input
                aria-label="Email address"
                placeholder="colleague@company.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="w-full bg-surface-container-high border-none rounded-lg px-4 py-2.5 text-body-md outline-none focus:ring-2 focus:ring-primary/20"
              />
              <select
                aria-label="Role"
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as Member['role'])}
                className="w-full bg-surface-container-high border-none rounded-lg px-4 py-2.5 text-body-md outline-none focus:ring-2 focus:ring-primary/20"
              >
                {roles
                  .filter((r) => r !== 'Owner')
                  .map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
              </select>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowInvite(false)}
                className="px-4 py-2 rounded-xl border border-outline-variant/30 text-on-surface text-label-md"
              >
                Cancel
              </button>
              <button
                onClick={handleInvite}
                className="px-5 py-2 rounded-xl bg-primary text-on-primary text-label-md font-semibold"
              >
                Send Invite
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
