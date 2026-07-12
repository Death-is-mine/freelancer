export interface ActivityEntry {
  id: string; projectId: string; type: string; text: string; timestamp: string
}

export interface Client {
  id: string; name: string; email: string; phone: string; company: string; status: string; revenue: number; notes: string; tags: string[]; createdAt: string
}

export interface Lead {
  id: string; name: string; email: string; company: string; source: string; value: string; status: string; date: string; createdAt: string; reason?: string
}

export interface Project {
  id: string; client: string; clientId: string; requirement: string; amount: string; amountStatus: string; dueDate: string; invoiceNum: string; agreementNum: string; leadEmail: string; createdAt: string
}

export interface PaymentRecord {
  id: string; invoiceId: string; amount: number; date: string; note: string; method: string
}

export function addPayment(invoiceId: string, amount: number, note = "", method = "") {
  const invoices = getInvoices()
  const inv = invoices.find((i) => i.id === invoiceId)
  if (!inv) return null
  const payments = getPayments(invoiceId)
  const payment: PaymentRecord = { id: crypto.randomUUID().slice(0, 8), invoiceId, amount, date: new Date().toISOString(), note, method }
  payments.push(payment)
  save(`fos_payments_${invoiceId}`, payments)

  const totalPaid = payments.reduce((s, p) => s + p.amount, 0)
  const totalDue = parseAmount(inv.amount)
  if (totalPaid >= totalDue) {
    inv.status = "Paid"
    const project = getProjects().find((p) => p.id === inv.projectId)
    if (project) { project.amountStatus = "Paid"; save("fos_projects", getProjects()) }
  }
  save("fos_invoices", invoices)
  idbPut("invoices", inv)
  return payment
}

export function getPayments(invoiceId: string): PaymentRecord[] {
  return load(`fos_payments_${invoiceId}`, [])
}

export function getInvoiceStatus(invoiceId: string): { paid: number; due: number } {
  const invoices = load<Invoice[]>("fos_invoices", [])
  const inv = invoices.find((i) => i.id === invoiceId)
  if (!inv) return { paid: 0, due: 0 }
  const payments = getPayments(invoiceId)
  const paid = payments.reduce((s, p) => s + p.amount, 0)
  const total = parseAmount(inv.amount)
  return { paid, due: Math.max(0, total - paid) }
}

export type Recurrence = "none" | "weekly" | "monthly" | "quarterly"

export interface Invoice {
  id: string; projectId: string; number: string; amount: string; status: string; issuedAt: string; dueDate: string; createdAt: string; recurrence: Recurrence; recurrenceNext: string | null
}

export interface Agreement {
  id: string; projectId: string; number: string; status: string; issuedAt: string; createdAt: string; signed: boolean
}

export interface ProjectFile {
  id: string; name: string; driveFileId: string; size: number; mimeType: string; uploadedAt: string
}

export interface ProjectComment {
  id: string; projectId: string; author: string; body: string; createdAt: string
}

export interface TimeEntry {
  id: string; projectId: string; description: string; start: string; end: string | null; duration: number
}

function load<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const v = localStorage.getItem(key)
    if (v) return JSON.parse(v)
    const sv = sessionStorage.getItem(key)
    if (sv) { localStorage.setItem(key, sv); sessionStorage.removeItem(key); return JSON.parse(sv) }
    return fallback
  } catch { return fallback }
}

function save(key: string, data: unknown) {
  if (typeof window === "undefined") return
  try { localStorage.setItem(key, JSON.stringify(data)) } catch {}
}

async function idbPut(store: string, value: unknown) {
  try { const { put } = await import("./offline"); await put(store, value) } catch {}
}

async function idbDelete(store: string, id: string) {
  try { const { del } = await import("./offline"); await del(store, id) } catch {}
}

export function getClients(): Client[] { return load("fos_clients", []) }

function saveClients(clients: Client[]) { save("fos_clients", clients) }

function migrateClients() {
  if (typeof window === "undefined" || localStorage.getItem("fos_clients_migrated")) return
  const projects = getProjects()
  const existing = getClients()
  const byName = new Map(existing.map((c) => [c.name.toLowerCase(), c]))
  for (const p of projects) {
    const key = p.client.toLowerCase()
    if (!byName.has(key)) {
      const c: Client = { id: crypto.randomUUID().slice(0, 8), name: p.client, email: p.leadEmail || "", phone: "", company: "", status: "Active", revenue: 0, notes: "", tags: [], createdAt: new Date().toISOString() }
      byName.set(key, c)
      existing.push(c)
    }
  }
  for (const p of projects) {
    const c = byName.get(p.client.toLowerCase())
    if (c && !p.clientId) { p.clientId = c.id; c.revenue += Number(p.amount.replace(/[^0-9.]/g, "")) || 0 }
    if (!p.createdAt) p.createdAt = new Date().toISOString()
  }
  saveClients(existing)
  save("fos_projects", projects)
  localStorage.setItem("fos_clients_migrated", "1")
}

function migrateAmounts() {
  if (typeof window === "undefined" || localStorage.getItem("fos_amounts_migrated_v2")) return
  const projects = getProjects()
  let changed = false
  for (const p of projects) {
    if (p.amount && p.amount.startsWith("$")) { p.amount = p.amount.replace(/^\$/, ""); changed = true }
  }
  if (changed) save("fos_projects", projects)
  const invoices = load<Invoice[]>("fos_invoices", [])
  let invChanged = false
  for (const inv of invoices) {
    if (inv.amount && inv.amount.startsWith("$")) { inv.amount = inv.amount.replace(/^\$/, ""); invChanged = true }
  }
  if (invChanged) save("fos_invoices", invoices)
  localStorage.setItem("fos_amounts_migrated_v2", "1")
}

function resolveClient(name: string, email = ""): Client {
  const clients = getClients()
  const key = name.toLowerCase().trim()
  let existing = clients.find((c) => c.name.toLowerCase().trim() === key)
  if (!existing) existing = clients.find((c) => c.email.toLowerCase() === email.toLowerCase())
  if (existing) return existing
  const c: Client = { id: crypto.randomUUID().slice(0, 8), name, email, phone: "", company: "", status: "Active", revenue: 0, notes: "", tags: [], createdAt: new Date().toISOString() }
  clients.push(c)
  saveClients(clients)
  idbPut("clients", c)
  return c
}

export function getProjects(): Project[] {
  const projects = load<Project[]>("fos_projects", [])
  migrateClients()
  migrateAmounts()
  return projects
}

export function getLeads(): Lead[] { return load("fos_leads", []) }

export function getInvoices(): Invoice[] {
  // ponytail: triggers recurring invoice generation on every read; separate when real scheduling exists
  try { processRecurringInvoices() } catch {}
  return load("fos_invoices", [])
}

export function getAgreements(): Agreement[] { return load("fos_agreements", []) }

function addActivity(projectId: string, type: string, text: string) {
  const entry: ActivityEntry = { id: crypto.randomUUID().slice(0, 8), projectId, type, text, timestamp: new Date().toISOString() }
  const key = `fos_activity_${projectId}`
  const existing: ActivityEntry[] = load<ActivityEntry[]>(key, [])
  existing.unshift(entry)
  if (existing.length > 50) existing.length = 50
  try { localStorage.setItem(key, JSON.stringify(existing)) } catch {}
}

export function getProjectActivity(projectId: string): ActivityEntry[] {
  return load(`fos_activity_${projectId}`, [])
}

export function getProjectFiles(projectId: string): ProjectFile[] {
  return load(`fos_files_${projectId}`, [])
}

export function addProjectFile(projectId: string, file: ProjectFile) {
  const key = `fos_files_${projectId}`
  const files: ProjectFile[] = load<ProjectFile[]>(key, [])
  files.push(file)
  try { localStorage.setItem(key, JSON.stringify(files)) } catch {}
}

export function removeProjectFile(projectId: string, fileId: string) {
  const key = `fos_files_${projectId}`
  const files: ProjectFile[] = load<ProjectFile[]>(key, []).filter((f) => f.id !== fileId)
  try { localStorage.setItem(key, JSON.stringify(files)) } catch {}
}

export function getTimeEntries(projectId: string): TimeEntry[] {
  return load(`fos_time_${projectId}`, [])
}

export function startTimer(projectId: string, description: string) {
  const entry: TimeEntry = { id: crypto.randomUUID().slice(0, 8), projectId, description, start: new Date().toISOString(), end: null, duration: 0 }
  const key = `fos_time_${projectId}`
  const all: TimeEntry[] = load<TimeEntry[]>(key, [])
  all.unshift(entry)
  save(key, all)
  addActivity(projectId, "timer", `Timer started: ${description}`)
}

export function stopTimer(projectId: string, entryId: string) {
  const key = `fos_time_${projectId}`
  const all: TimeEntry[] = load<TimeEntry[]>(key, [])
  const entry = all.find((e) => e.id === entryId)
  if (!entry || entry.end) return
  entry.end = new Date().toISOString()
  entry.duration = new Date(entry.end).getTime() - new Date(entry.start).getTime()
  save(key, all)
  idbPut("time_entries", entry)
  addActivity(projectId, "timer", `Timer stopped: ${entry.description} (${Math.round(entry.duration / 60000)}m)`)
}

export function addManualTime(projectId: string, description: string, minutes: number) {
  if (!description.trim() || minutes <= 0) return
  const now = new Date()
  const start = new Date(now.getTime() - minutes * 60000)
  const entry: TimeEntry = { id: crypto.randomUUID().slice(0, 8), projectId, description: description.trim(), start: start.toISOString(), end: now.toISOString(), duration: minutes * 60000 }
  const key = `fos_time_${projectId}`
  const all: TimeEntry[] = load<TimeEntry[]>(key, [])
  all.unshift(entry)
  save(key, all)
  addActivity(projectId, "timer", `Time logged: ${entry.description} (${minutes}m)`)
}

export function getTotalTimeForProject(projectId: string): number {
  return getTimeEntries(projectId).reduce((sum, e) => sum + (e.duration || 0), 0)
}

export function formatDuration(ms: number): string {
  if (ms <= 0) return "0m"
  const h = Math.floor(ms / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

export function addProject(p: Project) {
  const client = resolveClient(p.client, p.leadEmail || "")
  p.clientId = client.id
  p.createdAt = p.createdAt || new Date().toISOString()
  const projects = getProjects()
  projects.unshift(p)
  save("fos_projects", projects)
  idbPut("projects", p)
}

export function addLead(l: Lead) {
  l.createdAt = l.createdAt || new Date().toISOString()
  const leads = getLeads()
  leads.unshift(l); save("fos_leads", leads); idbPut("leads", l)
}

export function deleteLead(id: string) {
  const leads = getLeads().filter((l) => l.id !== id); save("fos_leads", leads); idbDelete("leads", id)
}

export function updateProject(id: string, upd: Partial<Project>) {
  const projects = getProjects()
  const idx = projects.findIndex((p) => p.id === id)
  if (idx !== -1) {
    Object.assign(projects[idx], upd)
    save("fos_projects", projects)
    idbPut("projects", projects[idx])
    addActivity(id, "update", Object.keys(upd).join(", ") + " updated")
  }
}

export function deleteProject(id: string) {
  const projects = getProjects().filter((p) => p.id !== id); save("fos_projects", projects); idbDelete("projects", id)
}

export function updateLead(id: string, upd: Partial<Lead>) {
  const leads = getLeads()
  const idx = leads.findIndex((l) => l.id === id)
  if (idx !== -1) { Object.assign(leads[idx], upd); save("fos_leads", leads); idbPut("leads", leads[idx]) }
}

export function generateInvoice(projectId: string): Invoice | null {
  const projects = getProjects()
  const project = projects.find((p) => p.id === projectId)
  if (!project) return null
  const existing = load<Invoice[]>("fos_invoices", [])
  const nextNum = (existing.length + 1).toString().padStart(3, "0")
  const invoice: Invoice = {
    id: crypto.randomUUID().slice(0, 8),
    projectId,
    number: `INV-${nextNum}`,
    amount: project.amount,
    status: "Pending",
    issuedAt: new Date().toISOString(),
    dueDate: project.dueDate || new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    createdAt: new Date().toISOString(),
    recurrence: "none",
    recurrenceNext: null,
  }
  project.invoiceNum = invoice.number
  save("fos_projects", projects)
  const invoices = load<Invoice[]>("fos_invoices", [])
  invoices.unshift(invoice)
  save("fos_invoices", invoices)
  idbPut("invoices", invoice)
  addActivity(projectId, "invoice", `Invoice ${invoice.number} generated`)
  return invoice
}

export function setInvoiceRecurrence(invoiceId: string, recurrence: Recurrence) {
  const invoices = load<Invoice[]>("fos_invoices", [])
  const inv = invoices.find((i) => i.id === invoiceId)
  if (!inv) return
  inv.recurrence = recurrence
  if (recurrence === "none") { inv.recurrenceNext = null }
  else {
    const base = new Date(inv.dueDate || inv.issuedAt)
    inv.recurrenceNext = addInterval(base, recurrence).toISOString()
  }
  save("fos_invoices", invoices)
  idbPut("invoices", inv)
}

function addInterval(d: Date, r: Recurrence): Date {
  const next = new Date(d)
  if (r === "weekly") next.setDate(next.getDate() + 7)
  else if (r === "monthly") next.setMonth(next.getMonth() + 1)
  else if (r === "quarterly") next.setMonth(next.getMonth() + 3)
  return next
}

export function processRecurringInvoices() {
  // ponytail: called on page load; real cron when server-side scheduling exists
  const invoices = load<Invoice[]>("fos_invoices", [])
  const now = new Date()
  for (const inv of invoices) {
    if (inv.recurrence === "none" || !inv.recurrenceNext) continue
    if (new Date(inv.recurrenceNext) <= now) {
      const newInv = generateInvoice(inv.projectId)
      if (newInv) {
        newInv.recurrence = inv.recurrence
        const base = addInterval(now, inv.recurrence)
        newInv.recurrenceNext = base.toISOString()
        const all = load<Invoice[]>("fos_invoices", [])
        const idx = all.findIndex((i) => i.id === newInv.id)
        if (idx !== -1) { all[idx] = newInv; save("fos_invoices", all) }
      }
    }
  }
}

export function generateAgreement(projectId: string): Agreement | null {
  const projects = getProjects()
  const project = projects.find((p) => p.id === projectId)
  if (!project) return null
  const agreement: Agreement = {
    id: crypto.randomUUID().slice(0, 8),
    projectId,
    number: `AGR-${Date.now().toString(36).toUpperCase()}`,
    status: "Draft",
    issuedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    signed: false,
  }
  project.agreementNum = agreement.number
  save("fos_projects", projects)
  const agreements = load<Agreement[]>("fos_agreements", [])
  agreements.unshift(agreement)
  save("fos_agreements", agreements)
  idbPut("agreements", agreement)
  addActivity(projectId, "agreement", `Agreement ${agreement.number} generated`)
  return agreement
}

export function signAgreement(id: string) {
  const agreements = load<Agreement[]>("fos_agreements", [])
  const a = agreements.find((a) => a.id === id)
  if (!a || a.signed) return
  a.signed = true
  a.status = "Signed"
  save("fos_agreements", agreements)
  idbPut("agreements", a)
  addActivity(a.projectId, "agreement", `Agreement ${a.number} signed`)
}

export function getComments(projectId: string): ProjectComment[] {
  return load(`fos_comments_${projectId}`, [])
}

export function addComment(projectId: string, author: string, body: string) {
  if (!body.trim()) return
  const comment: ProjectComment = { id: crypto.randomUUID().slice(0, 8), projectId, author, body: body.trim(), createdAt: new Date().toISOString() }
  const key = `fos_comments_${projectId}`
  const all: ProjectComment[] = load<ProjectComment[]>(key, [])
  all.push(comment)
  if (all.length > 200) all.splice(0, all.length - 200)
  save(key, all)
}

export function convertLeadToProject(leadId: string) {
  const leads = getLeads()
  const lead = leads.find((l) => l.id === leadId)
  if (!lead) return null
  lead.status = "Converted"
  const client = resolveClient(lead.name, lead.email)
  const proj: Project = {
    id: crypto.randomUUID().slice(0, 8),
    client: lead.name,
    clientId: client.id,
    requirement: lead.company ? `Work with ${lead.company}` : "New Project",
    amount: lead.value,
    amountStatus: "Pending",
    dueDate: "—",
    invoiceNum: "—",
    agreementNum: "—",
    leadEmail: lead.email,
    createdAt: new Date().toISOString(),
  }
  const projects = getProjects()
  projects.unshift(proj)
  save("fos_projects", projects)
  save("fos_leads", leads)
  idbPut("projects", proj)
  idbPut("leads", lead)
  addActivity(proj.id, "create", "Project created from lead: " + lead.name)
  return proj
}

export function getProjectByLeadEmail(email: string): Project | undefined {
  return getProjects().find((p) => p.leadEmail.toLowerCase() === email.toLowerCase())
}

export function getProjectsByClient(clientName: string): Project[] {
  return getProjects().filter((p) => p.client.toLowerCase() === clientName.toLowerCase())
}

export interface Share {
  id: string; projectId: string; token: string; enabled: boolean; createdAt: string; expiresAt: string | null
}

export async function addShare(projectId: string, expiresAt?: string): Promise<Share | null> {
  const projects = getProjects()
  const project = projects.find((p) => p.id === projectId)
  if (!project) return null
  try {
    const res = await fetch("/api/share", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, projectSnapshot: { ...project }, expiresAt }),
    })
    if (!res.ok) return null
    const share: Share = await res.json()
    addActivity(projectId, "share", `Share link created`)
    return share
  } catch {
    return null
  }
}

export async function getShareByToken(token: string): Promise<{ project: { id: string; client: string; requirement: string; amount: string; amountStatus: string; dueDate: string; invoiceNum: string; agreementNum: string } } | null> {
  try {
    const res = await fetch(`/api/share/${encodeURIComponent(token)}`)
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export async function revokeShare(shareId: string) {
  try { await fetch(`/api/share?id=${encodeURIComponent(shareId)}`, { method: "DELETE" }) } catch { /* ignore */ }
}

export async function getProjectShares(projectId: string): Promise<Share[]> {
  try {
    const res = await fetch("/api/share")
    if (!res.ok) return []
    const all: Share[] = await res.json()
    return all.filter((s) => s.projectId === projectId)
  } catch {
    return []
  }
}

export async function getShares(): Promise<Share[]> {
  try {
    const res = await fetch("/api/share")
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

export type RuleTrigger = "lead.created" | "lead.converted" | "project.status_changed" | "invoice.generated" | "invoice.overdue"
export type RuleAction = "notify" | "create_task" | "update_status" | "send_email"

export interface Rule {
  id: string; name: string; trigger: RuleTrigger; action: RuleAction; config: string; enabled: boolean
}

export function getRules(): Rule[] {
  return load<Rule[]>("fos_rules", DEFAULT_RULES)
}

export function addRule(rule: Rule) {
  const rules = getRules()
  rules.unshift(rule)
  save("fos_rules", rules)
}

export function updateRule(id: string, upd: Partial<Rule>) {
  const rules = getRules()
  const idx = rules.findIndex((r) => r.id === id)
  if (idx !== -1) { Object.assign(rules[idx], upd); save("fos_rules", rules) }
}

export function deleteRule(id: string) {
  save("fos_rules", getRules().filter((r) => r.id !== id))
}

export function evaluateRules(trigger: RuleTrigger, context: Record<string, string>) {
  const rules = getRules().filter((r) => r.enabled && r.trigger === trigger)
  for (const rule of rules) {
    if (rule.action === "notify") {
      const msg = rule.config.replace(/\{(\w+)\}/g, (_, k) => context[k] || "")
      const notifKey = `fos_notification_${Date.now()}`
      save(notifKey, { msg, time: new Date().toISOString(), read: false })
      setTimeout(() => { try { localStorage.removeItem(notifKey) } catch {} }, 86400000)
    }
    if (rule.action === "create_task") {
      const title = rule.config.replace(/\{(\w+)\}/g, (_, k) => context[k] || "")
      const tasks = load<Record<string, unknown>[]>("fos_tasks", [])
      tasks.unshift({ id: crypto.randomUUID().slice(0, 6), title, done: false, projectId: context.projectId || "", date: "Today", priority: "Normal" })
      save("fos_tasks", tasks)
    }
    if (rule.action === "update_status" && context.projectId) {
      const projects = getProjects()
      const p = projects.find((x) => x.id === context.projectId)
      if (p) { p.amountStatus = rule.config; save("fos_projects", projects); addActivity(context.projectId, "update", `Status auto-updated to ${rule.config}`) }
    }
    if (rule.action === "send_email") {
      // ponytail: email queue via localStorage; real SMTP/API when user connects a mail provider
      const email = { id: crypto.randomUUID().slice(0, 8), to: context.email || "", subject: rule.config.replace(/\{(\w+)\}/g, (_, k) => context[k] || ""), body: rule.config, createdAt: new Date().toISOString() }
      const pending = load<unknown[]>("fos_pending_emails", [])
      pending.push(email)
      save("fos_pending_emails", pending)
    }
  }
}

/* ── Currency ── */

export function getCurrency(): string {
  return load("fos_currency", "USD")
}

export function setCurrency(code: string) {
  save("fos_currency", code)
}

export function parseAmount(amount: string): number {
  return Number(amount.replace(/[^0-9.\-]/g, "")) || 0
}

export function formatAmount(amount: string): string {
  const code = getCurrency()
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: code, minimumFractionDigits: 0 }).format(parseAmount(amount))
  } catch {
    return `${code === "INR" ? "₹" : "$"}${parseAmount(amount).toLocaleString()}`
  }
}

export function formatNumber(value: number): string {
  const code = getCurrency()
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: code, minimumFractionDigits: 0 }).format(value)
  } catch {
    return `${code === "INR" ? "₹" : "$"}${value.toLocaleString()}`
  }
}

const DEFAULT_RULES: Rule[] = [
  { id: "r1", name: "Notify on new lead", trigger: "lead.created", action: "notify", config: "New lead: {name} from {company}", enabled: true },
  { id: "r2", name: "Flag overdue invoices", trigger: "invoice.overdue", action: "notify", config: "Invoice {number} is overdue for {client}", enabled: true },
  { id: "r3", name: "Auto-archive paid projects", trigger: "project.status_changed", action: "update_status", config: "Paid", enabled: false },
]
