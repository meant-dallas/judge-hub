import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getEventById } from '@/lib/sheets/events'
import { getParticipantsByEvent } from '@/lib/sheets/participants'
import { getCriteriaByEvent } from '@/lib/sheets/criteria'
import { getAllAssignments } from '@/lib/sheets/assignments'
import { getAllSheetUsers } from '@/lib/sheets/users'
import { getSubmissionStatusByParticipants } from '@/lib/sheets/scores'
import AddParticipantForm from '@/components/admin/AddParticipantForm'
import AddCriterionForm from '@/components/admin/AddCriterionForm'
import DeleteCriterionButton from '@/components/admin/DeleteCriterionButton'
import EventStatusSelect from '@/components/admin/EventStatusSelect'
import EventTabNav from '@/components/shared/EventTabNav'
import EventJudgesTab from '@/components/admin/EventJudgesTab'
import ParticipantProgressRow from '@/components/coordinator/ParticipantProgressRow'
import SessionControls from '@/components/coordinator/SessionControls'

const PARTICIPANT_STATUS_BADGE: Record<string, string> = {
  pending: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  active: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
  judging: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
  complete: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400',
}

export default async function EventDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ tab?: string }>
}) {
  const { id } = await params
  const { tab = 'participants' } = await searchParams

  const [event, participants, criteria, allAssignments, allUsers] = await Promise.all([
    getEventById(id),
    getParticipantsByEvent(id),
    getCriteriaByEvent(id),
    getAllAssignments(),
    getAllSheetUsers(),
  ])

  if (!event) notFound()

  const participantIds = participants.map((p) => p.participant_id)
  const submissionStatus = await getSubmissionStatusByParticipants(participantIds)

  const activeJudges = allUsers.filter((u) => u.role === 'judge' && u.status === 'active')
  const assignmentsForEvent = allAssignments.filter((a) => participantIds.includes(a.participant_id))
  const assignedJudgeEmails = [...new Set(assignmentsForEvent.map((a) => a.judge_email.toLowerCase()))]

  const assignedJudges = assignedJudgeEmails.map((email) => {
    const user = allUsers.find((u) => u.email.toLowerCase() === email)
    const submittedCount = participantIds.filter(
      (pid) => submissionStatus.get(pid)?.has(email)
    ).length
    return { email, name: user?.name ?? '', submittedCount, totalParticipants: participants.length }
  })

  const availableJudges = activeJudges
    .filter((j) => !assignedJudgeEmails.includes(j.email.toLowerCase()))
    .map((j) => ({ email: j.email, name: j.name }))

  // Live session data
  const isLive = event.active_participant_id !== ''
  const activeParticipant = isLive
    ? participants.find((p) => p.participant_id === event.active_participant_id) ?? null
    : null
  const activeParticipantSubmittedCount = activeParticipant
    ? submissionStatus.get(activeParticipant.participant_id)?.size ?? 0
    : 0
  const activeParticipantIndex = activeParticipant
    ? participants.findIndex((p) => p.participant_id === activeParticipant.participant_id)
    : -1
  const nextParticipant =
    activeParticipantIndex >= 0 && activeParticipantIndex < participants.length - 1
      ? participants[activeParticipantIndex + 1]
      : null

  const basePath = `/admin/events/${id}`

  return (
    <div className="p-8 max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link href="/admin/events" className="text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 mb-1 inline-block">
            ← Events
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{event.name}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {event.date}{event.description ? ` · ${event.description}` : ''}
          </p>
        </div>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-xs text-slate-500 dark:text-slate-400">Status:</span>
          <EventStatusSelect eventId={event.event_id} status={event.status} />
        </div>
      </div>

      {/* Tabs */}
      <EventTabNav basePath={basePath} activeTab={tab} />

      {/* Participants tab */}
      {tab !== 'criteria' && tab !== 'judges' && (
        <section className="space-y-4">
          {event.status === 'active' && participants.length > 0 && (
            <SessionControls
              eventId={event.event_id}
              isLive={isLive}
              activeParticipantName={activeParticipant?.name ?? ''}
              firstParticipantId={participants[0]?.participant_id ?? null}
            />
          )}

          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Participants
              <span className="ml-2 text-xs font-normal text-slate-400 dark:text-slate-500">{participants.length}</span>
            </h2>
            <AddParticipantForm eventId={event.event_id} disabled={isLive} />
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
                    <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide px-4 py-3">Scores</th>
                    {isLive && <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Session</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                  {participants.map((p) => (
                    <ParticipantProgressRow
                      key={p.participant_id}
                      participant={p}
                      submittedCount={submissionStatus.get(p.participant_id)?.size ?? 0}
                      totalJudges={assignedJudgeEmails.length}
                      session={isLive ? { eventId: event.event_id, activeParticipantId: event.active_participant_id } : undefined}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* Criteria tab */}
      {tab === 'criteria' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Judging Criteria
              <span className="ml-2 text-xs font-normal text-slate-400 dark:text-slate-500">{criteria.length}</span>
            </h2>
            <AddCriterionForm eventId={event.event_id} />
          </div>

          {criteria.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/60 py-12 text-center">
              <p className="text-slate-400 dark:text-slate-500 text-sm">No criteria yet. Add the first one above.</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/60 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-700/60">
                    <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide px-5 py-3">Criterion</th>
                    <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide px-4 py-3">Category</th>
                    <th className="text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide px-4 py-3">Max Score</th>
                    <th className="text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide px-4 py-3">Weight</th>
                    <th className="px-4 py-3 w-10"/>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                  {criteria.map((c) => (
                    <tr key={c.criteria_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-slate-900 dark:text-slate-100">{c.name}</p>
                        {c.description && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{c.description}</p>}
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400">{c.category || '—'}</td>
                      <td className="px-4 py-3.5 text-right text-slate-700 dark:text-slate-300">{c.max_score}</td>
                      <td className="px-4 py-3.5 text-right text-slate-700 dark:text-slate-300">{c.weight}×</td>
                      <td className="px-4 py-3.5 text-right">
                        <DeleteCriterionButton criteriaId={c.criteria_id} eventId={event.event_id} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-5 py-2.5 border-t border-slate-100 dark:border-slate-700/60 flex justify-between text-xs text-slate-400 dark:text-slate-500">
                <span>{criteria.length} criteria</span>
                <span>Max weighted total: {criteria.reduce((s, c) => s + c.max_score * c.weight, 0).toFixed(0)}</span>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Judges tab */}
      {tab === 'judges' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Assigned Judges
              <span className="ml-2 text-xs font-normal text-slate-400 dark:text-slate-500">{assignedJudges.length}</span>
            </h2>
          </div>
          <EventJudgesTab
            assignedJudges={assignedJudges}
            availableJudges={availableJudges}
            eventId={event.event_id}
            activeParticipant={
              activeParticipant
                ? {
                    participant_id: activeParticipant.participant_id,
                    name: activeParticipant.name,
                    submittedJudgeCount: activeParticipantSubmittedCount,
                    nextParticipantId: nextParticipant?.participant_id ?? null,
                  }
                : null
            }
          />
        </section>
      )}
    </div>
  )
}
