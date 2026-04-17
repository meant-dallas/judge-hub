import type { Assignment } from '@/types/sheets'
import { SHEET_NAMES } from './client'
import { readSheet, appendRow, deleteRow } from './helpers'
import { rowToAssignment } from '@/types/sheets'

const COL = {
  ASSIGNMENT_ID: 0,
  JUDGE_EMAIL: 1,
  PARTICIPANT_ID: 2,
  ASSIGNED_AT: 3,
  ASSIGNED_BY: 4,
}

function generateAssignmentId(): string {
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `ASSIGN-${Date.now()}-${rand}`
}

export async function getAllAssignments(): Promise<Assignment[]> {
  const rows = await readSheet(SHEET_NAMES.ASSIGNMENTS)
  return rows.filter((r) => r[COL.ASSIGNMENT_ID]).map(rowToAssignment)
}

export async function getAssignmentsForJudge(judgeEmail: string): Promise<Assignment[]> {
  const rows = await readSheet(SHEET_NAMES.ASSIGNMENTS)
  return rows
    .filter((r) => r[COL.JUDGE_EMAIL]?.toLowerCase() === judgeEmail.toLowerCase())
    .map(rowToAssignment)
}

export async function getAssignmentsForParticipant(participantId: string): Promise<Assignment[]> {
  const rows = await readSheet(SHEET_NAMES.ASSIGNMENTS)
  return rows.filter((r) => r[COL.PARTICIPANT_ID] === participantId).map(rowToAssignment)
}

export async function assignJudgeToParticipant(
  judgeEmail: string,
  participantId: string,
  assignedBy: string
): Promise<Assignment> {
  const rows = await readSheet(SHEET_NAMES.ASSIGNMENTS)
  const duplicate = rows.find(
    (r) =>
      r[COL.JUDGE_EMAIL]?.toLowerCase() === judgeEmail.toLowerCase() &&
      r[COL.PARTICIPANT_ID] === participantId
  )
  if (duplicate) return rowToAssignment(duplicate)

  const now = new Date().toISOString()
  const id = generateAssignmentId()
  await appendRow(SHEET_NAMES.ASSIGNMENTS, [
    id,
    judgeEmail.toLowerCase(),
    participantId,
    now,
    assignedBy.toLowerCase(),
  ])
  return { assignment_id: id, judge_email: judgeEmail, participant_id: participantId, assigned_at: now, assigned_by: assignedBy }
}

export async function removeAssignment(assignmentId: string): Promise<void> {
  const rows = await readSheet(SHEET_NAMES.ASSIGNMENTS)
  const rowIndex = rows.findIndex((r) => r[COL.ASSIGNMENT_ID] === assignmentId)
  if (rowIndex === -1) return
  await deleteRow(SHEET_NAMES.ASSIGNMENTS, rowIndex)
}
