import { getServerAccessToken } from '@/lib/getServerToken'
import { rateLimit } from '@/lib/validate'
import { NextResponse } from 'next/server'

export async function DELETE(request: Request) {
  if (!rateLimit('drive-delete', request, 30, 60000))
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  const token = await getServerAccessToken()
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const fileId = searchParams.get('fileId')
  if (!fileId) return NextResponse.json({ error: 'No fileId' }, { status: 400 })

  try {
    const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) throw new Error('Delete failed')
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}
