'use client'

import { useState, useEffect } from 'react'
import {
  getAgreements,
  getProjects,
  generateAgreement,
  signAgreement,
  type Agreement,
} from '@/lib/store'

export default function AgreementsPage() {
  const [agreements, setAgreements] = useState<Agreement[]>([])
  const [projects, setProjects] = useState<Record<string, string>>({})
  const [toast, setToast] = useState<{ show: boolean; msg: string }>({ show: false, msg: '' })
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    setAgreements(getAgreements())
    const map: Record<string, string> = {}
    for (const p of getProjects()) map[p.id] = p.client
    setProjects(map)
  }, [mounted])

  function handleGenerate() {
    const projects = getProjects().filter((p) => p.agreementNum === '—')
    if (projects.length === 0) {
      setToast({ show: true, msg: 'All projects already have agreements.' })
      setTimeout(() => setToast({ show: false, msg: '' }), 3000)
      return
    }
    const result = generateAgreement(projects[0].id)
    if (result) setToast({ show: true, msg: `Agreement ${result.number} generated` })
    setTimeout(() => setToast({ show: false, msg: '' }), 3000)
    setAgreements(getAgreements())
  }

  function handleSign(id: string) {
    signAgreement(id)
    setAgreements(getAgreements())
    setToast({ show: true, msg: 'Agreement signed' })
    setTimeout(() => setToast({ show: false, msg: '' }), 3000)
  }

  const stats = [
    { label: 'Total', value: agreements.length },
    { label: 'Signed', value: agreements.filter((a) => a.signed).length },
    { label: 'Draft', value: agreements.filter((a) => !a.signed).length },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-headline-lg tracking-tight text-on-surface">Agreements</h2>
          <p className="text-body-md text-on-surface-variant mt-1">
            Create and manage project agreements.
          </p>
        </div>
        <button
          onClick={handleGenerate}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary font-semibold text-body-md shadow-lg shadow-primary/10"
        >
          <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
            description
          </span>
          Generate Agreement
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/5"
          >
            <p className="text-label-md text-on-surface-variant">{s.label}</p>
            <h3 className="text-headline-md font-bold mt-1">{s.value}</h3>
          </div>
        ))}
      </div>

      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/10 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b border-outline-variant/10">
              <th scope="col" className="px-6 py-4 text-label-sm text-on-surface-variant uppercase">
                Agreement
              </th>
              <th scope="col" className="px-6 py-4 text-label-sm text-on-surface-variant uppercase">
                Client
              </th>
              <th scope="col" className="px-6 py-4 text-label-sm text-on-surface-variant uppercase">
                Status
              </th>
              <th scope="col" className="px-6 py-4 text-label-sm text-on-surface-variant uppercase">
                Issued
              </th>
              <th scope="col" className="px-6 py-4 text-label-sm text-on-surface-variant uppercase">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/5">
            {agreements.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-16 text-center text-body-md text-on-surface-variant/75"
                >
                  No agreements yet. Generate one from a project.
                </td>
              </tr>
            )}
            {agreements.map((a) => (
              <tr key={a.id} className="hover:bg-surface-container/50 transition-colors">
                <td className="px-6 py-4 text-body-md font-semibold text-on-surface">{a.number}</td>
                <td className="px-6 py-4 text-body-md text-on-surface">
                  {projects[a.projectId] || '—'}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${a.signed ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-container-high text-on-surface-variant'}`}
                  >
                    {a.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-body-md text-on-surface-variant">
                  {new Date(a.issuedAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  {!a.signed && (
                    <button
                      onClick={() => handleSign(a.id)}
                      className="px-3 py-1.5 rounded-lg bg-primary text-on-primary text-label-sm font-semibold hover:bg-primary/90"
                    >
                      Sign
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {toast.show && (
        <div
          className="fixed bottom-6 right-6 z-[200] bg-surface-container-lowest border border-outline-variant/10 shadow-2xl rounded-xl px-5 py-3 text-body-md text-on-surface font-medium animate-fade-in"
          role="status"
        >
          {toast.msg}
        </div>
      )}
    </div>
  )
}
