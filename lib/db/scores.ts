import { eq, and, inArray } from 'drizzle-orm'
import { db, tables } from './index'
import type { Score, LeaderboardEntry } from '@/types/sheets'
import { getAllCriteria } from './criteria'
import { getAllParticipants } from './participants'

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
        .set({ score: data.score, comments: data.comments, submitted_at: now, is_draft: data.is_draft })
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
    .set({ is_draft: false, submitted_at: now })
    .where(
      and(
        eq(tables.scores.judge_email, judgeEmail.toLowerCase()),
        eq(tables.scores.participant_id, participantId),
        eq(tables.scores.is_draft, true)
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
        eq(tables.scores.is_draft, false)
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
    db.select().from(tables.scores).where(eq(tables.scores.is_draft, false)),
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
