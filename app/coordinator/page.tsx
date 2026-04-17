import Link from 'next/link'
import { getAllEvents } from '@/lib/db/events'
import { getAllParticipants } from '@/lib/db/participants'
import { getAllAssignments } from '@/lib/db/assignments'

const STATUS_BADGE: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  active: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
  completed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
  archived: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
}

export default async function CoordinatorDashboard() {
  const [events, participants, assignments] = await Promise.all([
    getAllEvents(),
    getAllParticipants(),
    getAllAssignments(),
  ])

  const activeEvents = events.filter((e) => e.status === 'active')
  const activeParticipantIds = new Set(
    participants.filter((p) => activeEvents.some((e) => e.event_id === p.event_id)).map((p) => p.participant_id)
  )
  const pendingAssignments = assignments.filter((a) => activeParticipantIds.has(a.participant_id)).length

  const recentEvents = [...events]
    .filter((e) => e.status !== 'archived')
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5)

  const stats = [
    { label: 'Active Events', value: activeEvents.length, sub: `${events.length} total`, href: '/coordinator/events' },
    { label: 'Participants', value: participants.filter((p) => activeParticipantIds.has(p.participant_id)).length, sub: 'in active events', href: '/coordinator/events' },
    { label: 'Assignments', value: pendingAssignments, sub: 'across active events', href: '/coordinator/events' },
  ]

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Dashboard</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage participants and judge assignments</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/60 p-5 hover:border-indigo-200 dark:hover:border-indigo-700 hover:shadow-sm transition-all"
          >
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{s.value}</p>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mt-1">{s.label}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{s.sub}</p>
          </Link>
        ))}
      </div>

      {/* Recent Events */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/60">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700/60">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Events</h2>
          <Link href="/coordinator/events" className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium">
            View all →
          </Link>
        </div>
        {recentEvents.length === 0 ? (
          <p className="px-5 py-8 text-sm text-slate-400 dark:text-slate-500 text-center">No events yet</p>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-700/60">
            {recentEvents.map((event) => {
              const count = participants.filter((p) => p.event_id === event.event_id).length
              const assigned = assignments.filter((a) =>
                participants.some((p) => p.event_id === event.event_id && p.participant_id === a.participant_id)
              ).length
              return (
                <li key={event.event_id}>
                  <Link
                    href={`/coordinator/events/${event.event_id}`}
                    className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{event.name}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                        {event.date} · {count} participant{count !== 1 ? 's' : ''} · {assigned} assignment{assigned !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <span className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${STATUS_BADGE[event.status] ?? STATUS_BADGE.draft}`}>
                      {event.status}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
