'use client'

import { useState, useEffect } from 'react'
import {
  getRules,
  addRule,
  updateRule,
  deleteRule,
  type Rule,
  type RuleTrigger,
  type RuleAction,
} from '@/lib/store'

const TRIGGERS: { value: RuleTrigger; label: string }[] = [
  { value: 'lead.created', label: 'Lead Created' },
  { value: 'lead.converted', label: 'Lead Converted to Project' },
  { value: 'project.status_changed', label: 'Project Status Changed' },
  { value: 'invoice.generated', label: 'Invoice Generated' },
  { value: 'invoice.overdue', label: 'Invoice Overdue' },
]

const ACTIONS: { value: RuleAction; label: string; hint: string }[] = [
  { value: 'notify', label: 'Notify', hint: 'Show a dashboard notification with custom message' },
  { value: 'create_task', label: 'Create Task', hint: 'Auto-create a task with the given title' },
  { value: 'update_status', label: 'Update Status', hint: 'Auto-update project payment status' },
  {
    value: 'send_email',
    label: 'Send Email',
    hint: 'Queue an email to the trigger context (needs mail provider)',
  },
]

export default function AutomationPage() {
  const [rules, setRules] = useState<Rule[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    name: '',
    trigger: 'lead.created' as RuleTrigger,
    action: 'notify' as RuleAction,
    config: '',
  })
  const [toast, setToast] = useState('')

  function refresh() {
    setRules(getRules())
  }
  useEffect(refresh, [])

  function handleCreate() {
    if (!form.name.trim()) return
    addRule({
      id: crypto.randomUUID().slice(0, 8),
      name: form.name.trim(),
      trigger: form.trigger,
      action: form.action,
      config: form.config,
      enabled: true,
    })
    setToast(`Rule "${form.name}" created`)
    setShowForm(false)
    setForm({ name: '', trigger: 'lead.created', action: 'notify', config: '' })
    refresh()
  }

  function handleToggle(id: string, enabled: boolean) {
    updateRule(id, { enabled })
    setToast(enabled ? 'Rule enabled' : 'Rule disabled')
    refresh()
  }

  function handleDelete(id: string) {
    const r = rules.find((x) => x.id === id)
    deleteRule(id)
    setToast(`Rule "${r?.name}" deleted`)
    refresh()
  }

  return (
    <div>
      {toast && (
        <div
          className="fixed bottom-6 right-6 bg-surface-container-high text-on-surface px-5 py-3 rounded-xl shadow-xl z-50 animate-fade-in text-body-md font-medium"
          role="alert"
        >
          {toast}
          <button
            onClick={() => setToast('')}
            className="ml-4 text-on-surface-variant cursor-pointer"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      )}
      <nav className="flex items-center gap-2 text-on-surface-variant mb-1">
        <span className="text-label-md">Workspace</span>
        <span className="text-on-surface-variant/30">/</span>
        <span className="text-label-md font-semibold text-on-surface">Automation</span>
      </nav>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-headline-lg tracking-tight text-on-surface">Automation Rules</h2>
          <p className="text-body-md text-on-surface-variant mt-1">
            {rules.length} rule{rules.length !== 1 ? 's' : ''} configured
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-semibold text-body-md shadow-lg shadow-primary/10 inline-flex items-center gap-2 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
            add
          </span>
          Create Rule
        </button>
      </div>

      {rules.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/10 p-12 text-center">
          <span
            className="material-symbols-outlined text-5xl text-on-surface-variant/30 mb-4"
            aria-hidden="true"
          >
            auto_awesome
          </span>
          <h3 className="text-title-lg text-on-surface mb-2">No automation rules yet</h3>
          <p className="text-body-md text-on-surface-variant mb-6">
            Create rules to automate lead assignment, invoice reminders, and more.
          </p>
        </div>
      ) : (
        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/10 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-outline-variant/10">
                <th
                  scope="col"
                  className="px-6 py-4 text-label-sm text-on-surface-variant uppercase"
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-label-sm text-on-surface-variant uppercase"
                >
                  Trigger
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-label-sm text-on-surface-variant uppercase"
                >
                  Action
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-label-sm text-on-surface-variant uppercase"
                >
                  Status
                </th>
                <th scope="col" className="px-6 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/5">
              {rules.map((rule) => (
                <tr key={rule.id} className="hover:bg-surface-container/50 transition-colors">
                  <td className="px-6 py-4 text-body-md font-medium text-on-surface">
                    {rule.name}
                  </td>
                  <td className="px-6 py-4 text-body-md text-on-surface">
                    {TRIGGERS.find((t) => t.value === rule.trigger)?.label || rule.trigger}
                  </td>
                  <td className="px-6 py-4 text-body-md text-on-surface">
                    {ACTIONS.find((a) => a.value === rule.action)?.label || rule.action}
                    {rule.config ? `: ${rule.config}` : ''}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggle(rule.id, !rule.enabled)}
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold cursor-pointer ${rule.enabled ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-container-high text-on-surface-variant'}`}
                    >
                      {rule.enabled ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDelete(rule.id)}
                      className="text-label-sm text-error cursor-pointer hover:underline"
                      aria-label={`Delete ${rule.name}`}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40" onClick={() => setShowForm(false)} />
          <div
            className="relative bg-surface-container-lowest w-full max-w-lg rounded-2xl border border-outline-variant/10 shadow-2xl p-6 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-title-lg text-on-surface mb-4">New Automation Rule</h3>
            <div className="space-y-4">
              <input
                placeholder="Rule name"
                aria-label="Rule name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-surface-container-high border-none rounded-lg px-4 py-2.5 text-body-md outline-none focus:ring-2 focus:ring-primary/20"
              />
              <select
                value={form.trigger}
                onChange={(e) => setForm({ ...form, trigger: e.target.value as RuleTrigger })}
                className="w-full bg-surface-container-high border-none rounded-lg px-4 py-2.5 text-body-md outline-none focus:ring-2 focus:ring-primary/20 text-on-surface"
                aria-label="Trigger"
              >
                {TRIGGERS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              <select
                value={form.action}
                onChange={(e) => setForm({ ...form, action: e.target.value as RuleAction })}
                className="w-full bg-surface-container-high border-none rounded-lg px-4 py-2.5 text-body-md outline-none focus:ring-2 focus:ring-primary/20 text-on-surface"
                aria-label="Action"
              >
                {ACTIONS.map((a) => (
                  <option key={a.value} value={a.value}>
                    {a.label}
                  </option>
                ))}
              </select>
              <input
                placeholder={
                  form.action === 'notify'
                    ? 'Message (use {name}, {company}, {number}, {client})'
                    : form.action === 'create_task'
                      ? 'Task title (use {name}, {company}, etc.)'
                      : form.action === 'send_email'
                        ? 'Subject line (use {name}, {email}, etc.)'
                        : 'Status value (e.g. "Paid")'
                }
                aria-label="Rule configuration"
                value={form.config}
                onChange={(e) => setForm({ ...form, config: e.target.value })}
                className="w-full bg-surface-container-high border-none rounded-lg px-4 py-2.5 text-body-md outline-none focus:ring-2 focus:ring-primary/20"
              />
              <p className="text-label-sm text-on-surface-variant/80">
                {ACTIONS.find((a) => a.value === form.action)?.hint}
              </p>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-xl border border-outline-variant/30 text-on-surface text-label-md cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="px-5 py-2 rounded-xl bg-primary text-on-primary text-label-md font-semibold cursor-pointer"
              >
                Create Rule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
