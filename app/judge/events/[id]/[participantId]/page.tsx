import { auth } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { getEventById } from '@/lib/sheets/events'
import { getParticipantById } from '@/lib/sheets/participants'
import { getCriteriaByEvent } from '@/lib/sheets/criteria'
import { getScoresByJudge } from '@/lib/sheets/scores'
import { getAssignmentsForJudge } from '@/lib/sheets/assignments'
import ScoringForm from '@/components/judge/ScoringForm'

export default async function ScoringPage({
  params,
}: {
  params: Promise<{ id: string; participantId: string }>
}) {
  const { id, participantId } = await params
  const session = await auth()
  if (!session?.user) redirect('/login')
  const judgeEmail = session.user.email!

  const [event, participant, criteria, scores, assignments] = await Promise.all([
    getEventById(id),
    getParticipantById(participantId),
    getCriteriaByEvent(id),
    getScoresByJudge(judgeEmail),
    getAssignmentsForJudge(judgeEmail),
  ])

  if (!event) notFound()
  if (!participant || participant.event_id !== id) notFound()

  // Verify judge is assigned to this participant
  const isAssigned = assignments.some((a) => a.participant_id === participantId)
  if (!isAssigned) redirect(`/judge/events/${id}`)

  // Filter scores for this judge + participant
  const participantScores = scores.filter((s) => s.participant_id === participantId)

  // Submitted = at least one score with is_draft=false
  const isSubmitted = participantScores.some((s) => !s.is_draft)

  return (
    <div className="p-8 max-w-3xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 mb-4">
        <Link href="/judge" className="hover:text-slate-600 dark:hover:text-slate-300">My Events</Link>
        <span>/</span>
        <Link href={`/judge/events/${id}`} className="hover:text-slate-600 dark:hover:text-slate-300">{event.name}</Link>
        <span>/</span>
        <span className="text-slate-600 dark:text-slate-300">{participant.name}</span>
      </div>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{participant.name}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {[participant.team_name, participant.category].filter(Boolean).join(' · ') || event.name}
        </p>
      </div>

      {criteria.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/60 py-16 text-center">
          <p className="text-slate-400 dark:text-slate-500 text-sm">No scoring criteria defined for this event.</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Contact a coordinator to set up criteria.</p>
        </div>
      ) : (
        <ScoringForm
          criteria={criteria}
          existingScores={participantScores}
          participantId={participantId}
          participantName={participant.name}
          eventId={id}
          isSubmitted={isSubmitted}
        />
      )}
    </div>
  )
}
