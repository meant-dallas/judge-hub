import type { Participant } from '@/types/sheets'
import { SHEET_NAMES } from './client'
import { readSheet, appendRow, updateRow, findRowByColumn } from './helpers'
import { rowToParticipant } from '@/types/sheets'
import { SheetsNotFoundError } from './errors'

const COL = {
  PARTICIPANT_ID: 0,
  NAME: 1,
  DESCRIPTION: 2,
  CATEGORY: 3,
  TEAM_NAME: 4,
  CONTACT_EMAIL: 5,
  STATUS: 6,
  CREATED_AT: 7,
  EVENT_ID: 8,
}

export async function getAllParticipants(): Promise<Participant[]> {
  const rows = await readSheet(SHEET_NAMES.PARTICIPANTS)
  return rows.filter((r) => r[COL.PARTICIPANT_ID]).map(rowToParticipant)
}

export async function getParticipantById(id: string): Promise<Participant | null> {
  const result = await findRowByColumn(SHEET_NAMES.PARTICIPANTS, COL.PARTICIPANT_ID, id)
  if (!result) return null
  return rowToParticipant(result.row)
}

export async function createParticipant(
  data: Omit<Participant, 'created_at'>
): Promise<Participant> {
  const now = new Date().toISOString()
  await appendRow(SHEET_NAMES.PARTICIPANTS, [
    data.participant_id,
    data.name,
    data.description,
    data.category,
    data.team_name,
    data.contact_email,
    data.status,
    now,
    data.event_id ?? '',
  ])
  return { ...data, created_at: now }
}

export async function getParticipantsByEvent(eventId: string): Promise<Participant[]> {
  const all = await getAllParticipants()
  return all.filter((p) => p.event_id === eventId)
}

export async function updateParticipantStatus(
  participantId: string,
  status: Participant['status']
): Promise<void> {
  const result = await findRowByColumn(SHEET_NAMES.PARTICIPANTS, COL.PARTICIPANT_ID, participantId)
  if (!result) throw new SheetsNotFoundError(`Participant "${participantId}" not found`)

  const updated = [...result.row]
  updated[COL.STATUS] = status
  await updateRow(SHEET_NAMES.PARTICIPANTS, result.rowIndex, updated)
}
