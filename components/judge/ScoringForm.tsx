'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { saveScoreDraftsAction, submitScoresAction } from '@/app/judge/actions'
import type { Criterion, Score } from '@/types/sheets'

interface ScoreValue {
  score: string
  comments: string
}

export default function ScoringForm({
  criteria,
  existingScores,
  participantId,
  participantName,
  eventId,
  isSubmitted,
  isLiveSession,
}: {
  criteria: Criterion[]
  existingScores: Score[]
  participantId: string
  participantName: string
  eventId: string
  isSubmitted: boolean
  isLiveSession?: boolean
}) {
  const router = useRouter()
  const [isPendingDraft, startDraftTransition] = useTransition()
  const [isPendingSubmit, startSubmitTransition] = useTransition()
  const [savedAt, setSavedAt] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showWaiting, setShowWaiting] = useState(false)

  // Initialize state from existing scores
  const [values, setValues] = useState<Record<string, ScoreValue>>(() => {
    const init: Record<string, ScoreValue> = {}
    for (const c of criteria) {
      const existing = existingScores.find((s) => s.criteria_id === c.criteria_id)
      init[c.criteria_id] = {
        score: existing ? String(existing.score) : '',
        comments: existing?.comments ?? '',
      }
    }
    return init
  })

  function update(criteriaId: string, field: 'score' | 'comments', val: string) {
    setValues((prev) => ({ ...prev, [criteriaId]: { ...prev[criteriaId], [field]: val } }))
  }

  function buildPayload() {
    return criteria.map((c) => ({
      criteriaId: c.criteria_id,
      score: parseFloat(values[c.criteria_id]?.score ?? '0') || 0,
      comments: values[c.criteria_id]?.comments ?? '',
    }))
  }

  function validate(): string | null {
    for (const c of criteria) {
      const val = values[c.criteria_id]?.score
      if (val === '' || val === undefined) return `Score required for "${c.name}"`
      const n = parseFloat(val)
      if (isNaN(n) || n < 0 || n > c.max_score) {
        return `"${c.name}" score must be between 0 and ${c.max_score}`
      }
    }
    return null
  }

  function handleSaveDraft() {
    const err = validate()
    if (err) { setError(err); return }
    setError(null)
    startDraftTransition(async () => {
      const result = await saveScoreDraftsAction(participantId, eventId, buildPayload())
      if (result.error) {
        setError(result.error)
      } else {
        setSavedAt(new Date().toLocaleTimeString())
      }
    })
  }

  function handleSubmit() {
    const err = validate()
    if (err) { setError(err); return }
    setError(null)
    startSubmitTransition(async () => {
      const result = await submitScoresAction(participantId, eventId, buildPayload())
      if (result.error) {
        setError(result.error)
      } else if (isLiveSession) {
        setShowWaiting(true)
      } else {
        router.push(`/judge/events/${eventId}`)
      }
    })
  }

  const isPending = isPendingDraft || isPendingSubmit

  if (showWaiting) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/60 p-8 text-center">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 mx-auto mb-4">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-green-600 dark:text-green-400">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1">Scores submitted</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
          Waiting for the coordinator to advance to the next participant…
        </p>
        <a
          href={`/judge/events/${eventId}`}
          className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          ← Back to event overview
        </a>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {isSubmitted && (
        <div className="flex items-center gap-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-xl px-4 py-3">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-green-600 dark:text-green-400 shrink-0">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <p className="text-sm font-medium text-green-700 dark:text-green-400">
            Scores submitted — this evaluation is final and cannot be edited.
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl px-4 py-3">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Criteria cards */}
      {criteria.map((c, i) => {
        const val = values[c.criteria_id] ?? { score: '', comments: '' }
        const scoreNum = parseFloat(val.score)
        const isValid = !isNaN(scoreNum) && scoreNum >= 0 && scoreNum <= c.max_score
        const pct = isValid ? (scoreNum / c.max_score) * 100 : 0

        return (
          <div key={c.criteria_id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/60 p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-400 dark:text-slate-500">{i + 1}</span>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{c.name}</h3>
                  {c.weight !== 1 && (
                    <span className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-1.5 py-0.5 rounded">
                      {c.weight}× weight
                    </span>
                  )}
                </div>
                {c.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 ml-4">{c.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-4">
                <input
                  type="number"
                  min={0}
                  max={c.max_score}
                  step="0.5"
                  value={val.score}
                  disabled={isSubmitted || isPending}
                  onChange={(e) => update(c.criteria_id, 'score', e.target.value)}
                  placeholder="—"
                  className="w-16 text-center text-sm font-semibold border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
                />
                <span className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">/ {c.max_score}</span>
              </div>
            </div>

            {/* Score bar */}
            {val.score !== '' && (
              <div className="mb-3 ml-4">
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${isValid ? 'bg-indigo-400' : 'bg-red-400'}`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Comments */}
            <textarea
              value={val.comments}
              disabled={isSubmitted || isPending}
              onChange={(e) => update(c.criteria_id, 'comments', e.target.value)}
              placeholder="Comments (optional)"
              rows={2}
              className="w-full text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed resize-none"
            />
          </div>
        )
      })}

      {/* Actions */}
      {!isSubmitted && (
        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-slate-400 dark:text-slate-500">
            {savedAt && !isPendingDraft && `Draft saved at ${savedAt}`}
            {isPendingDraft && 'Saving…'}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveDraft}
              disabled={isPending}
              className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors"
            >
              {isPendingDraft ? 'Saving…' : 'Save Draft'}
            </button>
            <button
              onClick={handleSubmit}
              disabled={isPending}
              className="text-sm bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium px-5 py-2 rounded-lg transition-colors"
            >
              {isPendingSubmit ? 'Submitting…' : 'Submit Final'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
