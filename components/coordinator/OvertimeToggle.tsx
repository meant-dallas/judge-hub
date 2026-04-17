'use client'

import { useTransition } from 'react'
import { setParticipantOvertimeAction } from '@/app/admin/actions'

export default function OvertimeToggle({
  participantId,
  eventId,
  isOvertime,
  overtimeDeduction,
}: {
  participantId: string
  eventId: string
  isOvertime: boolean
  overtimeDeduction: number
}) {
  const [isPending, startTransition] = useTransition()

  function toggle() {
    startTransition(async () => {
      await setParticipantOvertimeAction(participantId, !isOvertime, eventId)
    })
  }

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      title={isOvertime ? 'Mark as on time' : 'Mark as overtime'}
      className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border transition-colors disabled:opacity-50 ${
        isOvertime
          ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30'
          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
      }`}
    >
      {isOvertime ? (
        <>
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
          Overtime{overtimeDeduction > 0 ? ` −${overtimeDeduction} pts` : ''}
        </>
      ) : (
        <>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-500 shrink-0" />
          On time
        </>
      )}
    </button>
  )
}
