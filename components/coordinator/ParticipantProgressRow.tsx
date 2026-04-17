import type { Participant } from '@/types/sheets'

const PARTICIPANT_STATUS_BADGE: Record<string, string> = {
  pending: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  active: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
  judging: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
  complete: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400',
}

export default function ParticipantProgressRow({
  participant,
  submittedCount,
  totalJudges,
}: {
  participant: Participant
  submittedCount: number
  totalJudges: number
}) {
  const progressPct = totalJudges > 0 ? Math.round((submittedCount / totalJudges) * 100) : 0

  return (
    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
      <td className="px-5 py-3.5">
        <p className="font-medium text-slate-900 dark:text-slate-100">{participant.name}</p>
        {participant.description && (
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 line-clamp-1">{participant.description}</p>
        )}
      </td>
      <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400 text-sm">{participant.team_name || '—'}</td>
      <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400 text-sm">{participant.category || '—'}</td>
      <td className="px-4 py-3.5">
        <span className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${PARTICIPANT_STATUS_BADGE[participant.status] ?? PARTICIPANT_STATUS_BADGE.pending}`}>
          {participant.status}
        </span>
      </td>
      <td className="px-4 py-3.5">
        {totalJudges === 0 ? (
          <span className="text-xs text-slate-400 dark:text-slate-500">No judges</span>
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-20 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
              {submittedCount}/{totalJudges}
            </span>
          </div>
        )}
      </td>
    </tr>
  )
}
