import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getAllParticipants, getParticipantById } from '@/lib/db/participants'
import { getAssignmentsForJudge } from '@/lib/db/assignments'
import { createParticipant } from '@/lib/db/participants'
import { CreateParticipantSchema } from '@/lib/validation/schemas'

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Judges only see participants assigned to them
  if (session.user.role === 'judge') {
    const assignments = await getAssignmentsForJudge(session.user.email!)
    const participants = await Promise.all(
      assignments.map((a) => getParticipantById(a.participant_id))
    )
    return NextResponse.json(participants.filter(Boolean))
  }

  // Admin and coordinator see all
  if (!['admin', 'coordinator'].includes(session.user.role)) {
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
