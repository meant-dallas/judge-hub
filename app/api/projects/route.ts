import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getAllProjects, createProject } from '@/lib/sheets/projects'
import { CreateProjectSchema } from '@/lib/validation/schemas'

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
  const parsed = CreateProjectSchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  const project = await createProject(parsed.data)
  return NextResponse.json(project, { status: 201 })
}
