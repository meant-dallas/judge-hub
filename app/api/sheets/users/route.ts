import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getAllUsers, upsertUser, setUserStatus } from '@/lib/sheets/users'
import type { UserRole } from '@/types'

export async function GET() {
  const session = await auth()
  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const users = await getAllUsers()
  return NextResponse.json(users)
}

export async function POST(req: Request) {
  const session = await auth()
  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const body = await req.json()
  const { email, role, name } = body as { email?: string; role?: UserRole; name?: string }
  if (!email || !role) {
    return NextResponse.json({ error: 'email and role are required' }, { status: 400 })
  }
  await upsertUser({ email, role, name })
  return NextResponse.json({ ok: true })
}

export async function PATCH(req: Request) {
  const session = await auth()
  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const body = await req.json()
  const { email, status } = body as { email?: string; status?: 'active' | 'inactive' }
  if (!email || !status) {
    return NextResponse.json({ error: 'email and status are required' }, { status: 400 })
  }
  await setUserStatus(email, status)
  return NextResponse.json({ ok: true })
}
