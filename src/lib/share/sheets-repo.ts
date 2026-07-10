import { type ShareData, type ShareRepository, generateId, generateToken } from "./types"

const SHEETS_BASE = "https://sheets.googleapis.com/v4/spreadsheets"
const SHEET_NAME = "shares"
const RANGE = `${SHEET_NAME}!A:H`
const HEADERS = ["id", "projectId", "token", "enabled", "createdAt", "expiresAt", "ownerId", "projectSnapshot"]

async function ensureSheet(accessToken: string) {
  const sid = process.env.SHEETS_ID
  if (!sid) throw new Error("SHEETS_ID not configured")
  const res = await fetch(`${SHEETS_BASE}/${sid}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) throw new Error(`Failed to get spreadsheet: ${res.status}`)
  const data = await res.json()
  const hasShares = data.sheets?.some((s: { properties: { title: string } }) => s.properties.title === SHEET_NAME)
  if (hasShares) return
  await fetch(`${SHEETS_BASE}/${sid}:batchUpdate`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      requests: [{ addSheet: { properties: { title: SHEET_NAME } } }],
    }),
  })
  await fetch(`${SHEETS_BASE}/${sid}/values/${RANGE}?valueInputOption=USER_ENTERED`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ range: RANGE, values: [HEADERS], majorDimension: "ROWS" }),
  })
}

function rowToShare(row: string[]): ShareData | null {
  if (row.length < 8) return null
  try {
    return {
      id: row[0],
      projectId: row[1],
      token: row[2],
      enabled: row[3] === "TRUE",
      createdAt: row[4],
      expiresAt: row[5] || null,
      ownerId: row[6],
      projectSnapshot: JSON.parse(row[7]),
    }
  } catch {
    return null
  }
}

function shareToRow(s: ShareData): string[] {
  return [
    s.id,
    s.projectId,
    s.token,
    s.enabled ? "TRUE" : "FALSE",
    s.createdAt,
    s.expiresAt || "",
    s.ownerId,
    JSON.stringify(s.projectSnapshot),
  ]
}

async function fetchSheet(accessToken: string): Promise<ShareData[]> {
  const sid = process.env.SHEETS_ID
  if (!sid) return []
  const res = await fetch(`${SHEETS_BASE}/${sid}/values/${RANGE}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  })
  if (!res.ok) return []
  const data = await res.json()
  if (!data.values || data.values.length < 2) return []
  return data.values.slice(1).map(rowToShare).filter(Boolean) as ShareData[]
}

async function overwriteSheet(accessToken: string, shares: ShareData[]) {
  const sid = process.env.SHEETS_ID
  if (!sid) return
  const values = [HEADERS, ...shares.map(shareToRow)]
  await fetch(`${SHEETS_BASE}/${sid}/values/${RANGE}?valueInputOption=USER_ENTERED`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ range: RANGE, values, majorDimension: "ROWS" }),
  })
}

export function createSheetsRepo(getToken: () => Promise<string | null>): ShareRepository {
  async function withToken<T>(fn: (token: string) => Promise<T>): Promise<T> {
    const token = await getToken()
    if (!token) throw new Error("Not authenticated")
    await ensureSheet(token)
    return fn(token)
  }

  return {
    async create(data) {
      return withToken(async (token) => {
        const share: ShareData = {
          id: generateId(),
          token: generateToken(),
          createdAt: new Date().toISOString(),
          ...data,
        }
        await fetch(
          `${SHEETS_BASE}/${process.env.SHEETS_ID}/values/${RANGE}:append?valueInputOption=USER_ENTERED`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify({ values: [shareToRow(share)], majorDimension: "ROWS" }),
          },
        )
        return share
      })
    },

    async getByToken(token) {
      return withToken(async (t) => {
        const all = await fetchSheet(t)
        return all.find((s) => s.token === token) || null
      })
    },

    async revoke(id, ownerId) {
      return withToken(async (token) => {
        const all = await fetchSheet(token)
        const idx = all.findIndex((s) => s.id === id && s.ownerId === ownerId)
        if (idx === -1) return false
        all[idx].enabled = false
        await overwriteSheet(token, all)
        return true
      })
    },

    async list(ownerId) {
      return withToken(async (token) => {
        const all = await fetchSheet(token)
        return all.filter((s) => s.ownerId === ownerId)
      })
    },

    async listByProject(projectId, ownerId) {
      return withToken(async (token) => {
        const all = await fetchSheet(token)
        return all.filter((s) => s.projectId === projectId && s.ownerId === ownerId)
      })
    },

    async cleanupExpired() {
      return withToken(async (token) => {
        const all = await fetchSheet(token)
        const now = Date.now()
        const active = all.filter((s) => !s.expiresAt || new Date(s.expiresAt).getTime() > now)
        const removed = all.length - active.length
        if (removed > 0) await overwriteSheet(token, active)
        return removed
      })
    },
  }
}
