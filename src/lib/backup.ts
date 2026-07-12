// ponytail: one-row-per-backup snapshot; real incremental backup when restore frequency warrants it

export interface BackupPayload {
  projects: unknown[]
  clients: unknown[]
  leads: unknown[]
  invoices: unknown[]
  agreements: unknown[]
  rules: unknown[]
  tasks: unknown[]
  currency: string
}

export async function backupToSheets(): Promise<string | null> {
  const payload: BackupPayload = {
    projects: JSON.parse(localStorage.getItem("fos_projects") || "[]"),
    clients: JSON.parse(localStorage.getItem("fos_clients") || "[]"),
    leads: JSON.parse(localStorage.getItem("fos_leads") || "[]"),
    invoices: JSON.parse(localStorage.getItem("fos_invoices") || "[]"),
    agreements: JSON.parse(localStorage.getItem("fos_agreements") || "[]"),
    rules: JSON.parse(localStorage.getItem("fos_rules") || "[]"),
    tasks: JSON.parse(localStorage.getItem("fos_tasks") || "[]"),
    currency: localStorage.getItem("fos_currency") || "USD",
  }
  try {
    const res = await fetch("/api/backup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    if (!res.ok) return null
    const { timestamp } = await res.json()
    localStorage.setItem("fos_backup_at", timestamp || new Date().toISOString())
    return timestamp || new Date().toISOString()
  } catch {
    return null
  }
}

export async function restoreFromBackup(): Promise<string | null> {
  try {
    const res = await fetch("/api/backup")
    if (!res.ok) return null
    const { data, timestamp } = await res.json()
    if (!data) return null
    const p = data as BackupPayload
    localStorage.setItem("fos_projects", JSON.stringify(p.projects || []))
    localStorage.setItem("fos_clients", JSON.stringify(p.clients || []))
    localStorage.setItem("fos_leads", JSON.stringify(p.leads || []))
    localStorage.setItem("fos_invoices", JSON.stringify(p.invoices || []))
    localStorage.setItem("fos_agreements", JSON.stringify(p.agreements || []))
    localStorage.setItem("fos_rules", JSON.stringify(p.rules || []))
    localStorage.setItem("fos_tasks", JSON.stringify(p.tasks || []))
    if (p.currency) localStorage.setItem("fos_currency", p.currency)
    return timestamp || null
  } catch {
    return null
  }
}

export function getLastBackupTime(): string | null {
  return localStorage.getItem("fos_backup_at")
}
