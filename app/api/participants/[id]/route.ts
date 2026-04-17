import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getParticipantById, updateParticipantStatus } from '@/lib/db/participants'
import { UpdateParticipantStatusSchema } from '@/lib/validation/schemas'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params
  const participant = await getParticipantById(id)
  if (!participant) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(participant)
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user || !['admin', 'coordinator'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const { id } = await params
  const parsed = UpdateParticipantStatusSchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  await updateParticipantStatus(id, parsed.data.status)
  return NextResponse.json({ ok: true })
}
