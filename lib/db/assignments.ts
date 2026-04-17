import { eq, and } from 'drizzle-orm'
import { db, tables } from './index'
import type { Assignment } from '@/types/sheets'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapAssignment(r: any): Assignment {
  return {
    assignment_id:  r.assignment_id,
    judge_email:    r.judge_email,
    participant_id: r.participant_id,
    assigned_at:    r.assigned_at,
    assigned_by:    r.assigned_by,
  }
}

function generateAssignmentId(): string {
  return `ASSIGN-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
}

export async function getAllAssignments(): Promise<Assignment[]> {
  const rows = await db.select().from(tables.assignments)
  return rows.map(mapAssignment)
}

export async function getAssignmentsForJudge(judgeEmail: string): Promise<Assignment[]> {
  const rows = await db
    .select()
    .from(tables.assignments)
    .where(eq(tables.assignments.judge_email, judgeEmail.toLowerCase()))
  return rows.map(mapAssignment)
}

export async function getAssignmentsForParticipant(participantId: string): Promise<Assignment[]> {
  const rows = await db
    .select()
    .from(tables.assignments)
    .where(eq(tables.assignments.participant_id, participantId))
  return rows.map(mapAssignment)
}

export async function assignJudgeToParticipant(
  judgeEmail: string,
  participantId: string,
  assignedBy: string
): Promise<Assignment> {
  const email = judgeEmail.toLowerCase()

  const existing = await db
    .select()
    .from(tables.assignments)
    .where(
      and(
        eq(tables.assignments.judge_email, email),
        eq(tables.assignments.participant_id, participantId)
      )
    )

  if (existing.length > 0) return mapAssignment(existing[0])

  const now = new Date().toISOString()
  const id = generateAssignmentId()
  await db.insert(tables.assignments).values({
    assignment_id:  id,
    judge_email:    email,
    participant_id: participantId,
    assigned_at:    now,
    assigned_by:    assignedBy.toLowerCase(),
  })
  return { assignment_id: id, judge_email: email, participant_id: participantId, assigned_at: now, assigned_by: assignedBy }
}

export async function removeAssignment(assignmentId: string): Promise<void> {
  await db
    .delete(tables.assignments)
    .where(eq(tables.assignments.assignment_id, assignmentId))
}
