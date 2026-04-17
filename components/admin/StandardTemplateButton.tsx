'use client'

import { useTransition } from 'react'
import { applyStandardCriteriaTemplateAction } from '@/app/admin/actions'

export default function StandardTemplateButton({ eventId }: { eventId: string }) {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await applyStandardCriteriaTemplateAction(eventId)
        })
      }
      className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 border border-indigo-200 dark:border-indigo-700/60 hover:border-indigo-300 dark:hover:border-indigo-600 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
      </svg>
      {isPending ? 'Applying…' : 'Use Standard Template'}
    </button>
  )
}
