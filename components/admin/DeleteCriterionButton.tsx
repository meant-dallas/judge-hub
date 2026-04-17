'use client'

import { useTransition } from 'react'
import { deleteCriterionAction } from '@/app/admin/actions'

export default function DeleteCriterionButton({
  criteriaId,
  eventId,
}: {
  criteriaId: string
  eventId: string
}) {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      disabled={isPending}
      onClick={() => startTransition(async () => { await deleteCriterionAction(criteriaId, eventId) })}
      className="text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 disabled:opacity-40 transition-colors"
      aria-label="Delete criterion"
    >
      {isPending ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="animate-spin">
          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6l-1 14H6L5 6"/>
          <path d="M10 11v6M14 11v6"/>
          <path d="M9 6V4h6v2"/>
        </svg>
      )}
    </button>
  )
}
