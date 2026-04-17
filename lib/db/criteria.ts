import { eq } from 'drizzle-orm'
import { db, tables } from './index'
import type { Criterion } from '@/types/sheets'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapCriterion(r: any): Criterion {
  return {
    criteria_id: r.criteria_id,
    name:        r.name,
    description: r.description ?? '',
    max_score:   Number(r.max_score),
    weight:      Number(r.weight),
    category:    r.category ?? '',
    event_id:    r.event_id,
  }
}

export async function getAllCriteria(): Promise<Criterion[]> {
  const rows = await db.select().from(tables.criteria)
  return rows.map(mapCriterion)
}

export async function getCriteriaByEvent(eventId: string): Promise<Criterion[]> {
  const rows = await db
    .select()
    .from(tables.criteria)
    .where(eq(tables.criteria.event_id, eventId))
  return rows.map(mapCriterion)
}

export async function getCriteriaById(id: string): Promise<Criterion | null> {
  const rows = await db
    .select()
    .from(tables.criteria)
    .where(eq(tables.criteria.criteria_id, id))
  return rows.length > 0 ? mapCriterion(rows[0]) : null
}

export async function createCriterion(data: {
  criteria_id: string
  name: string
  description: string
  max_score: number
  weight: number
  category: string
  event_id: string
}): Promise<void> {
  await db.insert(tables.criteria).values(data)
}

export async function deleteCriterion(criteriaId: string): Promise<void> {
  await db.delete(tables.criteria).where(eq(tables.criteria.criteria_id, criteriaId))
}
