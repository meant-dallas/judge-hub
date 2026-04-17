import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getProjectById, updateProjectStatus } from '@/lib/sheets/projects'
import type { Project } from '@/types/sheets'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params
  const project = await getProjectById(id)
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(project)
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user || !['admin', 'coordinator'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const { id } = await params
  const { status } = await req.json() as { status: Project['status'] }
  await updateProjectStatus(id, status)
  return NextResponse.json({ ok: true })
}
