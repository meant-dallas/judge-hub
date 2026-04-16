import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { ROLE_HIERARCHY } from '@/types'
import type { UserRole } from '@/types'

const PROTECTED_ROUTES: Array<{ prefix: string; minRole: UserRole }> = [
  { prefix: '/admin', minRole: 'admin' },
  { prefix: '/coordinator', minRole: 'coordinator' },
  { prefix: '/judge', minRole: 'judge' },
  { prefix: '/profile', minRole: 'judge' },
]

export default auth((req) => {
  const session = req.auth
  const pathname = req.nextUrl.pathname

  const matched = PROTECTED_ROUTES.find((r) => pathname.startsWith(r.prefix))

  if (!matched) return NextResponse.next()

  if (!session?.user) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  const userLevel = ROLE_HIERARCHY[session.user.role]
  const requiredLevel = ROLE_HIERARCHY[matched.minRole]

  if (userLevel < requiredLevel) {
    return NextResponse.redirect(new URL('/unauthorized', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/auth).*)'],
}
