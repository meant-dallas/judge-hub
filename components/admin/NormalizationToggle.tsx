'use client'

import { useTransition } from 'react'
import { updateEventNormalizationAction } from '@/app/admin/actions'

export default function NormalizationToggle({
  eventId,
  normalize,
  readOnly,
}: {
  eventId: string
  normalize: boolean
  readOnly?: boolean
}) {
  const [isPending, startTransition] = useTransition()

  function toggle() {
    startTransition(async () => {
      await updateEventNormalizationAction(eventId, !normalize)
    })
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/60 px-5 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Score Normalization</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Apply per-judge z-score normalization on the leaderboard to remove leniency/strictness bias.
          </p>
        </div>
        <button
          onClick={toggle}
          disabled={readOnly || isPending}
          role="switch"
          aria-checked={normalize}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
            normalize ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform ${
              normalize ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
      {normalize && (
        <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-2">
          Enabled — leaderboard scores are shown as relative (z-score) values, not raw points.
        </p>
      )}
    </div>
  )
}
