"use client"

import { useState } from "react"

type Rule = { id: string; trigger: string; action: string; active: boolean }

export default function AutomationPage() {
  const [rules, setRules] = useState<Rule[]>([])

  return (
    <>
      <nav className="flex items-center gap-2 text-on-surface-variant mb-1">
        <span className="text-label-md">Workspace</span>
        <span className="text-on-surface-variant/30">/</span>
        <span className="text-label-md font-semibold text-on-surface">Automation</span>
      </nav>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-headline-lg tracking-tight text-on-surface">Automation Rules</h2>
          <p className="text-body-md text-on-surface-variant mt-1">{rules.length} rule{rules.length !== 1 ? "s" : ""} configured</p>
        </div>
        <button onClick={() => { const r: Rule = { id: crypto.randomUUID().slice(0, 8), trigger: "Lead Created", action: "Send Welcome Email", active: true }; setRules([...rules, r]) }} className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-semibold text-body-md shadow-lg shadow-primary/10 inline-flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px]" aria-hidden="true">add</span>
          Create Rule
        </button>
      </div>

      {rules.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/10 p-12 text-center">
          <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 mb-4" aria-hidden="true">auto_awesome</span>
          <h3 className="text-title-lg text-on-surface mb-2">No automation rules yet</h3>
          <p className="text-body-md text-on-surface-variant mb-6">Create rules to automate lead assignment, invoice reminders, and more.</p>
        </div>
      ) : (
        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/10 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-outline-variant/10">
                <th className="px-6 py-4 text-label-sm text-on-surface-variant uppercase">Trigger</th>
                <th className="px-6 py-4 text-label-sm text-on-surface-variant uppercase">Action</th>
                <th className="px-6 py-4 text-label-sm text-on-surface-variant uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/5">
              {rules.map((rule) => (
                <tr key={rule.id} className="hover:bg-surface-container/50 transition-colors">
                  <td className="px-6 py-4 text-body-md text-on-surface">{rule.trigger}</td>
                  <td className="px-6 py-4 text-body-md text-on-surface">{rule.action}</td>
                  <td className="px-6 py-4">
                    <button onClick={() => setRules(rules.map((r) => r.id === rule.id ? { ...r, active: !r.active } : r))} className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${rule.active ? "bg-secondary-container text-on-secondary-container" : "bg-surface-container-high text-on-surface-variant"}`}>
                      {rule.active ? "Active" : "Inactive"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
