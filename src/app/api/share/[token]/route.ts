import { NextResponse } from "next/server"
import { getShareByToken } from "@/lib/server-store"

export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const share = await getShareByToken(token)
  if (!share) return NextResponse.json({ error: "Share not found or expired" }, { status: 404 })
  return NextResponse.json(share)
}
