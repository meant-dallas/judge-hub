import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { submitScores } from '@/lib/sheets/scores'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { participantId } = await req.json() as { participantId: string }
  if (!participantId) {
    return NextResponse.json({ error: 'participantId is required' }, { status: 400 })
  }
  await submitScores(session.user.email!, participantId)
  return NextResponse.json({ ok: true })
}
