import { getServerAccessToken } from '@/lib/getServerToken'
import { NextResponse } from 'next/server'

interface GCalEvent {
  id: string
  summary?: string
  htmlLink?: string
  start?: { dateTime?: string; date?: string }
  end?: { dateTime?: string; date?: string }
}

export async function GET() {
  const token = await getServerAccessToken()
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const now = new Date()
    const weekLater = new Date(now.getTime() + 7 * 86400000)
    const params = new URLSearchParams({
      timeMin: now.toISOString(),
      timeMax: weekLater.toISOString(),
      orderBy: 'startTime',
      singleEvents: 'true',
      maxResults: '10',
    })
    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    )
    if (!res.ok) {
      if (res.status === 401) return NextResponse.json({ error: 'Token expired' }, { status: 401 })
      if (res.status === 403)
        return NextResponse.json({ error: 'Calendar access not granted' }, { status: 403 })
      return NextResponse.json({ error: 'Calendar API error' }, { status: 500 })
    }
    const data = await res.json()
    const events: unknown[] = data.items || []
    const mapped = events.map((e) => {
      const ev = e as GCalEvent
      return {
        id: ev.id,
        summary: ev.summary || '(No title)',
        start: ev.start?.dateTime || ev.start?.date || '',
        end: ev.end?.dateTime || ev.end?.date || '',
        link: ev.htmlLink || '',
      }
    })
    return NextResponse.json({ events: mapped })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch calendar' }, { status: 500 })
  }
}
