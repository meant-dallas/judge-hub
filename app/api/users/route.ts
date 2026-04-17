import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getAllUsers, upsertUser, setUserStatus } from '@/lib/db/users'
import { UpsertUserSchema, SetUserStatusSchema } from '@/lib/validation/schemas'

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
  const parsed = UpsertUserSchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  await upsertUser(parsed.data)
  return NextResponse.json({ ok: true })
}

export async function PATCH(req: Request) {
  const session = await auth()
  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const parsed = SetUserStatusSchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  await setUserStatus(parsed.data.email, parsed.data.status)
  return NextResponse.json({ ok: true })
}
