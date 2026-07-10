import { getServerAccessToken } from "@/lib/getServerToken"
import { rateLimit } from "@/lib/validate"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  if (!rateLimit("drive-upload", 10, 60000)) return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  const token = await getServerAccessToken()
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  let file: File | null = null
  try {
    const formData = await request.formData()
    file = formData.get("file") as File
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 })
  }
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 })
  if (file.size > 50 * 1024 * 1024) return NextResponse.json({ error: "File too large (max 50MB)" }, { status: 400 })

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 })

    const body = new FormData()
    body.append("metadata", new Blob([JSON.stringify({ name: file.name, parents: [] })], { type: "application/json" }))
    body.append("file", file)

    const res = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body,
    })

    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
