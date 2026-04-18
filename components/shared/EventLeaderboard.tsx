import type { LeaderboardEntry } from '@/types/sheets'

type EnrichedEntry = LeaderboardEntry & {
  team_name: string
  category: string
  overtime: boolean
  adjusted_score: number
}

const RANK_BADGE: Record<number, string> = {
  1: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
  2: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  3: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400',
}

export default function EventLeaderboard({
  entries,
  totalJudges,
  normalize,
  timeLimitMinutes,
  overtimeDeduction,
}: {
  entries: EnrichedEntry[]
  totalJudges: number
  normalize: boolean
  timeLimitMinutes: number
  overtimeDeduction: number
}) {
  const hasOvertimeColumn = timeLimitMinutes > 0
  const hasDeductionColumn = overtimeDeduction > 0 && !normalize
  const scoreLabel = normalize ? 'Z-Score' : 'Score'

  if (entries.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/60 py-16 text-center">
        <p className="text-slate-400 dark:text-slate-500 text-sm">No scores submitted yet.</p>
        <p className="text-slate-300 dark:text-slate-600 text-xs mt-1">Results will appear once judges submit their scores.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {normalize && (
        <div className="flex items-center gap-2 px-1">
          <span className="inline-flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800/50 rounded-full px-3 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block" />
            Z-score normalized — scores shown as relative values (higher = better)
          </span>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/60 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-700/60">
              <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide px-5 py-3 w-12">Rank</th>
              <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide px-4 py-3">Participant</th>
              <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide px-4 py-3">Category</th>
              <th className="text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide px-4 py-3">{scoreLabel}</th>
              {hasDeductionColumn && (
                <th className="text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide px-4 py-3">Adj. Score</th>
              )}
              <th className="text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide px-4 py-3">Judges</th>
              {hasOvertimeColumn && (
                <th className="text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide px-4 py-3">Overtime</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
            {entries.map((entry, idx) => {
              const rank = idx + 1
              const rankBadgeClass = RANK_BADGE[rank] ?? 'bg-slate-50 text-slate-500 dark:bg-slate-800/50 dark:text-slate-400'
              return (
                <tr
                  key={entry.participant_id}
                  className={`transition-colors ${entry.overtime ? 'bg-red-50/40 dark:bg-red-950/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                >
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${rankBadgeClass}`}>
                      {rank}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="font-medium text-slate-900 dark:text-slate-100">{entry.name}</p>
                    {entry.team_name && (
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{entry.team_name}</p>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    {entry.category ? (
                      <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full px-2 py-0.5">
                        {entry.category}
                      </span>
                    ) : (
                      <span className="text-slate-300 dark:text-slate-600">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {normalize
                        ? entry.weighted_score.toFixed(3)
                        : entry.weighted_score.toFixed(1)}
                    </span>
                  </td>
                  {hasDeductionColumn && (
                    <td className="px-4 py-3.5 text-right">
                      <span className={`font-semibold ${entry.overtime ? 'text-red-600 dark:text-red-400' : 'text-slate-800 dark:text-slate-200'}`}>
                        {entry.adjusted_score.toFixed(1)}
                      </span>
                      {entry.overtime && (
                        <span className="ml-1 text-xs text-red-400 dark:text-red-500">−{overtimeDeduction}</span>
                      )}
                    </td>
                  )}
                  <td className="px-4 py-3.5 text-right">
                    <span className={`text-xs font-medium ${entry.judge_count < totalJudges ? 'text-amber-600 dark:text-amber-400' : 'text-green-600 dark:text-green-400'}`}>
                      {entry.judge_count}/{totalJudges}
                    </span>
                  </td>
                  {hasOvertimeColumn && (
                    <td className="px-4 py-3.5 text-right">
                      {entry.overtime ? (
                        <span className="text-xs font-medium bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 rounded-full px-2 py-0.5">
                          Overtime
                        </span>
                      ) : (
                        <span className="text-xs text-slate-300 dark:text-slate-600">On time</span>
                      )}
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
        <div className="px-5 py-2.5 border-t border-slate-100 dark:border-slate-700/60 flex justify-between text-xs text-slate-400 dark:text-slate-500">
          <span>{entries.length} participant{entries.length !== 1 ? 's' : ''}</span>
          {hasDeductionColumn && entries.some(e => e.overtime) && (
            <span>Overtime deduction: −{overtimeDeduction} pts applied</span>
          )}
        </div>
      </div>
    </div>
  )
}
