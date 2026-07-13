import { promises as fs } from 'fs'
import { join } from 'path'
import { type ShareData, type ShareRepository, generateId, generateToken } from './types'

// ponytail: JSON file store — single-server only. Migrate to Sheets/DB for multi-server.

export function createJsonRepo(sharesFile?: string): ShareRepository {
  const filePath = sharesFile || join(process.cwd(), '.data', 'shares.json')

  async function ensureDir() {
    try {
      await fs.mkdir(join(filePath, '..'), { recursive: true })
    } catch {
      /* ok */
    }
  }

  async function readAll(): Promise<ShareData[]> {
    try {
      const raw = await fs.readFile(filePath, 'utf-8')
      return JSON.parse(raw)
    } catch {
      return []
    }
  }

  async function writeAll(shares: ShareData[]) {
    await ensureDir()
    await fs.writeFile(filePath, JSON.stringify(shares, null, 2), 'utf-8')
  }

  return {
    async create(data) {
      const shares = await readAll()
      const share: ShareData = {
        id: generateId(),
        token: generateToken(),
        createdAt: new Date().toISOString(),
        ...data,
      }
      shares.unshift(share)
      await writeAll(shares)
      return share
    },

    async getByToken(token) {
      const shares = await readAll()
      return shares.find((s) => s.token === token) || null
    },

    async revoke(id, ownerId) {
      const shares = await readAll()
      const idx = shares.findIndex((s) => s.id === id && s.ownerId === ownerId)
      if (idx === -1) return false
      shares[idx].enabled = false
      await writeAll(shares)
      return true
    },

    async list(ownerId) {
      const shares = await readAll()
      return shares.filter((s) => s.ownerId === ownerId)
    },

    async listByProject(projectId, ownerId) {
      const shares = await readAll()
      return shares.filter((s) => s.projectId === projectId && s.ownerId === ownerId)
    },

    async cleanupExpired() {
      const shares = await readAll()
      const now = Date.now()
      const active = shares.filter((s) => !s.expiresAt || new Date(s.expiresAt).getTime() > now)
      const removed = shares.length - active.length
      if (removed > 0) await writeAll(active)
      return removed
    },
  }
}
