import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getEventById } from '@/lib/sheets/events'
import { getParticipantsByEvent } from '@/lib/sheets/participants'
import { getAllAssignments } from '@/lib/sheets/assignments'
import { getSubmissionStatusByParticipants } from '@/lib/sheets/scores'
import { getAllSheetUsers } from '@/lib/sheets/users'
import AddParticipantForm from '@/components/admin/AddParticipantForm'
import ParticipantProgressRow from '@/components/coordinator/ParticipantProgressRow'

const STATUS_BADGE: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  active: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
  completed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
  archived: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
}

export default async function CoordinatorEventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [event, participants, allAssignments, allUsers] = await Promise.all([
    getEventById(id),
    getParticipantsByEvent(id),
    getAllAssignments(),
    getAllSheetUsers(),
  ])

  if (!event) notFound()

  const judges = allUsers.filter((u) => u.role === 'judge' && u.status === 'active')
  const participantIds = participants.map((p) => p.participant_id)
  const submissionStatus = await getSubmissionStatusByParticipants(participantIds)

  // Pre-compute per-participant assignments
  const assignmentsByParticipant = new Map<string, typeof allAssignments>()
  for (const a of allAssignments) {
    if (participantIds.includes(a.participant_id)) {
      const list = assignmentsByParticipant.get(a.participant_id) ?? []
      list.push(a)
      assignmentsByParticipant.set(a.participant_id, list)
    }
  }

  const totalAssigned = Array.from(assignmentsByParticipant.values()).reduce((s, a) => s + a.length, 0)
  const totalSubmitted = participants.reduce(
    (s, p) => s + (submissionStatus.get(p.participant_id)?.size ?? 0),
    0
  )

  return (
    <div className="p-8 max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link href="/coordinator/events" className="text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 mb-1 inline-block">
            ← Events
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{event.name}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {event.date}{event.description ? ` · ${event.description}` : ''}
          </p>
        </div>
        <span className={`text-[10px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full ${STATUS_BADGE[event.status] ?? STATUS_BADGE.draft}`}>
          {event.status}
        </span>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Participants', value: participants.length },
          { label: 'Assignments', value: totalAssigned },
          { label: 'Scores Submitted', value: totalSubmitted },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/60 px-4 py-3">
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{s.value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Participants + assignment management */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Participants
            <span className="ml-2 text-xs font-normal text-slate-400 dark:text-slate-500">{participants.length}</span>
          </h2>
          <AddParticipantForm eventId={event.event_id} />
        </div>

        {participants.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/60 py-12 text-center">
            <p className="text-slate-400 dark:text-slate-500 text-sm">No participants yet. Add the first one above.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/60 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700/60">
                  <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide px-5 py-3">Name</th>
                  <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide px-4 py-3">Team</th>
                  <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide px-4 py-3">Category</th>
                  <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide px-4 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide px-4 py-3">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {participants.map((participant) => (
                  <ParticipantProgressRow
                    key={participant.participant_id}
                    participant={participant}
                    assignments={assignmentsByParticipant.get(participant.participant_id) ?? []}
                    submittedJudges={submissionStatus.get(participant.participant_id) ?? new Set()}
                    availableJudges={judges}
                    eventId={event.event_id}
                  />
                ))}
              </tbody>
            </table>
            <p className="px-5 py-2.5 text-xs text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-700/60">
              Click a participant row to manage judge assignments
            </p>
          </div>
        )}
      </section>
    </div>
  )
}
