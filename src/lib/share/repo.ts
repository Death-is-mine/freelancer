import { cookies } from "next/headers"
import { decode } from "next-auth/jwt"
import { type ShareRepository } from "./types"
import { createJsonRepo } from "./json-repo"
import { createSheetsRepo } from "./sheets-repo"
import { getServerAccessToken } from "@/lib/getServerToken"

let repo: ShareRepository | null = null

export function getShareRepo(): ShareRepository {
  if (repo) return repo
  // ponytail: sheets is durable (real storage), json is ephemeral (local dev only)
  const backend = process.env.SHARE_BACKEND || "sheets"
  if (backend === "sheets") {
    repo = createSheetsRepo(() => getServerAccessToken())
  } else {
    repo = createJsonRepo()
  }
  return repo
}

export async function getServerOwnerId(): Promise<string | null> {
  try {
    const cookieStore = await cookies()
    const cookie = cookieStore.get("next-auth.session-token") || cookieStore.get("__Secure-next-auth.session-token")
    if (!cookie) return null
    const token = await decode({
      token: cookie.value,
      secret: process.env.AUTH_SECRET!,
      salt: cookie.name.startsWith("__Secure-") ? "__Secure-next-auth.session-token" : "next-auth.session-token",
    })
    return (token?.sub as string) || null
  } catch {
    return null
  }
}
