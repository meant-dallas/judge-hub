import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getScoresForParticipant, getScoresByJudge, upsertScore } from '@/lib/sheets/scores'
import { UpsertScoreSchema } from '@/lib/validation/schemas'

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { searchParams } = new URL(req.url)
  const participantId = searchParams.get('participantId')
  const judgeEmail = searchParams.get('judgeEmail')

  if (participantId) {
    if (session.user.role === 'judge') {
      const scores = await getScoresByJudge(session.user.email!)
      return NextResponse.json(scores.filter((s) => s.participant_id === participantId))
    }
    return NextResponse.json(await getScoresForParticipant(participantId))
  }

  if (judgeEmail) {
    if (session.user.role === 'judge' && session.user.email !== judgeEmail) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    return NextResponse.json(await getScoresByJudge(judgeEmail))
  }

  return NextResponse.json({ error: 'participantId or judgeEmail query param required' }, { status: 400 })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const parsed = UpsertScoreSchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  if (
    session.user.role === 'judge' &&
    parsed.data.judge_email.toLowerCase() !== session.user.email?.toLowerCase()
  ) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await upsertScore(parsed.data)
  return NextResponse.json({ ok: true })
}
