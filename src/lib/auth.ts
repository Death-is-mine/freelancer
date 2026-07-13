import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'

export const { handlers, auth } = NextAuth({
  providers: [
    Google({
      authorization: {
        params: {
          scope:
            'openid email profile https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/calendar.readonly',
          access_type: 'offline',
          prompt: 'consent',
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
        token.locale = (profile as Record<string, string | undefined>).locale
      }
      if (token.expiresAt && Date.now() / 1000 > (token.expiresAt as number) - 300) {
        const res = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: process.env.AUTH_GOOGLE_ID!,
            client_secret: process.env.AUTH_GOOGLE_SECRET!,
            refresh_token: token.refreshToken as string,
            grant_type: 'refresh_token',
          }),
        })
        const data = await res.json()
        token.accessToken = data.access_token
        token.expiresAt = Math.floor(Date.now() / 1000) + data.expires_in
      }
      return token
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        session.user.id = token.sub
        session.user.name = token.name || session.user.name
        session.user.email = token.email || session.user.email
        session.user.image = token.picture || session.user.image
        session.user.locale = token.locale
      }
      return session
    },
  },
  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
      },
    },
  },
  pages: {
    signIn: '/login',
  },
})
