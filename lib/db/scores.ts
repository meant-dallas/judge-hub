import { eq, and, inArray, sql } from 'drizzle-orm'
import { db, tables } from './index'
import type { Score, LeaderboardEntry } from '@/types/sheets'
import { getAllCriteria, getCriteriaByEvent } from './criteria'
import { getAllParticipants, getParticipantsByEvent } from './participants'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapScore(r: any): Score {
  return {
    score_id:       r.score_id,
    judge_email:    r.judge_email,
    participant_id: r.participant_id,
    criteria_id:    r.criteria_id,
    score:          Number(r.score),
    comments:       r.comments ?? '',
    submitted_at:   r.submitted_at ?? '',
    is_draft:       Boolean(r.is_draft),
  }
}

function generateScoreId(): string {
  return `SCORE-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
}

export async function getScoresForParticipant(participantId: string): Promise<Score[]> {
  const rows = await db
    .select()
    .from(tables.scores)
    .where(eq(tables.scores.participant_id, participantId))
  return rows.map(mapScore)
}

export async function getScoresByJudge(judgeEmail: string): Promise<Score[]> {
  const rows = await db
    .select()
    .from(tables.scores)
    .where(eq(tables.scores.judge_email, judgeEmail.toLowerCase()))
  return rows.map(mapScore)
}

export async function upsertScores(
  scores: Array<Omit<Score, 'score_id' | 'submitted_at'>>
): Promise<void> {
  if (scores.length === 0) return
  const now = new Date().toISOString()

  for (const data of scores) {
    const existing = await db
      .select()
      .from(tables.scores)
      .where(
        and(
          eq(tables.scores.judge_email, data.judge_email.toLowerCase()),
          eq(tables.scores.participant_id, data.participant_id),
          eq(tables.scores.criteria_id, data.criteria_id)
        )
      )

    if (existing.length > 0) {
      await db
        .update(tables.scores)
        .set({ score: data.score, comments: data.comments, submitted_at: now, is_draft: sql`${data.is_draft ? 1 : 0}` })
        .where(eq(tables.scores.score_id, existing[0].score_id))
    } else {
      await db.insert(tables.scores).values({
        score_id:       generateScoreId(),
        judge_email:    data.judge_email.toLowerCase(),
        participant_id: data.participant_id,
        criteria_id:    data.criteria_id,
        score:          data.score,
        comments:       data.comments,
        submitted_at:   now,
        is_draft:       data.is_draft,
      })
    }
  }
}

export async function submitScores(judgeEmail: string, participantId: string): Promise<void> {
  const now = new Date().toISOString()
  await db
    .update(tables.scores)
    .set({ is_draft: sql`${0}`, submitted_at: now })
    .where(
      and(
        eq(tables.scores.judge_email, judgeEmail.toLowerCase()),
        eq(tables.scores.participant_id, participantId),
        eq(tables.scores.is_draft, sql`1`)
      )
    )
}

export async function getSubmissionStatusByParticipants(
  participantIds: string[]
): Promise<Map<string, Set<string>>> {
  if (participantIds.length === 0) return new Map()

  const rows = await db
    .select()
    .from(tables.scores)
    .where(
      and(
        inArray(tables.scores.participant_id, participantIds),
        eq(tables.scores.is_draft, sql`0`)
      )
    )

  const result = new Map<string, Set<string>>()
  for (const row of rows) {
    const pid = row.participant_id as string
    const email = (row.judge_email as string).toLowerCase()
    if (!result.has(pid)) result.set(pid, new Set())
    result.get(pid)!.add(email)
  }
  return result
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const [rows, criteria, participants] = await Promise.all([
    db.select().from(tables.scores).where(eq(tables.scores.is_draft, sql`0`)),
    getAllCriteria(),
    getAllParticipants(),
  ])

  const criteriaMap = new Map(criteria.map((c) => [c.criteria_id, c]))
  const participantMap = new Map(participants.map((p) => [p.participant_id, p]))

  const totals = new Map<string, { weightedSum: number; judges: Set<string> }>()

  for (const row of rows) {
    const criterion = criteriaMap.get(row.criteria_id as string)
    if (!criterion) continue

    const pid = row.participant_id as string
    if (!totals.has(pid)) totals.set(pid, { weightedSum: 0, judges: new Set() })
    const entry = totals.get(pid)!
    entry.weightedSum += Number(row.score) * criterion.weight
    entry.judges.add((row.judge_email as string).toLowerCase())
  }

  return Array.from(totals.entries())
    .map(([participant_id, { weightedSum, judges }]) => ({
      participant_id,
      name: participantMap.get(participant_id)?.name ?? participant_id,
      weighted_score: Math.round(weightedSum * 100) / 100,
      judge_count: judges.size,
    }))
    .sort((a, b) => b.weighted_score - a.weighted_score)
}

// Per-event leaderboard with optional z-score normalization.
// Normalization removes per-judge leniency/strictness bias:
//   for each judge, scores are converted to z = (score - judge_mean) / judge_std
//   then re-scaled to the event's max_score range for readability.
export async function getLeaderboardForEvent(
  eventId: string,
  normalize: boolean
): Promise<LeaderboardEntry[]> {
  const [participants, criteria] = await Promise.all([
    getParticipantsByEvent(eventId),
    getCriteriaByEvent(eventId),
  ])

  if (participants.length === 0 || criteria.length === 0) return []

  const participantIds = participants.map((p) => p.participant_id)
  const participantMap = new Map(participants.map((p) => [p.participant_id, p]))
  const criteriaMap = new Map(criteria.map((c) => [c.criteria_id, c]))

  const rows = await db
    .select()
    .from(tables.scores)
    .where(
      and(
        inArray(tables.scores.participant_id, participantIds),
        eq(tables.scores.is_draft, sql`0`)
      )
    )

  if (rows.length === 0) return []

  if (!normalize) {
    // Raw weighted totals — same logic as getLeaderboard() but scoped to event
    const totals = new Map<string, { weightedSum: number; judges: Set<string> }>()
    for (const row of rows) {
      const criterion = criteriaMap.get(row.criteria_id as string)
      if (!criterion) continue
      const pid = row.participant_id as string
      if (!totals.has(pid)) totals.set(pid, { weightedSum: 0, judges: new Set() })
      const entry = totals.get(pid)!
      entry.weightedSum += Number(row.score) * criterion.weight
      entry.judges.add((row.judge_email as string).toLowerCase())
    }
    return Array.from(totals.entries())
      .map(([participant_id, { weightedSum, judges }]) => ({
        participant_id,
        name: participantMap.get(participant_id)?.name ?? participant_id,
        weighted_score: Math.round(weightedSum * 100) / 100,
        judge_count: judges.size,
      }))
      .sort((a, b) => b.weighted_score - a.weighted_score)
  }

  // --- Z-score normalization ---
  // Step 1: group raw scores by judge, normalized to 0–1 per criterion max
  const byJudge = new Map<string, Array<{ score_id: string; normalizedScore: number; participant_id: string; criteria_id: string; weight: number }>>()
  for (const row of rows) {
    const criterion = criteriaMap.get(row.criteria_id as string)
    if (!criterion || criterion.max_score === 0) continue
    const email = (row.judge_email as string).toLowerCase()
    const list = byJudge.get(email) ?? []
    list.push({
      score_id:        row.score_id as string,
      normalizedScore: Number(row.score) / criterion.max_score,
      participant_id:  row.participant_id as string,
      criteria_id:     row.criteria_id as string,
      weight:          criterion.weight,
    })
    byJudge.set(email, list)
  }

  // Step 2: compute per-judge z-scores
  const zScores = new Map<string, number>() // score_id → z-score
  for (const [, judgeRows] of byJudge) {
    const values = judgeRows.map((r) => r.normalizedScore)
    const mean = values.reduce((a, b) => a + b, 0) / values.length
    const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length
    const std = Math.sqrt(variance)
    for (const r of judgeRows) {
      zScores.set(r.score_id, std > 0 ? (r.normalizedScore - mean) / std : 0)
    }
  }

  // Step 3: aggregate z-scores per participant (weighted by criterion weight)
  const totals = new Map<string, { zSum: number; weightSum: number; judges: Set<string> }>()
  for (const row of rows) {
    const criterion = criteriaMap.get(row.criteria_id as string)
    if (!criterion) continue
    const pid = row.participant_id as string
    const z = zScores.get(row.score_id as string) ?? 0
    if (!totals.has(pid)) totals.set(pid, { zSum: 0, weightSum: 0, judges: new Set() })
    const entry = totals.get(pid)!
    entry.zSum += z * criterion.weight
    entry.weightSum += criterion.weight
    entry.judges.add((row.judge_email as string).toLowerCase())
  }

  // Step 4: compute average weighted z-score per participant
  const entries = Array.from(totals.entries()).map(([participant_id, { zSum, weightSum, judges }]) => ({
    participant_id,
    name: participantMap.get(participant_id)?.name ?? participant_id,
    weighted_score: weightSum > 0 ? Math.round((zSum / weightSum) * 1000) / 1000 : 0,
    judge_count: judges.size,
  }))

  return entries.sort((a, b) => b.weighted_score - a.weighted_score)
}
