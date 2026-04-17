'use client'

import { useState, useTransition } from 'react'
import { removeAssignmentAction } from '@/app/coordinator/actions'
import AssignJudgeForm from './AssignJudgeForm'
import type { Participant, Assignment, SheetUser } from '@/types/sheets'

const PARTICIPANT_STATUS_BADGE: Record<string, string> = {
  pending: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  active: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
  judging: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
  complete: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400',
}

function RemoveButton({ assignmentId, eventId }: { assignmentId: string; eventId: string }) {
  const [isPending, startTransition] = useTransition()
  return (
    <button
      disabled={isPending}
      onClick={() => startTransition(() => removeAssignmentAction(assignmentId, eventId))}
      className="text-slate-300 dark:text-slate-600 hover:text-red-400 dark:hover:text-red-400 disabled:opacity-40 transition-colors ml-1"
      aria-label="Remove assignment"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>
  )
}

export default function ParticipantProgressRow({
  participant,
  assignments,
  submittedJudges,
  availableJudges,
  eventId,
}: {
  participant: Participant
  assignments: Assignment[]
  submittedJudges: Set<string>
  availableJudges: SheetUser[]
  eventId: string
}) {
  const [expanded, setExpanded] = useState(false)

  const total = assignments.length
  const submitted = assignments.filter((a) => submittedJudges.has(a.judge_email.toLowerCase())).length
  const progressPct = total > 0 ? Math.round((submitted / total) * 100) : 0

  return (
    <>
      <tr
        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
        onClick={() => setExpanded((v) => !v)}
      >
        <td className="px-5 py-3.5">
          <div className="flex items-center gap-2">
            <svg
              width="12" height="12"
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              className={`text-slate-400 shrink-0 transition-transform ${expanded ? 'rotate-90' : ''}`}
            >
              <polyline points="9 18 15 12 9 6"/>
            </svg>
            <div>
              <p className="font-medium text-slate-900 dark:text-slate-100">{participant.name}</p>
              {participant.description && (
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 line-clamp-1">{participant.description}</p>
              )}
            </div>
          </div>
        </td>
        <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400 text-sm">{participant.team_name || '—'}</td>
        <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400 text-sm">{participant.category || '—'}</td>
        <td className="px-4 py-3.5">
          <span className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${PARTICIPANT_STATUS_BADGE[participant.status] ?? PARTICIPANT_STATUS_BADGE.pending}`}>
            {participant.status}
          </span>
        </td>
        <td className="px-4 py-3.5">
          {total === 0 ? (
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
                {submitted}/{total}
              </span>
            </div>
          )}
        </td>
      </tr>

      {expanded && (
        <tr className="bg-slate-50/70 dark:bg-slate-800/30">
          <td colSpan={5} className="px-8 py-4">
            <div className="space-y-3">
              {/* Assigned judges */}
              {assignments.length > 0 ? (
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Assigned Judges</p>
                  {assignments.map((a) => {
                    const hasSubmitted = submittedJudges.has(a.judge_email.toLowerCase())
                    const judge = availableJudges.find(
                      (j) => j.email.toLowerCase() === a.judge_email.toLowerCase()
                    )
                    return (
                      <div key={a.assignment_id} className="flex items-center justify-between max-w-md">
                        <div className="flex items-center gap-2.5">
                          <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                            {(judge?.name || a.judge_email)[0].toUpperCase()}
                          </div>
                          <div>
                            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                              {judge?.name || a.judge_email}
                            </span>
                            {judge?.name && (
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-1.5">{a.judge_email}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                            hasSubmitted
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                          }`}>
                            {hasSubmitted ? 'submitted' : 'pending'}
                          </span>
                          <RemoveButton assignmentId={a.assignment_id} eventId={eventId} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-400 dark:text-slate-500">No judges assigned yet</p>
              )}

              {/* Assign form */}
              <div className="max-w-md pt-1 border-t border-slate-200 dark:border-slate-700/60">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Assign Judge</p>
                <AssignJudgeForm
                  participantId={participant.participant_id}
                  eventId={eventId}
                  availableJudges={availableJudges.filter(
                    (j) => !assignments.some((a) => a.judge_email.toLowerCase() === j.email.toLowerCase())
                  )}
                />
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}
