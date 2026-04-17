import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getAllParticipants, createParticipant } from '@/lib/db/participants'
import { CreateParticipantSchema } from '@/lib/validation/schemas'

export async function GET() {
  const session = await auth()
  if (!session?.user || !['admin', 'coordinator'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const participants = await getAllParticipants()
  return NextResponse.json(participants)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user || !['admin', 'coordinator'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const parsed = CreateParticipantSchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  const participant = await createParticipant({ ...parsed.data, overtime: false })
  return NextResponse.json(participant, { status: 201 })
}
