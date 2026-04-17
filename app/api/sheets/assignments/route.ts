import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import {
  getAssignmentsForJudge,
  getAssignmentsForProject,
  assignJudgeToProject,
} from '@/lib/sheets/assignments'

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { searchParams } = new URL(req.url)
  const judgeEmail = searchParams.get('judgeEmail')
  const projectId = searchParams.get('projectId')

  if (judgeEmail) {
    if (session.user.role === 'judge' && session.user.email !== judgeEmail) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    return NextResponse.json(await getAssignmentsForJudge(judgeEmail))
  }
  if (projectId) {
    return NextResponse.json(await getAssignmentsForProject(projectId))
  }
  return NextResponse.json({ error: 'judgeEmail or projectId query param required' }, { status: 400 })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user || !['admin', 'coordinator'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const { judgeEmail, projectId } = await req.json() as { judgeEmail: string; projectId: string }
  if (!judgeEmail || !projectId) {
    return NextResponse.json({ error: 'judgeEmail and projectId are required' }, { status: 400 })
  }
  const assignment = await assignJudgeToProject(judgeEmail, projectId, session.user.email!)
  return NextResponse.json(assignment, { status: 201 })
}
