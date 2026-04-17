import type { Criterion } from '@/types/sheets'
import { SHEET_NAMES } from './client'
import { cache, CRITERIA_CACHE_TTL_MS } from './cache'
import { readSheet } from './helpers'
import { rowToCriterion } from '@/types/sheets'

async function getCriteriaAll(): Promise<Criterion[]> {
  const cacheKey = 'criteria:all'
  const cached = cache.get<Criterion[]>(cacheKey)
  if (cached) return cached

  const rows = await readSheet(SHEET_NAMES.CRITERIA)
  const criteria = rows.filter((r) => r[0]).map(rowToCriterion)
  cache.set(cacheKey, criteria, CRITERIA_CACHE_TTL_MS)
  return criteria
}

export async function getAllCriteria(): Promise<Criterion[]> {
  return getCriteriaAll()
}

export async function getCriteriaByCategory(category: string): Promise<Criterion[]> {
  const all = await getCriteriaAll()
  return all.filter((c) => c.category.toLowerCase() === category.toLowerCase())
}

export async function getCriteriaById(id: string): Promise<Criterion | null> {
  const all = await getCriteriaAll()
  return all.find((c) => c.criteria_id === id) ?? null
}
