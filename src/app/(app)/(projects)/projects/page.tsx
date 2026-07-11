"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { getProjects as store, addProject as storeAdd, updateProject as storeUpdate, type Project } from "@/lib/store"

export default function ProjectsPage() {
  const searchParams = useSearchParams()
  const [list, setList] = useState<Project[]>([])
  useEffect(() => { setList(store()) }, [])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ client: "", requirement: "", amount: "", dueDate: "", leadEmail: "" })

  useEffect(() => {
    if (searchParams.get("new") === "true") setShowForm(true)
  }, [searchParams])

  useEffect(() => {
    if (!showForm) return
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") setShowForm(false) }
    window.addEventListener("keydown", h)
    return () => window.removeEventListener("keydown", h)
  }, [showForm])

  function addProject() {
    if (!form.client.trim() || !form.requirement.trim()) return
    const p: Project = { id: crypto.randomUUID().slice(0, 8), client: form.client, requirement: form.requirement, amount: `$${form.amount || "0"}`, amountStatus: "Pending", dueDate: form.dueDate || "—", invoiceNum: "—", agreementNum: "—", leadEmail: form.leadEmail }
    storeAdd(p)
    setList([...store()])
    setShowForm(false)
    setForm({ client: "", requirement: "", amount: "", dueDate: "", leadEmail: "" })
    // ponytail: calendar reminder would call Google Calendar API here
  }

  const stats = [
    { label: "Total", value: list.length },
    { label: "Pending Amount", value: list.filter((p) => p.amountStatus === "Pending").length },
    { label: "Paid", value: list.filter((p) => p.amountStatus === "Paid").length },
    { label: "Overdue", value: list.filter((p) => p.amountStatus === "Overdue").length },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-headline-lg tracking-tight text-on-surface">Projects</h2>
          <p className="text-body-md text-on-surface-variant mt-1">Track client projects, invoices, and agreements.</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary font-semibold text-body-md shadow-lg shadow-primary/10">
          <span className="material-symbols-outlined text-[20px]" aria-hidden="true">add</span>New Project
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
              <th className="px-6 py-4 text-label-sm text-on-surface-variant uppercase">Client</th>
              <th className="px-6 py-4 text-label-sm text-on-surface-variant uppercase">Requirement</th>
              <th className="px-6 py-4 text-label-sm text-on-surface-variant uppercase">Amount</th>
              <th className="px-6 py-4 text-label-sm text-on-surface-variant uppercase">Status</th>
              <th className="px-6 py-4 text-label-sm text-on-surface-variant uppercase">Due Date</th>
              <th className="px-6 py-4 text-label-sm text-on-surface-variant uppercase">Invoice</th>
              <th className="px-6 py-4 text-label-sm text-on-surface-variant uppercase">Agreement</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/5">
            {list.length === 0 && (
              <tr><td colSpan={7} className="px-6 py-16 text-center text-body-md text-on-surface-variant/75">No projects yet.</td></tr>
            )}
            {list.map((p) => (
              <tr key={p.id} className="hover:bg-surface-container/50 transition-colors">
                <td className="px-6 py-4">
                  <Link href={`/projects/${p.id}`} className="text-body-md font-semibold text-primary hover:underline">{p.client}</Link>
                </td>
                <td className="px-6 py-4 text-body-md text-on-surface">{p.requirement}</td>
                <td className="px-6 py-4 text-body-md font-semibold text-on-surface">{p.amount}</td>
                <td className="px-6 py-4">
                  <select value={p.amountStatus} onChange={(e) => { storeUpdate(p.id, { amountStatus: e.target.value }); setList([...store()]) }} aria-label={`Payment status for ${p.client}`} className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border-0 outline-none ${p.amountStatus === "Paid" ? "bg-secondary-container text-on-secondary-container" : p.amountStatus === "Overdue" ? "bg-error-container text-on-error-container" : "bg-surface-container-high text-on-surface-variant"}`}>
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </td>
                <td className="px-6 py-4 text-body-md text-on-surface-variant">{p.dueDate}</td>
                <td className="px-6 py-4 text-body-md text-on-surface-variant">{p.invoiceNum}</td>
                <td className="px-6 py-4 text-body-md text-on-surface-variant">{p.agreementNum}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40" onClick={() => setShowForm(false)} />
          <div className="relative bg-surface-container-lowest w-full max-w-lg rounded-2xl border border-outline-variant/10 shadow-2xl p-6 z-10" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-title-lg text-on-surface mb-4">New Project</h3>
            <div className="space-y-4">
              <input aria-label="Client name" placeholder="Client name" value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} className="w-full bg-surface-container-high border-none rounded-lg px-4 py-2.5 text-body-md outline-none focus:ring-2 focus:ring-primary/20" />
              <input aria-label="Project name" placeholder="Requirement / Project name" value={form.requirement} onChange={(e) => setForm({ ...form, requirement: e.target.value })} className="w-full bg-surface-container-high border-none rounded-lg px-4 py-2.5 text-body-md outline-none focus:ring-2 focus:ring-primary/20" />
              <input aria-label="Amount" placeholder="Amount ($)" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="w-full bg-surface-container-high border-none rounded-lg px-4 py-2.5 text-body-md outline-none focus:ring-2 focus:ring-primary/20" />
              <input aria-label="Due date" placeholder="Due date (e.g. Aug 15, 2026)" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="w-full bg-surface-container-high border-none rounded-lg px-4 py-2.5 text-body-md outline-none focus:ring-2 focus:ring-primary/20" />
              <input aria-label="Lead email" placeholder="Lead email (optional)" value={form.leadEmail} onChange={(e) => setForm({ ...form, leadEmail: e.target.value })} className="w-full bg-surface-container-high border-none rounded-lg px-4 py-2.5 text-body-md outline-none focus:ring-2 focus:ring-primary/20" />
              <p className="text-label-sm text-on-surface-variant/80">A calendar reminder will be set 1 day before the due date.</p>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl border border-outline-variant/30 text-on-surface text-label-md">Cancel</button>
              <button onClick={addProject} className="px-5 py-2 rounded-xl bg-primary text-on-primary text-label-md font-semibold">Create Project</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
