import { NextResponse } from "next/server"
import { createShare, getAllShares, revokeShare } from "@/lib/server-store"
import { getServerAccessToken } from "@/lib/getServerToken"
import { rateLimit } from "@/lib/validate"

export async function POST(request: Request) {
  if (!rateLimit("share-create", request, 20, 60000)) return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  const token = await getServerAccessToken()
  if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

  const { projectId, projectSnapshot, expiresAt } = await request.json()
  if (!projectId || !projectSnapshot) return NextResponse.json({ error: "Missing projectId or projectSnapshot" }, { status: 400 })

  const share = await createShare(projectId, projectSnapshot, expiresAt)
  return NextResponse.json(share)
}

export async function GET(request: Request) {
  const token = await getServerAccessToken()
  if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

  const shares = await getAllShares()
  return NextResponse.json(shares)
}

export async function DELETE(request: Request) {
  const token = await getServerAccessToken()
  if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })

  await revokeShare(id)
  return NextResponse.json({ ok: true })
}
