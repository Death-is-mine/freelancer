'use client'

import { useState, useEffect } from 'react'
import {
  getInvoices,
  getProjects,
  generateInvoice,
  setInvoiceRecurrence,
  formatAmount,
  type Invoice,
} from '@/lib/store'

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [projects, setProjects] = useState<Record<string, string>>({})
  const [toast, setToast] = useState<{ show: boolean; msg: string }>({ show: false, msg: '' })
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    setInvoices(getInvoices())
    const map: Record<string, string> = {}
    for (const p of getProjects()) map[p.id] = p.client
    setProjects(map)
  }, [mounted])

  function handleGenerate() {
    const projects = getProjects().filter((p) => p.invoiceNum === '—')
    if (projects.length === 0) {
      setToast({ show: true, msg: 'All projects already have invoices.' })
      setTimeout(() => setToast({ show: false, msg: '' }), 3000)
      return
    }
    const result = generateInvoice(projects[0].id)
    if (result) setToast({ show: true, msg: `Invoice ${result.number} generated` })
    setTimeout(() => setToast({ show: false, msg: '' }), 3000)
    setInvoices(getInvoices())
  }

  function handleRecurrence(invoiceId: string, r: string) {
    setInvoiceRecurrence(invoiceId, r as Invoice['recurrence'])
    setInvoices(getInvoices())
  }

  const stats = [
    { label: 'Total', value: invoices.length },
    { label: 'Paid', value: invoices.filter((i) => i.status === 'Paid').length },
    { label: 'Pending', value: invoices.filter((i) => i.status === 'Pending').length },
    { label: 'Overdue', value: invoices.filter((i) => i.status === 'Overdue').length },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-headline-lg tracking-tight text-on-surface">Invoices</h2>
          <p className="text-body-md text-on-surface-variant mt-1">
            Manage and generate invoices for projects.
          </p>
        </div>
        <button
          onClick={handleGenerate}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary font-semibold text-body-md shadow-lg shadow-primary/10"
        >
          <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
            receipt
          </span>
          Generate Invoice
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
                Invoice
              </th>
              <th scope="col" className="px-6 py-4 text-label-sm text-on-surface-variant uppercase">
                Client
              </th>
              <th scope="col" className="px-6 py-4 text-label-sm text-on-surface-variant uppercase">
                Amount
              </th>
              <th scope="col" className="px-6 py-4 text-label-sm text-on-surface-variant uppercase">
                Status
              </th>
              <th scope="col" className="px-6 py-4 text-label-sm text-on-surface-variant uppercase">
                Due
              </th>
              <th scope="col" className="px-6 py-4 text-label-sm text-on-surface-variant uppercase">
                Recurrence
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/5">
            {invoices.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-16 text-center text-body-md text-on-surface-variant/75"
                >
                  No invoices yet. Generate one from a project.
                </td>
              </tr>
            )}
            {invoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-surface-container/50 transition-colors">
                <td className="px-6 py-4 text-body-md font-semibold text-on-surface">
                  {inv.number}
                </td>
                <td className="px-6 py-4 text-body-md text-on-surface">
                  {projects[inv.projectId] || '—'}
                </td>
                <td className="px-6 py-4 text-body-md font-semibold text-on-surface">
                  {formatAmount(inv.amount)}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${inv.status === 'Paid' ? 'bg-secondary-container text-on-secondary-container' : inv.status === 'Overdue' ? 'bg-error-container text-on-error-container' : 'bg-surface-container-high text-on-surface-variant'}`}
                  >
                    {inv.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-body-md text-on-surface-variant">
                  {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '—'}
                </td>
                <td className="px-6 py-4">
                  <select
                    value={inv.recurrence}
                    onChange={(e) => handleRecurrence(inv.id, e.target.value)}
                    aria-label={`Recurrence for ${inv.number}`}
                    className="bg-transparent border border-outline-variant/20 rounded-lg px-2 py-1 text-label-sm outline-none"
                  >
                    <option value="none">None</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                  </select>
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
