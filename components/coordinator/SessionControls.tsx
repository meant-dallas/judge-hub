'use client'

import { useTransition } from 'react'
import { setActiveParticipantAction, endSessionAction } from '@/app/admin/actions'

export default function SessionControls({
  eventId,
  isLive,
  activeParticipantName,
  firstParticipantId,
}: {
  eventId: string
  isLive: boolean
  activeParticipantName: string
  firstParticipantId: string | null
}) {
  const [isPending, startTransition] = useTransition()

  if (isLive) {
    return (
      <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-xl px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"/>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"/>
          </span>
          <div>
            <p className="text-sm font-semibold text-green-800 dark:text-green-300">Live Session</p>
            <p className="text-xs text-green-700 dark:text-green-400">
              Now presenting: <span className="font-medium">{activeParticipantName || 'Unknown'}</span>
            </p>
          </div>
        </div>
        <button
          disabled={isPending}
          onClick={() => startTransition(async () => { await endSessionAction(eventId) })}
          className="text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 border border-red-200 dark:border-red-800/50 hover:border-red-300 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
        >
          {isPending ? 'Ending…' : 'End Session'}
        </button>
      </div>
    )
  }

  if (!firstParticipantId) return null

  return (
    <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 rounded-xl px-4 py-3">
      <p className="text-sm text-slate-600 dark:text-slate-400">
        Ready to start the live judging session.
      </p>
      <button
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            await setActiveParticipantAction(eventId, firstParticipantId)
          })
        }
        className="text-sm font-medium bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-1.5 rounded-lg transition-colors"
      >
        {isPending ? 'Starting…' : 'Start Session'}
      </button>
    </div>
  )
}
