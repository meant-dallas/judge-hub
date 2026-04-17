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
    if (field === 'score') {
      const criterion = criteria.find((c) => c.criteria_id === criteriaId)
      if (criterion && val !== '') {
        const num = parseFloat(val)
        if (!isNaN(num) && num > criterion.max_score) {
          val = String(criterion.max_score)
        }
      }
    }
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

  // Running total
  const runningTotal = criteria.reduce((sum, c) => {
    const n = parseFloat(values[c.criteria_id]?.score ?? '')
    return sum + (isNaN(n) || n < 0 ? 0 : Math.min(n, c.max_score))
  }, 0)
  const maxTotal = criteria.reduce((sum, c) => sum + c.max_score, 0)

  // Any score over cap (safety net — clamping should prevent this)
  const hasAnyOverCap = criteria.some((c) => {
    const n = parseFloat(values[c.criteria_id]?.score ?? '')
    return !isNaN(n) && n > c.max_score
  })

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
        const hasValue = val.score !== '' && !isNaN(scoreNum)
        const isOverCap = hasValue && scoreNum > c.max_score
        const isAtMax = hasValue && scoreNum === c.max_score
        const isNearMax = hasValue && !isAtMax && scoreNum >= c.max_score - 2
        const isValid = hasValue && scoreNum >= 0 && scoreNum <= c.max_score
        const pct = hasValue ? Math.min((scoreNum / c.max_score) * 100, 100) : 0

        // Remaining indicator colour
        const remainingColor = isOverCap
          ? 'text-red-600 dark:text-red-400'
          : isAtMax
          ? 'text-green-600 dark:text-green-400'
          : isNearMax
          ? 'text-amber-600 dark:text-amber-400'
          : 'text-slate-400 dark:text-slate-500'

        const remaining = c.max_score - (hasValue && !isNaN(scoreNum) ? scoreNum : 0)

        return (
          <div
            key={c.criteria_id}
            className={`bg-white dark:bg-slate-900 rounded-xl border p-5 transition-colors ${
              isOverCap
                ? 'border-red-300 dark:border-red-700'
                : 'border-slate-200 dark:border-slate-700/60'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
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

              {/* Score input */}
              <div className="flex items-center gap-1.5 shrink-0 ml-4">
                <input
                  type="number"
                  min={0}
                  max={c.max_score}
                  step="0.5"
                  value={val.score}
                  disabled={isSubmitted || isPending}
                  onChange={(e) => update(c.criteria_id, 'score', e.target.value)}
                  placeholder="—"
                  className={`w-16 text-center text-sm font-semibold border rounded-lg px-2 py-1.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors ${
                    isOverCap
                      ? 'border-red-400 dark:border-red-600 focus:ring-red-300 dark:focus:ring-red-700'
                      : isAtMax
                      ? 'border-green-400 dark:border-green-600 focus:ring-green-300 dark:focus:ring-green-700'
                      : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-300 dark:focus:ring-indigo-700'
                  }`}
                />
                <span className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">
                  / {c.max_score} pts
                </span>
              </div>
            </div>

            {/* Score bar + remaining indicator */}
            {hasValue && (
              <div className="mb-3 ml-4">
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mb-1">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isOverCap ? 'bg-red-400' : isAtMax ? 'bg-green-500' : isNearMax ? 'bg-amber-400' : 'bg-indigo-400'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  {isOverCap ? (
                    <span className="text-[11px] font-medium text-red-600 dark:text-red-400">
                      Exceeds maximum — capped at {c.max_score}
                    </span>
                  ) : isAtMax ? (
                    <span className={`text-[11px] font-medium ${remainingColor}`}>
                      ✓ At maximum
                    </span>
                  ) : hasValue ? (
                    <span className={`text-[11px] ${remainingColor}`}>
                      {remaining % 1 === 0 ? remaining : remaining.toFixed(1)} pts remaining
                    </span>
                  ) : null}
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

      {/* Running total */}
      {!isSubmitted && criteria.length > 0 && (
        <div className="flex items-center justify-end">
          <span className={`text-sm font-semibold tabular-nums ${
            runningTotal === maxTotal
              ? 'text-green-600 dark:text-green-400'
              : 'text-slate-700 dark:text-slate-300'
          }`}>
            Total: {runningTotal % 1 === 0 ? runningTotal : runningTotal.toFixed(1)} / {maxTotal}
          </span>
        </div>
      )}

      {/* Actions */}
      {!isSubmitted && (
        <div className="flex items-center justify-between pt-1">
          <div className="text-xs text-slate-400 dark:text-slate-500">
            {savedAt && !isPendingDraft && `Draft saved at ${savedAt}`}
            {isPendingDraft && 'Saving…'}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveDraft}
              disabled={isPending || hasAnyOverCap}
              className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors"
            >
              {isPendingDraft ? 'Saving…' : 'Save Draft'}
            </button>
            <button
              onClick={handleSubmit}
              disabled={isPending || hasAnyOverCap}
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
