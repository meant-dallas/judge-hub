import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getScoresForProject, getScoresByJudge, upsertScore } from '@/lib/sheets/scores'
import type { Score } from '@/types/sheets'

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { searchParams } = new URL(req.url)
  const projectId = searchParams.get('projectId')
  const judgeEmail = searchParams.get('judgeEmail')

  if (projectId) {
    // Admins/coordinators can view any project's scores; judges only their own
    if (session.user.role === 'judge') {
      const scores = await getScoresByJudge(session.user.email!)
      return NextResponse.json(scores.filter((s) => s.project_id === projectId))
    }
    return NextResponse.json(await getScoresForProject(projectId))
  }

  if (judgeEmail) {
    // Judges can only fetch their own scores
    if (session.user.role === 'judge' && session.user.email !== judgeEmail) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    return NextResponse.json(await getScoresByJudge(judgeEmail))
  }

  return NextResponse.json({ error: 'projectId or judgeEmail query param required' }, { status: 400 })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = await req.json() as Omit<Score, 'score_id' | 'submitted_at'>

  // Judges can only submit scores under their own email
  if (
    session.user.role === 'judge' &&
    body.judge_email?.toLowerCase() !== session.user.email?.toLowerCase()
  ) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await upsertScore(body)
  return NextResponse.json({ ok: true })
}
