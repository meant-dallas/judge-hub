import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getAssignmentsForJudge } from '@/lib/sheets/assignments'
import { getAllParticipants } from '@/lib/sheets/participants'
import { getAllEvents } from '@/lib/sheets/events'
import { getScoresByJudge } from '@/lib/sheets/scores'

const STATUS_BADGE: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  active: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
  completed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
  archived: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
}

export default async function JudgeDashboard() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  const judgeEmail = session.user.email!

  const [assignments, allParticipants, allEvents, scores] = await Promise.all([
    getAssignmentsForJudge(judgeEmail),
    getAllParticipants(),
    getAllEvents(),
    getScoresByJudge(judgeEmail),
  ])

  // Build set of assigned participant IDs
  const assignedIds = new Set(assignments.map((a) => a.participant_id))
  const assignedParticipants = allParticipants.filter((p) => assignedIds.has(p.participant_id))

  // Group participants by event
  const participantsByEvent = new Map<string, typeof assignedParticipants>()
  for (const p of assignedParticipants) {
    const list = participantsByEvent.get(p.event_id) ?? []
    list.push(p)
    participantsByEvent.set(p.event_id, list)
  }

  // Get events that have assigned participants
  const assignedEventIds = new Set(assignedParticipants.map((p) => p.event_id))
  const assignedEvents = allEvents
    .filter((e) => assignedEventIds.has(e.event_id))
    .sort((a, b) => b.date.localeCompare(a.date))

  // Compute per-event progress: participants with at least one submitted score
  const submittedParticipantIds = new Set(
    scores.filter((s) => !s.is_draft).map((s) => s.participant_id)
  )
  const draftParticipantIds = new Set(
    scores.filter((s) => s.is_draft).map((s) => s.participant_id)
  )

  const totalAssigned = assignedParticipants.length
  const totalSubmitted = assignedParticipants.filter((p) => submittedParticipantIds.has(p.participant_id)).length

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">My Events</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {assignedEvents.length} event{assignedEvents.length !== 1 ? 's' : ''} assigned ·{' '}
          {totalSubmitted}/{totalAssigned} participants scored
        </p>
      </div>

      {assignedEvents.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/60 py-20 text-center">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-slate-300 dark:text-slate-600 mb-3">
            <rect x="3" y="4" width="18" height="18" rx="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <p className="text-slate-500 dark:text-slate-400 font-medium">No events assigned yet</p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">A coordinator will assign you to events</p>
        </div>
      ) : (
        <div className="space-y-4">
          {assignedEvents.map((event) => {
            const participants = participantsByEvent.get(event.event_id) ?? []
            const submitted = participants.filter((p) => submittedParticipantIds.has(p.participant_id)).length
            const inProgress = participants.filter(
              (p) => !submittedParticipantIds.has(p.participant_id) && draftParticipantIds.has(p.participant_id)
            ).length
            const notStarted = participants.length - submitted - inProgress
            const pct = participants.length > 0 ? Math.round((submitted / participants.length) * 100) : 0
            const allDone = submitted === participants.length && participants.length > 0

            return (
              <Link
                key={event.event_id}
                href={`/judge/events/${event.event_id}`}
                className="block bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/60 p-5 hover:border-indigo-200 dark:hover:border-indigo-700 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">{event.name}</h2>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{event.date}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {allDone && (
                      <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400">
                        Complete
                      </span>
                    )}
                    <span className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${STATUS_BADGE[event.status] ?? STATUS_BADGE.draft}`}>
                      {event.status}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
                    <span>{submitted}/{participants.length} participants scored</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${allDone ? 'bg-green-500' : 'bg-indigo-500'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* Status breakdown */}
                <div className="flex items-center gap-4 text-xs">
                  {submitted > 0 && (
                    <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"/>
                      {submitted} submitted
                    </span>
                  )}
                  {inProgress > 0 && (
                    <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block"/>
                      {inProgress} in progress
                    </span>
                  )}
                  {notStarted > 0 && (
                    <span className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 inline-block"/>
                      {notStarted} not started
                    </span>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
