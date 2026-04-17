import { auth } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { getEventById } from '@/lib/sheets/events'
import { getAssignmentsForJudge } from '@/lib/sheets/assignments'
import { getAllParticipants } from '@/lib/sheets/participants'
import { getScoresByJudge } from '@/lib/sheets/scores'
import { getCriteriaByEvent } from '@/lib/sheets/criteria'

export default async function JudgeEventPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth()
  if (!session?.user) redirect('/login')
  const judgeEmail = session.user.email!

  const [event, assignments, allParticipants, scores, criteria] = await Promise.all([
    getEventById(id),
    getAssignmentsForJudge(judgeEmail),
    getAllParticipants(),
    getScoresByJudge(judgeEmail),
    getCriteriaByEvent(id),
  ])

  if (!event) notFound()

  // Participants in this event assigned to this judge
  const assignedIds = new Set(assignments.map((a) => a.participant_id))
  const participants = allParticipants.filter(
    (p) => p.event_id === id && assignedIds.has(p.participant_id)
  )

  if (participants.length === 0) {
    return (
      <div className="p-8 max-w-4xl">
        <Link href="/judge" className="text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 mb-4 inline-block">
          ← My Events
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">{event.name}</h1>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/60 py-16 text-center mt-6">
          <p className="text-slate-400 dark:text-slate-500 text-sm">No participants assigned to you in this event.</p>
        </div>
      </div>
    )
  }

  // Determine scoring status per participant
  const submittedIds = new Set(scores.filter((s) => !s.is_draft).map((s) => s.participant_id))
  const draftIds = new Set(scores.filter((s) => s.is_draft).map((s) => s.participant_id))

  function getStatus(participantId: string): 'submitted' | 'draft' | 'not_started' {
    if (submittedIds.has(participantId)) return 'submitted'
    if (draftIds.has(participantId)) return 'draft'
    return 'not_started'
  }

  const submitted = participants.filter((p) => submittedIds.has(p.participant_id)).length
  const pct = Math.round((submitted / participants.length) * 100)
  const allDone = submitted === participants.length

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <Link href="/judge" className="text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 mb-3 inline-block">
        ← My Events
      </Link>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{event.name}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {event.date}{event.description ? ` · ${event.description}` : ''}
          </p>
        </div>
        {allDone && (
          <span className="text-xs font-semibold uppercase tracking-wide px-3 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400">
            All submitted
          </span>
        )}
      </div>

      {/* Progress */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/60 p-4 mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-slate-600 dark:text-slate-400 font-medium">Scoring progress</span>
          <span className="text-slate-500 dark:text-slate-400">{submitted}/{participants.length} submitted</span>
        </div>
        <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${allDone ? 'bg-green-500' : 'bg-indigo-500'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        {criteria.length > 0 && (
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
            {criteria.length} criteria · {criteria.reduce((s, c) => s + c.max_score * c.weight, 0).toFixed(0)} max weighted score
          </p>
        )}
      </div>

      {/* Participants list */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/60 overflow-hidden">
        <ul className="divide-y divide-slate-100 dark:divide-slate-700/60">
          {participants.map((p) => {
            const status = getStatus(p.participant_id)
            return (
              <li key={p.participant_id}>
                <Link
                  href={`/judge/events/${id}/${p.participant_id}`}
                  className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{p.name}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                      {[p.team_name, p.category].filter(Boolean).join(' · ') || 'No details'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {status === 'submitted' && (
                      <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400">
                        Submitted
                      </span>
                    )}
                    {status === 'draft' && (
                      <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                        Draft saved
                      </span>
                    )}
                    {status === 'not_started' && (
                      <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                        Not started
                      </span>
                    )}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-slate-400">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
