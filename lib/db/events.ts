import { eq, sql } from 'drizzle-orm'
import { db, tables } from './index'
import type { Event } from '@/types/sheets'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapEvent(r: any): Event {
  return {
    event_id:             r.event_id,
    name:                 r.name,
    description:          r.description ?? '',
    date:                 r.date,
    status:               r.status as Event['status'],
    created_at:           r.created_at,
    created_by:           r.created_by,
    active_participant_id: r.active_participant_id ?? '',
    time_limit_minutes:   Number(r.time_limit_minutes ?? 0),
    overtime_deduction:   Number(r.overtime_deduction ?? 0),
    normalize_scores:     Boolean(r.normalize_scores),
  }
}

export async function getAllEvents(): Promise<Event[]> {
  const rows = await db.select().from(tables.events)
  return rows.map(mapEvent)
}

export async function getEventById(id: string): Promise<Event | null> {
  const rows = await db.select().from(tables.events).where(eq(tables.events.event_id, id))
  return rows.length > 0 ? mapEvent(rows[0]) : null
}

export async function createEvent(data: Omit<Event, 'created_at'>): Promise<Event> {
  const now = new Date().toISOString()
  const row = {
    event_id:             data.event_id,
    name:                 data.name,
    description:          data.description,
    date:                 data.date,
    status:               data.status,
    created_at:           now,
    created_by:           data.created_by,
    active_participant_id: data.active_participant_id,
    time_limit_minutes:   data.time_limit_minutes,
    overtime_deduction:   data.overtime_deduction,
    normalize_scores:     data.normalize_scores ? 1 : 0,
  }
  await db.insert(tables.events).values(row)
  return { ...row, normalize_scores: data.normalize_scores }
}

export async function updateEventStatus(eventId: string, status: Event['status']): Promise<void> {
  await db.update(tables.events).set({ status }).where(eq(tables.events.event_id, eventId))
}

export async function updateActiveParticipant(eventId: string, participantId: string): Promise<void> {
  await db
    .update(tables.events)
    .set({ active_participant_id: sql`${participantId}` })
    .where(eq(tables.events.event_id, eventId))
}

export async function updateEventNormalization(eventId: string, normalize: boolean): Promise<void> {
  await db
    .update(tables.events)
    .set({ normalize_scores: sql`${normalize ? 1 : 0}` })
    .where(eq(tables.events.event_id, eventId))
}

export async function updateEventTimeLimit(
  eventId: string,
  timeLimitMinutes: number,
  overtimeDeduction: number
): Promise<void> {
  await db
    .update(tables.events)
    .set({ time_limit_minutes: sql`${timeLimitMinutes}`, overtime_deduction: sql`${overtimeDeduction}` })
    .where(eq(tables.events.event_id, eventId))
}
