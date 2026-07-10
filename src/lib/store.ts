export interface ActivityEntry {
  id: string; projectId: string; type: string; text: string; timestamp: string
}

export interface Lead {
  id: string; name: string; email: string; company: string; source: string; value: string; status: string; date: string
}

export interface Project {
  id: string; client: string; requirement: string; amount: string; amountStatus: string; dueDate: string; invoiceNum: string; agreementNum: string; leadEmail: string
}

export interface Invoice {
  id: string; projectId: string; number: string; amount: string; status: string; issuedAt: string; dueDate: string
}

export interface Agreement {
  id: string; projectId: string; number: string; status: string; issuedAt: string
}

export interface ProjectFile {
  id: string; name: string; driveFileId: string; size: number; mimeType: string; uploadedAt: string
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

export function getProjects(): Project[] { return load("fos_projects", []) }

export function getLeads(): Lead[] { return load("fos_leads", []) }

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

export function addProject(p: Project) {
  const projects = getProjects()
  projects.unshift(p); save("fos_projects", projects); idbPut("projects", p)
}

export function addLead(l: Lead) {
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

export function convertLeadToProject(leadId: string) {
  const leads = getLeads()
  const lead = leads.find((l) => l.id === leadId)
  if (!lead) return null
  lead.status = "Converted"
  const proj: Project = {
    id: crypto.randomUUID().slice(0, 8),
    client: lead.name,
    requirement: lead.company ? `Work with ${lead.company}` : "New Project",
    amount: lead.value,
    amountStatus: "Pending",
    dueDate: "—",
    invoiceNum: "—",
    agreementNum: "—",
    leadEmail: lead.email,
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

export function addShare(projectId: string, expiresAt?: string): Share | null {
  if (!getProjects().find((p) => p.id === projectId)) return null
  const share: Share = {
    id: crypto.randomUUID().slice(0, 8),
    projectId,
    token: crypto.randomUUID().slice(0, 12),
    enabled: true,
    createdAt: new Date().toISOString(),
    expiresAt: expiresAt || null,
  }
  const shares = load<Share[]>("fos_shares", [])
  shares.unshift(share)
  save("fos_shares", shares)
  addActivity(projectId, "share", `Share link created`)
  return share
}

export function getShareByToken(token: string): { share: Share; project: Project } | null {
  const shares = load<Share[]>("fos_shares", [])
  const share = shares.find((s) => s.token === token && s.enabled)
  if (!share) return null
  if (share.expiresAt && new Date(share.expiresAt) < new Date()) return null
  const project = getProjects().find((p) => p.id === share.projectId)
  if (!project) return null
  return { share, project }
}

export function revokeShare(shareId: string) {
  const shares = load<Share[]>("fos_shares", [])
  const share = shares.find((s) => s.id === shareId)
  if (share) { share.enabled = false; save("fos_shares", shares) }
}

export function getProjectShares(projectId: string): Share[] {
  return load<Share[]>("fos_shares", []).filter((s) => s.projectId === projectId)
}

export function getShares(): Share[] {
  return load<Share[]>("fos_shares", [])
}

export type RuleTrigger = "lead.created" | "lead.converted" | "project.status_changed" | "invoice.generated" | "invoice.overdue"
export type RuleAction = "notify" | "create_task" | "update_status"

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
  }
}

const DEFAULT_RULES: Rule[] = [
  { id: "r1", name: "Notify on new lead", trigger: "lead.created", action: "notify", config: "New lead: {name} from {company}", enabled: true },
  { id: "r2", name: "Flag overdue invoices", trigger: "invoice.overdue", action: "notify", config: "Invoice {number} is overdue for {client}", enabled: true },
  { id: "r3", name: "Auto-archive paid projects", trigger: "project.status_changed", action: "update_status", config: "Paid", enabled: false },
]
