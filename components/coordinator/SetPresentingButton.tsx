'use client'

import { useTransition } from 'react'
import { setActiveParticipantAction } from '@/app/admin/actions'

export default function SetPresentingButton({
  participantId,
  eventId,
  isActive,
}: {
  participantId: string
  eventId: string
  isActive: boolean
}) {
  const [isPending, startTransition] = useTransition()

  if (isActive) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-green-700 dark:text-green-400">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"/>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"/>
        </span>
        Presenting
      </span>
    )
  }

  return (
    <button
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await setActiveParticipantAction(eventId, participantId)
        })
      }
      className="text-xs text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 px-2.5 py-1 rounded-lg transition-colors disabled:opacity-40 whitespace-nowrap"
    >
      {isPending ? 'Setting…' : 'Set Presenting'}
    </button>
  )
}
