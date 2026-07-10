import NextAuth from "next-auth"
import Google from "next-auth/providers/google"

export const { handlers, auth } = NextAuth({
  providers: [
    Google({
      authorization: {
        params: {
          scope:
            "openid email profile https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/gmail.readonly",
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
        token.expiresAt = account.expires_at
      }
      if (profile) {
        token.name = profile.name
        token.email = profile.email
        token.picture = profile.picture
        token.locale = (profile as any).locale
      }
      if (token.expiresAt && Date.now() / 1000 > (token.expiresAt as number) - 300) {
        const res = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_id: process.env.AUTH_GOOGLE_ID!,
            client_secret: process.env.AUTH_GOOGLE_SECRET!,
            refresh_token: token.refreshToken as string,
            grant_type: "refresh_token",
          }),
        })
        const data = await res.json()
        token.accessToken = data.access_token
        token.expiresAt = Math.floor(Date.now() / 1000) + data.expires_in
      }
      return token
    },
    async session({ session, token }) {
      const s = session as any
      if (s.user) {
        s.user.id = token.sub!
        s.user.name = (token.name as string) || s.user.name
        s.user.email = (token.email as string) || s.user.email
        s.user.image = (token.picture as string) || s.user.image
        s.user.locale = token.locale as string
      }
      s.accessToken = token.accessToken as string
      s.refreshToken = token.refreshToken as string
      s.spreadsheetId = process.env.SHEETS_ID || null
      return s as any
    },
  },
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
      },
    },
  },
  pages: {
    signIn: "/login",
  },
})
