'use client'

import { useTransition } from 'react'
import { updateEventStatusAction } from '@/app/admin/actions'
import type { Event } from '@/types/sheets'

const OPTIONS: Event['status'][] = ['draft', 'active', 'completed', 'archived']

const BADGE: Record<Event['status'], string> = {
  draft: 'bg-slate-100 text-slate-600',
  active: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  archived: 'bg-amber-100 text-amber-700',
}

export default function EventStatusSelect({
  eventId,
  status,
}: {
  eventId: string
  status: Event['status']
}) {
  const [isPending, startTransition] = useTransition()

  return (
    <select
      value={status}
      disabled={isPending}
      onChange={(e) => {
        const next = e.target.value as Event['status']
        startTransition(() => updateEventStatusAction(eventId, next))
      }}
      className={`text-xs font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full border-0 cursor-pointer appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-300 ${BADGE[status]} disabled:opacity-60`}
    >
      {OPTIONS.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  )
}
