import { promises as fs } from "fs"
import { join } from "path"

// ponytail: JSON file store — works for single-server deployments.
// Migrate to Google Sheets / database when multi-server or Vercel needed.

const DATA_DIR = join(process.cwd(), ".data")
const SHARES_FILE = join(DATA_DIR, "shares.json")

interface StoredShare {
  id: string
  projectId: string
  token: string
  enabled: boolean
  createdAt: string
  expiresAt: string | null
  projectSnapshot: Record<string, unknown>
}

async function ensureDir() {
  try { await fs.mkdir(DATA_DIR, { recursive: true }) } catch { /* ok */ }
}

async function readShares(): Promise<StoredShare[]> {
  try {
    const raw = await fs.readFile(SHARES_FILE, "utf-8")
    return JSON.parse(raw)
  } catch {
    return []
  }
}

async function writeShares(shares: StoredShare[]) {
  await ensureDir()
  await fs.writeFile(SHARES_FILE, JSON.stringify(shares, null, 2), "utf-8")
}

export async function createShare(projectId: string, projectSnapshot: Record<string, unknown>, expiresAt?: string) {
  const shares = await readShares()
  const share: StoredShare = {
    id: crypto.randomUUID().slice(0, 8),
    projectId,
    token: crypto.randomUUID().slice(0, 12),
    enabled: true,
    createdAt: new Date().toISOString(),
    expiresAt: expiresAt || null,
    projectSnapshot,
  }
  shares.unshift(share)
  await writeShares(shares)
  return share
}

export async function getShareByToken(token: string) {
  const shares = await readShares()
  const share = shares.find((s) => s.token === token && s.enabled)
  if (!share) return null
  if (share.expiresAt && new Date(share.expiresAt) < new Date()) return null
  return share
}

export async function revokeShare(id: string) {
  const shares = await readShares()
  const share = shares.find((s) => s.id === id)
  if (share) {
    share.enabled = false
    await writeShares(shares)
  }
}

export async function getSharesByProject(projectId: string) {
  const shares = await readShares()
  return shares.filter((s) => s.projectId === projectId)
}

export async function getAllShares() {
  return readShares()
}
