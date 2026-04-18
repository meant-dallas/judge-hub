import { eq, sql } from 'drizzle-orm'
import { db, tables } from './index'
import type { Participant } from '@/types/sheets'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapParticipant(r: any): Participant {
  return {
    participant_id: r.participant_id,
    name:           r.name,
    description:    r.description ?? '',
    category:       r.category ?? '',
    team_name:      r.team_name ?? '',
    contact_email:  r.contact_email ?? '',
    status:         r.status as Participant['status'],
    created_at:     r.created_at,
    event_id:       r.event_id,
    overtime:       Boolean(r.overtime),
  }
}

export async function getAllParticipants(): Promise<Participant[]> {
  const rows = await db.select().from(tables.participants)
  return rows.map(mapParticipant)
}

export async function getParticipantById(id: string): Promise<Participant | null> {
  const rows = await db
    .select()
    .from(tables.participants)
    .where(eq(tables.participants.participant_id, id))
  return rows.length > 0 ? mapParticipant(rows[0]) : null
}

export async function getParticipantsByEvent(eventId: string): Promise<Participant[]> {
  const rows = await db
    .select()
    .from(tables.participants)
    .where(eq(tables.participants.event_id, eventId))
  return rows.map(mapParticipant)
}

export async function createParticipant(data: Omit<Participant, 'created_at'>): Promise<Participant> {
  const now = new Date().toISOString()
  const row = {
    participant_id: data.participant_id,
    name:           data.name,
    description:    data.description,
    category:       data.category,
    team_name:      data.team_name,
    contact_email:  data.contact_email,
    status:         data.status,
    created_at:     now,
    event_id:       data.event_id,
    overtime:       data.overtime ? 1 : 0,
  }
  await db.insert(tables.participants).values(row)
  return { ...row, overtime: data.overtime }
}

export async function updateParticipantStatus(
  participantId: string,
  status: Participant['status']
): Promise<void> {
  await db
    .update(tables.participants)
    .set({ status })
    .where(eq(tables.participants.participant_id, participantId))
}

export async function updateParticipantOvertime(
  participantId: string,
  overtime: boolean
): Promise<void> {
  await db
    .update(tables.participants)
    .set({ overtime: sql`${overtime ? 1 : 0}` })
    .where(eq(tables.participants.participant_id, participantId))
}
