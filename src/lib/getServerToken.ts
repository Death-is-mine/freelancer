import { cookies } from "next/headers"
import { decode } from "next-auth/jwt"

export async function getServerAccessToken(): Promise<string | null> {
  try {
    const cookieStore = await cookies()
    const cookie = cookieStore.get("next-auth.session-token") || cookieStore.get("__Secure-next-auth.session-token")
    if (!cookie) return null

    const token = await decode({
      token: cookie.value,
      secret: process.env.AUTH_SECRET!,
      salt: cookie.name.startsWith("__Secure-") ? "__Secure-next-auth.session-token" : "next-auth.session-token",
    })
    return (token?.accessToken as string) || null
  } catch {
    return null
  }
}
