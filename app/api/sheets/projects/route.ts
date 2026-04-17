import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getAllProjects, createProject } from '@/lib/sheets/projects'
import type { Project } from '@/types/sheets'

export async function GET() {
  const session = await auth()
  if (!session?.user || !['admin', 'coordinator'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const projects = await getAllProjects()
  return NextResponse.json(projects)
}

export async function POST(req: Request) {
  const session = await auth()
  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const body = await req.json() as Omit<Project, 'created_at'>
  if (!body.project_id || !body.title) {
    return NextResponse.json({ error: 'project_id and title are required' }, { status: 400 })
  }
  const project = await createProject(body)
  return NextResponse.json(project, { status: 201 })
}
