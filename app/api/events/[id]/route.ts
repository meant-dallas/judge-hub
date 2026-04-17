import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getEventById, updateEventStatus } from '@/lib/sheets/events'
import { getParticipantsByEvent } from '@/lib/sheets/participants'
import { getCriteriaByEvent } from '@/lib/sheets/criteria'
import { UpdateEventStatusSchema } from '@/lib/validation/schemas'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params
  const event = await getEventById(id)
  if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(event)
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const { id } = await params
  const parsed = UpdateEventStatusSchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  await updateEventStatus(id, parsed.data.status)
  return NextResponse.json({ ok: true })
}
