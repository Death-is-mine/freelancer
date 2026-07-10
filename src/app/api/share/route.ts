import { NextResponse } from "next/server"
import { getShareRepo, getServerOwnerId } from "@/lib/share/repo"
import { rateLimit } from "@/lib/validate"

export async function POST(request: Request) {
  if (!rateLimit("share-create", request, 20, 60000)) return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  const ownerId = await getServerOwnerId()
  if (!ownerId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

  const { projectId, projectSnapshot, expiresAt } = await request.json()
  if (!projectId || !projectSnapshot) return NextResponse.json({ error: "Missing projectId or projectSnapshot" }, { status: 400 })

  const repo = getShareRepo()
  const share = await repo.create({ projectId, projectSnapshot, expiresAt: expiresAt || null, enabled: true, ownerId })
  return NextResponse.json(share)
}

export async function GET(request: Request) {
  if (!rateLimit("share-list", request, 60, 60000)) return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  const ownerId = await getServerOwnerId()
  if (!ownerId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

  const repo = getShareRepo()
  const shares = await repo.list(ownerId)
  return NextResponse.json(shares)
}

export async function DELETE(request: Request) {
  if (!rateLimit("share-revoke", request, 30, 60000)) return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  const ownerId = await getServerOwnerId()
  if (!ownerId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })

  const repo = getShareRepo()
  const ok = await repo.revoke(id, ownerId)
  if (!ok) return NextResponse.json({ error: "Share not found or not owned by you" }, { status: 404 })
  return NextResponse.json({ ok: true })
}
