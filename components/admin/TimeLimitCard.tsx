'use client'

import { useState, useTransition } from 'react'
import { updateEventTimeLimitAction } from '@/app/admin/actions'

export default function TimeLimitCard({
  eventId,
  timeLimitMinutes,
  overtimeDeduction,
  readOnly,
}: {
  eventId: string
  timeLimitMinutes: number
  overtimeDeduction: number
  readOnly?: boolean
}) {
  const [isPending, startTransition] = useTransition()
  const [timeLimit, setTimeLimit] = useState(timeLimitMinutes === 0 ? '' : String(timeLimitMinutes))
  const [deduction, setDeduction] = useState(overtimeDeduction === 0 ? '' : String(overtimeDeduction))
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const timeLimitNum = parseInt(timeLimit, 10) || 0
  const hasTimeLimit = timeLimitNum > 0

  function handleSave() {
    setError(null)
    setSaved(false)
    const deductionNum = parseInt(deduction, 10) || 0
    startTransition(async () => {
      const result = await updateEventTimeLimitAction(eventId, timeLimitNum, hasTimeLimit ? deductionNum : 0)
      if (result.error) {
        setError(result.error)
      } else {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    })
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/60 px-5 py-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Time Limit</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure a per-participant time limit and overtime deduction.
          </p>
        </div>
        {saved && (
          <span className="text-xs text-green-600 dark:text-green-400 font-medium">Saved</span>
        )}
        {error && (
          <span className="text-xs text-red-600 dark:text-red-400">{error}</span>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Time limit input */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
            Time limit
          </label>
          <input
            type="number"
            min={0}
            step={1}
            value={timeLimit}
            disabled={readOnly || isPending}
            onChange={(e) => { setTimeLimit(e.target.value); setSaved(false) }}
            placeholder="No limit"
            className="w-20 text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <span className="text-xs text-slate-400 dark:text-slate-500">min</span>
        </div>

        {/* Deduction input — only show when time limit is set */}
        {hasTimeLimit ? (
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
              Overtime deduction
            </label>
            <input
              type="number"
              min={0}
              step={1}
              value={deduction}
              disabled={readOnly || isPending}
              onChange={(e) => { setDeduction(e.target.value); setSaved(false) }}
              placeholder="0"
              className="w-16 text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <span className="text-xs text-slate-400 dark:text-slate-500">pts</span>
          </div>
        ) : (
          <span className="text-xs text-slate-400 dark:text-slate-500 italic">No time limit set</span>
        )}

        {!readOnly && (
          <button
            onClick={handleSave}
            disabled={isPending}
            className="ml-auto text-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 px-4 py-1.5 rounded-lg transition-colors"
          >
            {isPending ? 'Saving…' : 'Save'}
          </button>
        )}
      </div>
    </div>
  )
}
