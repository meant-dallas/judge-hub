import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getEventById } from '@/lib/sheets/events'
import { getParticipantsByEvent } from '@/lib/sheets/participants'
import { getCriteriaByEvent } from '@/lib/sheets/criteria'
import AddParticipantForm from '@/components/admin/AddParticipantForm'
import EventStatusSelect from '@/components/admin/EventStatusSelect'

const PARTICIPANT_STATUS_BADGE: Record<string, string> = {
  pending: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  active: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
  judging: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
  complete: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400',
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [event, participants, criteria] = await Promise.all([
    getEventById(id),
    getParticipantsByEvent(id),
    getCriteriaByEvent(id),
  ])

  if (!event) notFound()

  return (
    <div className="p-8 max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/admin/events" className="text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300">
              ← Events
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{event.name}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{event.date}{event.description ? ` · ${event.description}` : ''}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 dark:text-slate-400">Status:</span>
          <EventStatusSelect eventId={event.event_id} status={event.status} />
        </div>
      </div>

      {/* Participants */}
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
                  <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide px-4 py-3">Contact</th>
                  <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {participants.map((p) => (
                  <tr key={p.participant_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-slate-900 dark:text-slate-100">{p.name}</p>
                      {p.description && (
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 line-clamp-1">{p.description}</p>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400">{p.team_name || '—'}</td>
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400">{p.category || '—'}</td>
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400">{p.contact_email || '—'}</td>
                    <td className="px-4 py-3.5">
                      <span className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${PARTICIPANT_STATUS_BADGE[p.status] ?? PARTICIPANT_STATUS_BADGE.pending}`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Criteria */}
      {criteria.length > 0 && (
        <section>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-3">
            Judging Criteria
            <span className="ml-2 text-xs font-normal text-slate-400 dark:text-slate-500">{criteria.length}</span>
          </h2>
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/60 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700/60">
                  <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide px-5 py-3">Criterion</th>
                  <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide px-4 py-3">Category</th>
                  <th className="text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide px-4 py-3">Max Score</th>
                  <th className="text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide px-4 py-3">Weight</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {criteria.map((c) => (
                  <tr key={c.criteria_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-slate-900 dark:text-slate-100">{c.name}</p>
                      {c.description && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{c.description}</p>}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400">{c.category || '—'}</td>
                    <td className="px-4 py-3.5 text-right text-slate-700 dark:text-slate-300">{c.max_score}</td>
                    <td className="px-4 py-3.5 text-right text-slate-700 dark:text-slate-300">{c.weight}×</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  )
}
