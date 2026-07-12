"use client"

import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { getClients, getProjects, formatNumber, type Client } from "@/lib/store"
import { useState, useEffect } from "react"

export default function ClientDetailPage() {
  const { name } = useParams<{ name: string }>()
  const router = useRouter()
  const clientName = decodeURIComponent(name)
  const [client, setClient] = useState<Client | null>(null)
  const [clientProjects, setClientProjects] = useState<ReturnType<typeof getProjects>>([])
  useEffect(() => {
    const clients = getClients()
    const found = clients.find((c) => c.name.toLowerCase() === clientName.toLowerCase())
    setClient(found || null)
    const allProjects = getProjects()
    setClientProjects(found ? allProjects.filter((p) => (p.clientId && p.clientId === found.id) || p.client.toLowerCase() === clientName.toLowerCase()) : [])
  }, [clientName])

  const totalAmount = clientProjects.reduce((s, p) => s + (Number(p.amount.replace(/[^0-9.]/g, "")) || 0), 0)
  const paidAmount = clientProjects.filter((p) => p.amountStatus === "Paid").reduce((s, p) => s + (Number(p.amount.replace(/[^0-9.]/g, "")) || 0), 0)
  const dueAmount = totalAmount - paidAmount

  if (!client && clientProjects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 mb-4" aria-hidden="true">group_off</span>
        <h2 className="text-headline-md text-on-surface mb-2">Client not found</h2>
        <p className="text-body-md text-on-surface-variant">&ldquo;{clientName}&rdquo; does not have any projects.</p>
        <button onClick={() => router.push("/clients")} className="mt-6 px-5 py-2.5 rounded-xl bg-primary text-on-primary font-semibold text-body-md">Back to Clients</button>
      </div>
    )
  }

  return (
    <div>
      <nav className="flex items-center gap-2 text-on-surface-variant mb-6">
        <button onClick={() => router.push("/clients")} className="flex items-center gap-1 text-label-md text-primary hover:underline">
          <span className="material-symbols-outlined text-[16px]" aria-hidden="true">arrow_back</span>
          Clients
        </button>
        <span className="text-on-surface-variant/30">/</span>
        <span className="text-label-md font-semibold text-on-surface">{clientName}</span>
      </nav>

      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center font-bold text-xl">
          {clientName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
        </div>
        <div>
          <h2 className="text-headline-lg tracking-tight text-on-surface">{clientName}</h2>
          <p className="text-body-md text-on-surface-variant mt-1">{clientProjects.length} project{clientProjects.length !== 1 ? "s" : ""}</p>
          {client?.email && <p className="text-label-sm text-on-surface-variant">{client.email}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/5">
          <p className="text-label-md text-on-surface-variant">Total Billed</p>
          <h3 className="text-headline-md font-bold mt-1">{formatNumber(totalAmount)}</h3>
        </div>
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/5">
          <p className="text-label-md text-on-surface-variant">Paid</p>
          <h3 className="text-headline-md font-bold mt-1 text-secondary">{formatNumber(paidAmount)}</h3>
        </div>
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/5">
          <p className="text-label-md text-on-surface-variant">Due</p>
          <h3 className="text-headline-md font-bold mt-1 text-error">{formatNumber(dueAmount)}</h3>
        </div>
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/5">
          <p className="text-label-md text-on-surface-variant">Status</p>
          <span className="inline-block mt-2 px-3 py-1 rounded-full text-[11px] font-bold bg-secondary-container text-on-secondary-container">{client?.status || "Active"}</span>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/10 overflow-hidden">
        <div className="px-6 py-4 border-b border-outline-variant/5 flex items-center justify-between">
          <h3 className="text-title-lg text-on-surface">Projects</h3>
          <span className="text-label-md text-on-surface-variant">{clientProjects.length} total</span>
        </div>
        <table className="w-full">
          <thead>
            <tr className="text-left border-b border-outline-variant/10">
              <th className="px-6 py-4 text-label-sm text-on-surface-variant uppercase">Project</th>
              <th className="px-6 py-4 text-label-sm text-on-surface-variant uppercase">Amount</th>
              <th className="px-6 py-4 text-label-sm text-on-surface-variant uppercase">Status</th>
              <th className="px-6 py-4 text-label-sm text-on-surface-variant uppercase">Due Date</th>
              <th className="px-6 py-4 text-label-sm text-on-surface-variant uppercase">Invoice</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/5">
            {clientProjects.map((p) => (
              <tr key={p.id} className="hover:bg-surface-container/50 transition-colors">
                <td className="px-6 py-4">
                  <Link href={`/projects/${p.id}`} className="text-body-md font-semibold text-primary hover:underline">{p.requirement}</Link>
                </td>
                <td className="px-6 py-4 text-body-md font-semibold text-on-surface">{p.amount}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${p.amountStatus === "Paid" ? "bg-secondary-container text-on-secondary-container" : p.amountStatus === "Overdue" ? "bg-error-container text-on-error-container" : "bg-surface-container-high text-on-surface-variant"}`}>{p.amountStatus}</span>
                </td>
                <td className="px-6 py-4 text-body-md text-on-surface-variant">{p.dueDate}</td>
                <td className="px-6 py-4 text-body-md text-on-surface-variant">{p.invoiceNum}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
