import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import { getRoleForEmail } from './roles.config'
import type { UserRole } from '@/types'

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  callbacks: {
    async signIn({ profile }) {
      // On initial sign-in, profile is present — reject unauthorized emails here
      // so Auth.js maps it to AccessDenied (not Configuration)
      if (profile?.email) {
        const role = await getRoleForEmail(profile.email)
        return role !== null
      }
      return true
    },

    async jwt({ token, account }) {
      if (account) {
        // account is only present on initial sign-in; signIn() already verified access
        const role = await getRoleForEmail(token.email ?? '')
        token.role = role!
      }
      return token
    },

    async session({ session, token }) {
      session.user.role = token.role as UserRole
      return session
    },
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },
})
