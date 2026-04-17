import type { Score, LeaderboardEntry } from '@/types/sheets'
import { SHEET_NAMES } from './client'
import { readSheet, appendRow, findRowByColumn, batchUpdateRows } from './helpers'
import { rowToScore } from '@/types/sheets'
import { getAllCriteria } from './criteria'
import { getAllProjects } from './projects'

const COL = {
  SCORE_ID: 0,
  JUDGE_EMAIL: 1,
  PROJECT_ID: 2,
  CRITERIA_ID: 3,
  SCORE: 4,
  COMMENTS: 5,
  SUBMITTED_AT: 6,
  IS_DRAFT: 7,
}

function generateScoreId(): string {
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `SCORE-${Date.now()}-${rand}`
}

export async function getScoresForProject(projectId: string): Promise<Score[]> {
  const rows = await readSheet(SHEET_NAMES.SCORES)
  return rows.filter((r) => r[COL.PROJECT_ID] === projectId).map(rowToScore)
}

export async function getScoresByJudge(judgeEmail: string): Promise<Score[]> {
  const rows = await readSheet(SHEET_NAMES.SCORES)
  return rows
    .filter((r) => r[COL.JUDGE_EMAIL]?.toLowerCase() === judgeEmail.toLowerCase())
    .map(rowToScore)
}

export async function upsertScore(
  data: Omit<Score, 'score_id' | 'submitted_at'>
): Promise<void> {
  const rows = await readSheet(SHEET_NAMES.SCORES)
  const existingIndex = rows.findIndex(
    (r) =>
      r[COL.JUDGE_EMAIL]?.toLowerCase() === data.judge_email.toLowerCase() &&
      r[COL.PROJECT_ID] === data.project_id &&
      r[COL.CRITERIA_ID] === data.criteria_id
  )

  const now = new Date().toISOString()

  if (existingIndex !== -1) {
    const updated = [...rows[existingIndex]]
    updated[COL.SCORE] = String(data.score)
    updated[COL.COMMENTS] = data.comments
    updated[COL.SUBMITTED_AT] = now
    updated[COL.IS_DRAFT] = data.is_draft ? 'TRUE' : 'FALSE'
    await batchUpdateRows(SHEET_NAMES.SCORES, [{ rowIndex: existingIndex, values: updated }])
  } else {
    await appendRow(SHEET_NAMES.SCORES, [
      generateScoreId(),
      data.judge_email.toLowerCase(),
      data.project_id,
      data.criteria_id,
      String(data.score),
      data.comments,
      now,
      data.is_draft ? 'TRUE' : 'FALSE',
    ])
  }
}

export async function upsertScores(
  scores: Array<Omit<Score, 'score_id' | 'submitted_at'>>
): Promise<void> {
  if (scores.length === 0) return
  const rows = await readSheet(SHEET_NAMES.SCORES)
  const now = new Date().toISOString()
  const updates: Array<{ rowIndex: number; values: string[] }> = []
  const appends: string[][] = []

  for (const data of scores) {
    const existingIndex = rows.findIndex(
      (r) =>
        r[COL.JUDGE_EMAIL]?.toLowerCase() === data.judge_email.toLowerCase() &&
        r[COL.PROJECT_ID] === data.project_id &&
        r[COL.CRITERIA_ID] === data.criteria_id
    )

    if (existingIndex !== -1) {
      const updated = [...rows[existingIndex]]
      updated[COL.SCORE] = String(data.score)
      updated[COL.COMMENTS] = data.comments
      updated[COL.SUBMITTED_AT] = now
      updated[COL.IS_DRAFT] = data.is_draft ? 'TRUE' : 'FALSE'
      updates.push({ rowIndex: existingIndex, values: updated })
    } else {
      appends.push([
        generateScoreId(),
        data.judge_email.toLowerCase(),
        data.project_id,
        data.criteria_id,
        String(data.score),
        data.comments,
        now,
        data.is_draft ? 'TRUE' : 'FALSE',
      ])
    }
  }

  if (updates.length > 0) await batchUpdateRows(SHEET_NAMES.SCORES, updates)
  for (const row of appends) await appendRow(SHEET_NAMES.SCORES, row)
}

export async function submitScores(judgeEmail: string, projectId: string): Promise<void> {
  const rows = await readSheet(SHEET_NAMES.SCORES)
  const updates: Array<{ rowIndex: number; values: string[] }> = []

  rows.forEach((row, i) => {
    if (
      row[COL.JUDGE_EMAIL]?.toLowerCase() === judgeEmail.toLowerCase() &&
      row[COL.PROJECT_ID] === projectId &&
      row[COL.IS_DRAFT] === 'TRUE'
    ) {
      const updated = [...row]
      updated[COL.IS_DRAFT] = 'FALSE'
      updated[COL.SUBMITTED_AT] = new Date().toISOString()
      updates.push({ rowIndex: i, values: updated })
    }
  })

  if (updates.length > 0) await batchUpdateRows(SHEET_NAMES.SCORES, updates)
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const [rows, criteria, projects] = await Promise.all([
    readSheet(SHEET_NAMES.SCORES),
    getAllCriteria(),
    getAllProjects(),
  ])

  const criteriaMap = new Map(criteria.map((c) => [c.criteria_id, c]))
  const projectMap = new Map(projects.map((p) => [p.project_id, p]))

  const totals = new Map<string, { weightedSum: number; judges: Set<string> }>()

  for (const row of rows) {
    const score = rowToScore(row)
    if (score.is_draft) continue

    const criterion = criteriaMap.get(score.criteria_id)
    if (!criterion) continue

    if (!totals.has(score.project_id)) {
      totals.set(score.project_id, { weightedSum: 0, judges: new Set() })
    }
    const entry = totals.get(score.project_id)!
    entry.weightedSum += score.score * criterion.weight
    entry.judges.add(score.judge_email)
  }

  return Array.from(totals.entries())
    .map(([project_id, { weightedSum, judges }]) => ({
      project_id,
      title: projectMap.get(project_id)?.title ?? project_id,
      weighted_score: Math.round(weightedSum * 100) / 100,
      judge_count: judges.size,
    }))
    .sort((a, b) => b.weighted_score - a.weighted_score)
}
