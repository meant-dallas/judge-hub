import type { Event } from '@/types/sheets'
import { SHEET_NAMES } from './client'
import { cache, SHEET_CACHE_TTL_MS } from './cache'
import { readSheet, appendRow, updateRow, findRowByColumn } from './helpers'
import { rowToEvent } from '@/types/sheets'
import { SheetsNotFoundError } from './errors'

const COL = {
  EVENT_ID: 0,
  NAME: 1,
  DESCRIPTION: 2,
  DATE: 3,
  STATUS: 4,
  CREATED_AT: 5,
  CREATED_BY: 6,
  ACTIVE_PARTICIPANT_ID: 7,
}

export async function getAllEvents(): Promise<Event[]> {
  const rows = await readSheet(SHEET_NAMES.EVENTS)
  return rows.filter((r) => r[COL.EVENT_ID]).map(rowToEvent)
}

export async function getEventById(id: string): Promise<Event | null> {
  const result = await findRowByColumn(SHEET_NAMES.EVENTS, COL.EVENT_ID, id)
  if (!result) return null
  return rowToEvent(result.row)
}

export async function createEvent(
  data: Omit<Event, 'created_at'>
): Promise<Event> {
  const now = new Date().toISOString()
  await appendRow(SHEET_NAMES.EVENTS, [
    data.event_id,
    data.name,
    data.description,
    data.date,
    data.status,
    now,
    data.created_by,
    '',  // active_participant_id — empty by default
  ])
  cache.invalidate(`sheet:${SHEET_NAMES.EVENTS}`)
  return { ...data, created_at: now }
}

export async function updateEventStatus(
  eventId: string,
  status: Event['status']
): Promise<void> {
  const result = await findRowByColumn(SHEET_NAMES.EVENTS, COL.EVENT_ID, eventId)
  if (!result) throw new SheetsNotFoundError(`Event "${eventId}" not found`)

  const updated = [...result.row]
  updated[COL.STATUS] = status
  await updateRow(SHEET_NAMES.EVENTS, result.rowIndex, updated)
}

export async function updateActiveParticipant(
  eventId: string,
  participantId: string  // pass '' to clear
): Promise<void> {
  const result = await findRowByColumn(SHEET_NAMES.EVENTS, COL.EVENT_ID, eventId)
  if (!result) throw new SheetsNotFoundError(`Event "${eventId}" not found`)

  const updated = [...result.row]
  // Pad row if it predates this column
  while (updated.length <= COL.ACTIVE_PARTICIPANT_ID) updated.push('')
  updated[COL.ACTIVE_PARTICIPANT_ID] = participantId
  await updateRow(SHEET_NAMES.EVENTS, result.rowIndex, updated)
}
