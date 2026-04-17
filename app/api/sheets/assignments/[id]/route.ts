import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { removeAssignment } from '@/lib/sheets/assignments'

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user || !['admin', 'coordinator'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const { id } = await params
  await removeAssignment(id)
  return NextResponse.json({ ok: true })
}
