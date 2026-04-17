import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { submitScores } from '@/lib/sheets/scores'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { projectId } = await req.json() as { projectId: string }
  if (!projectId) {
    return NextResponse.json({ error: 'projectId is required' }, { status: 400 })
  }
  await submitScores(session.user.email!, projectId)
  return NextResponse.json({ ok: true })
}
