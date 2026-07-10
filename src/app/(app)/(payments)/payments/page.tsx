"use client"

import { useState } from "react"
import { projects as projectStore, updateProject } from "@/lib/store"

export default function PaymentsPage() {
  const [render, setRender] = useState(0)
  const [toast, setToast] = useState<{ show: boolean; msg: string }>({ show: false, msg: "" })

  const refresh = () => setRender((n) => n + 1)
  const withInvoices = projectStore.filter((p) => p.invoiceNum !== "—")
  const stats = [
    { label: "Total Invoices", value: withInvoices.length },
    { label: "Paid", value: withInvoices.filter((p) => p.amountStatus === "Paid").length },
    { label: "Unpaid", value: withInvoices.filter((p) => p.amountStatus === "Pending").length },
    { label: "Overdue", value: withInvoices.filter((p) => p.amountStatus === "Overdue").length },
  ]

  function showToast(msg: string) {
    setToast({ show: true, msg })
    setTimeout(() => setToast({ show: false, msg: "" }), 3000)
  }

  function generateInvoice() {
    const pending = projectStore.filter((p) => p.invoiceNum === "—")
    if (pending.length === 0) { showToast("All projects already have invoices."); return }
    const p = pending[0]
    const num = `INV-${String(withInvoices.length + 1).padStart(3, "0")}`
    updateProject(p.id, { invoiceNum: num })
    refresh()
    showToast(`Invoice ${num} generated for ${p.client}`)
  }

  return (
    <div>
      <nav className="flex items-center gap-2 text-on-surface-variant mb-6">
        <span className="text-label-md">Finance</span><span className="text-on-surface-variant/30">/</span><span className="text-label-md font-semibold text-on-surface">Payments</span>
      </nav>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-headline-lg tracking-tight text-on-surface">Payments</h2>
          <p className="text-body-md text-on-surface-variant mt-1">Generate invoices and track payments against projects.</p>
        </div>
        <button onClick={generateInvoice} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary font-semibold text-body-md shadow-lg shadow-primary/10">
          <span className="material-symbols-outlined text-[20px]" aria-hidden="true">receipt</span>Generate Invoice
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/5">
            <p className="text-label-md text-on-surface-variant">{s.label}</p>
            <h3 className="text-headline-md font-bold mt-1">{s.value}</h3>
          </div>
        ))}
      </div>

      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/10 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b border-outline-variant/10">
              <th className="px-6 py-4 text-label-sm text-on-surface-variant uppercase">Invoice</th>
              <th className="px-6 py-4 text-label-sm text-on-surface-variant uppercase">Client</th>
              <th className="px-6 py-4 text-label-sm text-on-surface-variant uppercase">Amount</th>
              <th className="px-6 py-4 text-label-sm text-on-surface-variant uppercase">Date</th>
              <th className="px-6 py-4 text-label-sm text-on-surface-variant uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/5">
            {withInvoices.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-16 text-center text-body-md text-on-surface-variant/75">No invoices yet. Generate one from a project.</td></tr>
            )}
            {withInvoices.map((proj) => (
              <tr key={proj.invoiceNum} className="hover:bg-surface-container/50 transition-colors">
                <td className="px-6 py-4 text-body-md font-semibold text-on-surface">{proj.invoiceNum}</td>
                <td className="px-6 py-4 text-body-md text-on-surface">{proj.client}</td>
                <td className="px-6 py-4 text-body-md font-semibold text-on-surface">{proj.amount}</td>
                <td className="px-6 py-4 text-body-md text-on-surface-variant">{proj.dueDate}</td>
                <td className="px-6 py-4">
                  <select value={proj.amountStatus} onChange={(e) => { updateProject(proj.id, { amountStatus: e.target.value }); refresh() }} aria-label={`Invoice status for ${proj.client}`} className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border-0 outline-none ${proj.amountStatus === "Paid" ? "bg-secondary-container text-on-secondary-container" : proj.amountStatus === "Overdue" ? "bg-error-container text-on-error-container" : "bg-surface-container-high text-on-surface-variant"}`}>
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {toast.show && (
        <div className="fixed bottom-6 right-6 z-[200] bg-surface-container-lowest border border-outline-variant/10 shadow-2xl rounded-xl px-5 py-3 text-body-md text-on-surface font-medium animate-fade-in" role="status">
          {toast.msg}
        </div>
      )}
    </div>
  )
}
