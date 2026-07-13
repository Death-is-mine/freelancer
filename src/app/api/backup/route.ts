import { NextResponse } from 'next/server'
import { getServerAccessToken } from '@/lib/getServerToken'
import { rateLimit } from '@/lib/validate'

const SHEETS_BASE = 'https://sheets.googleapis.com/v4/spreadsheets'
const SHEET_NAME = 'backup'
const RANGE = `${SHEET_NAME}!A:B`

async function ensureSheet(accessToken: string) {
  const sid = process.env.SHEETS_ID
  if (!sid) return
  const res = await fetch(`${SHEETS_BASE}/${sid}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) throw new Error(`Failed to get spreadsheet: ${res.status}`)
  const data = await res.json()
  const has = data.sheets?.some(
    (s: { properties: { title: string } }) => s.properties.title === SHEET_NAME,
  )
  if (has) return
  await fetch(`${SHEETS_BASE}/${sid}:batchUpdate`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ requests: [{ addSheet: { properties: { title: SHEET_NAME } } }] }),
  })
  await fetch(`${SHEETS_BASE}/${sid}/values/${RANGE}?valueInputOption=USER_ENTERED`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      range: RANGE,
      values: [
        ['timestamp', 'data'],
        [new Date().toISOString(), ''],
      ],
      majorDimension: 'ROWS',
    }),
  })
}

export async function POST(request: Request) {
  if (!rateLimit('backup-write', request, 10, 60000))
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  const token = await getServerAccessToken()
  if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  try {
    const payload = await request.json()
    const sid = process.env.SHEETS_ID
    if (!sid) return NextResponse.json({ error: 'SHEETS_ID not configured' }, { status: 500 })
    await ensureSheet(token)
    const timestamp = new Date().toISOString()
    const row = [timestamp, JSON.stringify(payload)]
    const res = await fetch(
      `${SHEETS_BASE}/${sid}/values/${RANGE}:append?valueInputOption=USER_ENTERED`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ values: [row], majorDimension: 'ROWS' }),
      },
    )
    if (!res.ok) return NextResponse.json({ error: 'Sheets API error' }, { status: 502 })
    return NextResponse.json({ timestamp })
  } catch {
    return NextResponse.json({ error: 'Backup failed' }, { status: 500 })
  }
}

export async function GET() {
  const token = await getServerAccessToken()
  if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  try {
    const sid = process.env.SHEETS_ID
    if (!sid) return NextResponse.json({ error: 'SHEETS_ID not configured' }, { status: 500 })
    await ensureSheet(token)
    const res = await fetch(`${SHEETS_BASE}/${sid}/values/${RANGE}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
    if (!res.ok) return NextResponse.json({ error: 'Sheets API error' }, { status: 502 })
    const data = await res.json()
    const rows = data.values || []
    if (rows.length < 2) return NextResponse.json({ data: null, timestamp: null })
    const last = rows[rows.length - 1]
    return NextResponse.json({ data: JSON.parse(last[1] || 'null'), timestamp: last[0] || null })
  } catch {
    return NextResponse.json({ error: 'Failed to read backup' }, { status: 500 })
  }
}
