'use client'

import { useState, useTransition } from 'react'
import { assignJudgeAction } from '@/app/coordinator/actions'
import type { SheetUser } from '@/types/sheets'

export default function AssignJudgeForm({
  participantId,
  eventId,
  availableJudges,
}: {
  participantId: string
  eventId: string
  availableJudges: SheetUser[]
}) {
  const [selected, setSelected] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  if (availableJudges.length === 0) {
    return <p className="text-xs text-slate-400 dark:text-slate-500 italic">All judges assigned</p>
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const result = await assignJudgeAction(participantId, selected, eventId)
      if (result.error) {
        setError(result.error)
      } else {
        setSelected('')
        setError(null)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-2">
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        disabled={isPending}
        className="flex-1 text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-700"
      >
        <option value="">Select judge…</option>
        {availableJudges.map((j) => (
          <option key={j.email} value={j.email}>
            {j.name || j.email}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={isPending || !selected}
        className="text-xs bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
      >
        {isPending ? 'Assigning…' : 'Assign'}
      </button>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </form>
  )
}
