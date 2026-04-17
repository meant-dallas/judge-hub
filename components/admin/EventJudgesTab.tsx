'use client'

import { useState, useTransition } from 'react'
import { assignJudgeToEventAction, removeJudgeFromEventAction } from '@/app/admin/actions'

interface AssignedJudge {
  email: string
  name: string
  submittedCount: number
  totalParticipants: number
}

interface AvailableJudge {
  email: string
  name: string
}

export default function EventJudgesTab({
  assignedJudges,
  availableJudges,
  eventId,
}: {
  assignedJudges: AssignedJudge[]
  availableJudges: AvailableJudge[]
  eventId: string
}) {
  const [selectedEmail, setSelectedEmail] = useState('')
  const [assignError, setAssignError] = useState<string | null>(null)
  const [isPendingAssign, startAssignTransition] = useTransition()

  function handleAssign() {
    if (!selectedEmail) return
    setAssignError(null)
    startAssignTransition(async () => {
      const result = await assignJudgeToEventAction(selectedEmail, eventId)
      if (result.error) {
        setAssignError(result.error)
      } else {
        setSelectedEmail('')
      }
    })
  }

  return (
    <div className="space-y-5">
      {/* Assigned judges */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/60 overflow-hidden">
        {assignedJudges.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-slate-400 dark:text-slate-500 text-sm">No judges assigned to this event yet.</p>
          </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700/60">
                  <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide px-5 py-3">Judge</th>
                  <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide px-4 py-3">Progress</th>
                  <th className="px-4 py-3 w-10"/>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {assignedJudges.map((judge) => (
                  <JudgeRow
                    key={judge.email}
                    judge={judge}
                    eventId={eventId}
                  />
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>

      {/* Assign judge */}
      {availableJudges.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/60 p-5">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">Assign Judge</h3>
          {assignError && (
            <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2 mb-3">{assignError}</p>
          )}
          <div className="flex items-center gap-3">
            <select
              value={selectedEmail}
              onChange={(e) => setSelectedEmail(e.target.value)}
              disabled={isPendingAssign}
              className="flex-1 text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-700 disabled:opacity-60"
            >
              <option value="">Select a judge…</option>
              {availableJudges.map((j) => (
                <option key={j.email} value={j.email}>
                  {j.name || j.email}{j.name ? ` (${j.email})` : ''}
                </option>
              ))}
            </select>
            <button
              onClick={handleAssign}
              disabled={!selectedEmail || isPendingAssign}
              className="text-sm bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
            >
              {isPendingAssign ? 'Assigning…' : 'Assign'}
            </button>
          </div>
        </div>
      )}

      {availableJudges.length === 0 && assignedJudges.length > 0 && (
        <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-2">
          All active judges are assigned to this event.
        </p>
      )}
    </div>
  )
}

function JudgeRow({ judge, eventId }: { judge: AssignedJudge; eventId: string }) {
  const [isPending, startTransition] = useTransition()
  const pct = judge.totalParticipants > 0
    ? Math.round((judge.submittedCount / judge.totalParticipants) * 100)
    : 0
  const allSubmitted = judge.submittedCount === judge.totalParticipants && judge.totalParticipants > 0

  return (
    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-xs font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
            {(judge.name || judge.email)[0].toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{judge.name || judge.email}</p>
            {judge.name && (
              <p className="text-xs text-slate-400 dark:text-slate-500">{judge.email}</p>
            )}
          </div>
        </div>
      </td>
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${allSubmitted ? 'bg-green-500' : 'bg-indigo-500'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
            {judge.submittedCount}/{judge.totalParticipants} submitted
          </span>
        </div>
      </td>
      <td className="px-4 py-3.5 text-right">
        <button
          disabled={isPending}
          onClick={() => startTransition(async () => { await removeJudgeFromEventAction(judge.email, eventId) })}
          className="text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 disabled:opacity-40 transition-colors"
          aria-label={`Remove ${judge.name || judge.email}`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </td>
    </tr>
  )
}
