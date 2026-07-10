"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { leads as store, addLead as storeAdd, deleteLead as storeDelete, updateLead as storeUpdate, convertLeadToProject, type Lead } from "@/lib/store"

export default function LeadsPage() {
  const router = useRouter()
  const [leads, setLeads] = useState<Lead[]>(store)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: "", email: "", company: "", source: "", value: "" })
  const [toast, setToast] = useState<{ show: boolean; msg: string }>({ show: false, msg: "" })

  function findDup(e: string, c: string) {
    return store.find((l) => l.email.toLowerCase() === e.toLowerCase() || l.company.toLowerCase() === c.toLowerCase())
  }
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!showForm) return
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") setShowForm(false) }
    window.addEventListener("keydown", h)
    return () => window.removeEventListener("keydown", h)
  }, [showForm])

  function handleConvert(leadId: string) {
    const proj = convertLeadToProject(leadId)
    if (proj) {
      setLeads([...store])
      setToast({ show: true, msg: `Converted to project for ${proj.client}` })
      setTimeout(() => router.push(`/projects/${proj.id}`), 1200)
    }
  }

  function handleCSV(file: File) {
    const reader = new FileReader()
    reader.onload = () => {
      const text = reader.result as string
      const lines = text.split("\n").filter(Boolean)
      if (lines.length < 2) return
      const headers = lines[0].toLowerCase().split(",").map((h) => h.trim())
      const parsed = lines.slice(1).map((line) => {
        const vals = line.split(",").map((v) => v.trim())
        const row: Record<string, string> = {}
        headers.forEach((h, i) => { row[h] = vals[i] || "" })
        return { id: crypto.randomUUID().slice(0, 8), name: row.name || row["first name"] || "", email: row.email || "", company: row.company || "", source: row.source || "CSV Import", value: row.value || "$0", status: "New", date: new Date().toLocaleDateString() }
      }).filter((l) => l.name)
      const skipped = parsed.filter((l) => findDup(l.email, l.company))
      const ok = parsed.filter((l) => !findDup(l.email, l.company))
      ok.forEach((l) => storeAdd(l))
      setLeads([...store])
      if (skipped.length) {
        setToast({ show: true, msg: `${skipped.length} duplicate${skipped.length > 1 ? 's' : ''} skipped` })
        setTimeout(() => setToast({ show: false, msg: "" }), 3000)
      }
    }
    reader.readAsText(file)
  }

  const stats = [
    { label: "Total Leads", value: leads.length, color: "" },
    { label: "New", value: leads.filter((l) => l.status === "New").length, color: "text-primary" },
    { label: "Contacted", value: leads.filter((l) => l.status === "Contacted").length, color: "text-secondary" },
    { label: "Converted", value: leads.filter((l) => l.status === "Converted").length, color: "text-secondary" },
  ]

  return (
    <div>
      <nav className="flex items-center gap-2 text-on-surface-variant mb-6">
        <span className="text-label-md">CRM</span>
        <span className="text-on-surface-variant/30">/</span>
        <span className="text-label-md font-semibold text-on-surface">Leads</span>
      </nav>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-headline-lg tracking-tight text-on-surface">Leads</h2>
          <p className="text-body-md text-on-surface-variant mt-1">Import CSV or add leads manually.</p>
        </div>
        <div className="flex gap-3">
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCSV(f); e.target.value = "" }} />
          <button onClick={() => fileRef.current?.click()} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-outline-variant/30 text-on-surface font-semibold text-body-md hover:bg-surface-container-low">Import CSV</button>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary font-semibold text-body-md shadow-lg shadow-primary/10">
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">add</span>Add Lead
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/5">
            <p className="text-label-md text-on-surface-variant">{s.label}</p>
            <h3 className={`text-headline-md font-bold mt-1 ${s.color}`}>{s.value}</h3>
          </div>
        ))}
      </div>

      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/10 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b border-outline-variant/10">
              <th className="px-6 py-4 text-label-sm text-on-surface-variant uppercase">Name</th>
              <th className="px-6 py-4 text-label-sm text-on-surface-variant uppercase">Email</th>
              <th className="px-6 py-4 text-label-sm text-on-surface-variant uppercase">Company</th>
              <th className="px-6 py-4 text-label-sm text-on-surface-variant uppercase">Source</th>
              <th className="px-6 py-4 text-label-sm text-on-surface-variant uppercase">Value</th>
              <th className="px-6 py-4 text-label-sm text-on-surface-variant uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/5">
            {leads.length === 0 && (
              <tr><td colSpan={6} className="px-6 py-16 text-center text-body-md text-on-surface-variant/75">No leads yet. Import a CSV or add manually.</td></tr>
            )}
            {leads.map((lead) => (
              <tr key={lead.id} className="hover:bg-surface-container/50 transition-colors group">
                <td className="px-6 py-4 text-body-md font-medium text-on-surface">{lead.name}</td>
                <td className="px-6 py-4 text-body-md text-on-surface">{lead.email}</td>
                <td className="px-6 py-4 text-body-md text-on-surface">{lead.company}</td>
                <td className="px-6 py-4 text-body-md text-on-surface-variant">{lead.source}</td>
                <td className="px-6 py-4 text-body-md text-on-surface">{lead.value}</td>
                <td className="px-6 py-4 flex items-center gap-2">
                  <select value={lead.status} onChange={(e) => { storeUpdate(lead.id, { status: e.target.value }); setLeads([...store]) }} aria-label="Lead status" className="bg-transparent border border-outline-variant/20 rounded-lg px-2 py-1 text-label-sm outline-none">
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Qualified">Qualified</option>
                    <option value="Converted">Converted</option>
                  </select>
                  {lead.status !== "Converted" && (
                    <button
                      onClick={() => handleConvert(lead.id)}
                      className="px-2 py-1 rounded-lg bg-primary/10 text-primary text-[11px] font-bold opacity-0 group-hover:opacity-100 transition-all hover:bg-primary/20"
                      aria-label={`Convert ${lead.name} to project`}
                    >
                      Convert
                    </button>
                  )}
                  <button onClick={() => { storeDelete(lead.id); setLeads([...store]) }} className="p-1 rounded hover:bg-error/10 text-on-surface-variant opacity-0 group-hover:opacity-100 transition-all" aria-label={`Delete ${lead.name}`}>
                    <span className="material-symbols-outlined text-[16px]" aria-hidden="true">delete</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={`fixed inset-0 z-[100] flex items-center justify-center ${showForm ? '' : 'hidden'}`} onClick={() => setShowForm(false)}>
        <div className="fixed inset-0 bg-black/40" />
        <div className="relative bg-surface-container-lowest w-full max-w-md rounded-2xl border border-outline-variant/10 shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
          <h3 className="text-title-lg text-on-surface mb-4">Add Lead</h3>
          <div className="space-y-4">
            <input aria-label="Lead name" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-surface-container-high border-none rounded-lg px-4 py-2.5 text-body-md outline-none focus:ring-2 focus:ring-primary/20" />
            <input aria-label="Lead email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full bg-surface-container-high border-none rounded-lg px-4 py-2.5 text-body-md outline-none focus:ring-2 focus:ring-primary/20" />
            <input aria-label="Lead company" placeholder="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="w-full bg-surface-container-high border-none rounded-lg px-4 py-2.5 text-body-md outline-none focus:ring-2 focus:ring-primary/20" />
            <input aria-label="Lead source" placeholder="Source (e.g. Website)" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} className="w-full bg-surface-container-high border-none rounded-lg px-4 py-2.5 text-body-md outline-none focus:ring-2 focus:ring-primary/20" />
            <input aria-label="Lead value" placeholder="Value (e.g. $5,000)" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} className="w-full bg-surface-container-high border-none rounded-lg px-4 py-2.5 text-body-md outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl border border-outline-variant/30 text-on-surface text-label-md">Cancel</button>
            <button onClick={() => {
              if (!form.name.trim()) return
              const dup = findDup(form.email, form.company)
              if (dup) {
                setToast({ show: true, msg: `Duplicate: "${dup.name}" already exists with this email/company` })
                setTimeout(() => setToast({ show: false, msg: "" }), 3000)
                return
              }
              storeAdd({ id: crypto.randomUUID().slice(0, 8), ...form, status: "New", date: new Date().toLocaleDateString() })
              setLeads([...store])
              setShowForm(false)
              setForm({ name: "", email: "", company: "", source: "", value: "" })
            }} className="px-5 py-2 rounded-xl bg-primary text-on-primary text-label-md font-semibold">Add</button>
          </div>
        </div>
      </div>

      {toast.show && (
        <div className="fixed bottom-6 right-6 z-[200] bg-surface-container-lowest border border-outline-variant/10 shadow-2xl rounded-xl px-5 py-3 text-body-md text-on-surface font-medium animate-fade-in flex items-center gap-3" role="status">
          <span className="material-symbols-outlined text-primary text-[20px]" aria-hidden="true">rocket_launch</span>
          {toast.msg}
        </div>
      )}
    </div>
  )
}
