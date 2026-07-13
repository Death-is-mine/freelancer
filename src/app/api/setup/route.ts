import { getServerAccessToken } from '@/lib/getServerToken'
import { rateLimit } from '@/lib/validate'
import { NextResponse } from 'next/server'

const DRIVE_BASE = 'https://www.googleapis.com/drive/v3'
const SHEETS_BASE = 'https://sheets.googleapis.com/v4/spreadsheets'

const sheetNames = ['clients', 'projects', 'invoices', 'tasks', 'leads', 'agreements', 'proposals']

const headers: Record<string, string[]> = {
  clients: ['id', 'name', 'email', 'phone', 'company', 'status', 'revenue', 'notes', 'createdAt'],
  projects: ['id', 'name', 'clientId', 'status', 'budget', 'deadline', 'description', 'createdAt'],
  invoices: ['id', 'clientId', 'amount', 'status', 'dueDate', 'issuedDate', 'notes'],
  tasks: ['id', 'title', 'projectId', 'assignee', 'status', 'priority', 'dueDate', 'createdAt'],
  leads: ['id', 'name', 'email', 'company', 'source', 'status', 'value', 'notes', 'createdAt'],
  agreements: ['id', 'title', 'clientId', 'status', 'value', 'signedDate', 'content', 'createdAt'],
  proposals: ['id', 'title', 'clientId', 'status', 'amount', 'sentDate', 'template', 'createdAt'],
}

async function driveRequest(path: string, accessToken: string, options: RequestInit = {}) {
  const res = await fetch(`${DRIVE_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    },
  })
  if (!res.ok) throw new Error(`Drive API error: ${res.status} ${await res.text()}`)
  return res.json()
}

export async function POST(request: Request) {
  if (!rateLimit('setup', request, 5, 60000))
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  const accessToken = await getServerAccessToken()
  if (!accessToken) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const root = await driveRequest(
    '/files?q=name%3D%27Freelancer%27+and+mimeType%3D%27application%2Fvnd%2Egoogle%2Dapps%2Efolder%27+and+trashed%3Dfalse',
    accessToken,
  )

  let rootId: string
  if (root.files?.length > 0) {
    rootId = root.files[0].id
  } else {
    const folder = await driveRequest('/files', accessToken, {
      method: 'POST',
      body: JSON.stringify({ name: 'Freelancer', mimeType: 'application/vnd.google-apps.folder' }),
    })
    rootId = folder.id
  }

  const subfolders = ['Invoices', 'Agreements', 'Templates', 'Attachments', 'Exports']
  const folderIds: Record<string, string> = {}

  for (const name of subfolders) {
    const existing = await driveRequest(
      `/files?q=name%3D%27${encodeURIComponent(name)}%27+and+%27${rootId}%27+in+parents+and+trashed%3Dfalse`,
      accessToken,
    )
    if (existing.files?.length > 0) {
      folderIds[name] = existing.files[0].id
    } else {
      const sub = await driveRequest('/files', accessToken, {
        method: 'POST',
        body: JSON.stringify({
          name,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [rootId],
        }),
      })
      folderIds[name] = sub.id
    }
  }

  const sheetRes = await fetch(SHEETS_BASE, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      properties: { title: 'Freelancer Database' },
      sheets: sheetNames.map((s) => ({ properties: { title: s } })),
    }),
  })
  if (!sheetRes.ok) throw new Error(`Sheets API error: ${sheetRes.status}`)
  const sheet = await sheetRes.json()
  const spreadsheetId = sheet.spreadsheetId

  for (const name of sheetNames) {
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${name}!A1:Z1`,
      {
        method: 'PUT',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          range: `${name}!A1`,
          values: [headers[name]],
          majorDimension: 'ROWS',
        }),
      },
    )
  }

  return NextResponse.json({ rootFolderId: rootId, folderIds, spreadsheetId })
}
