import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getAllEvents, createEvent } from '@/lib/db/events'
import { CreateEventSchema } from '@/lib/validation/schemas'

export async function GET() {
  const session = await auth()
  if (!session?.user || !['admin', 'coordinator'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const events = await getAllEvents()
  return NextResponse.json(events)
}

export async function POST(req: Request) {
  const session = await auth()
  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const parsed = CreateEventSchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  const event = await createEvent({ ...parsed.data, created_by: session.user.email!, active_participant_id: '', time_limit_minutes: 0, overtime_deduction: 0 })
  return NextResponse.json(event, { status: 201 })
}
