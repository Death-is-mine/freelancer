import { NextResponse } from 'next/server'
import { getShareRepo } from '@/lib/share/repo'
import { toPublicView } from '@/lib/share/types'
import { rateLimit } from '@/lib/validate'

export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  if (!rateLimit('share-resolve', _request, 120, 60000))
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  const { token } = await params
  const repo = getShareRepo()
  const share = await repo.getByToken(token)
  if (!share) return NextResponse.json({ error: 'Share not found' }, { status: 404 })
  const view = toPublicView(share)
  if (!view) return NextResponse.json({ error: 'Share expired or revoked' }, { status: 410 })
  return NextResponse.json(view)
}
