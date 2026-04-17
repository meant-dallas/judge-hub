'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { upsertScores, submitScores } from '@/lib/db/scores'
import { getAssignmentsForJudge } from '@/lib/db/assignments'

async function verifyJudgeAssignment(judgeEmail: string, participantId: string): Promise<boolean> {
  const assignments = await getAssignmentsForJudge(judgeEmail)
  return assignments.some((a) => a.participant_id === participantId)
}

export async function saveScoreDraftsAction(
  participantId: string,
  eventId: string,
  scores: Array<{ criteriaId: string; score: number; comments: string }>
): Promise<{ error?: string }> {
  const session = await auth()
  if (!session?.user) return { error: 'Unauthorized' }

  const isAssigned = await verifyJudgeAssignment(session.user.email!, participantId)
  if (!isAssigned) return { error: 'Forbidden: not assigned to this participant' }

  await upsertScores(
    scores.map((s) => ({
      judge_email: session.user.email!,
      participant_id: participantId,
      criteria_id: s.criteriaId,
      score: s.score,
      comments: s.comments,
      is_draft: true,
    }))
  )

  revalidatePath(`/judge/events/${eventId}/${participantId}`)
  revalidatePath(`/judge/events/${eventId}`)
  return {}
}

export async function submitScoresAction(
  participantId: string,
  eventId: string,
  scores: Array<{ criteriaId: string; score: number; comments: string }>
): Promise<{ error?: string }> {
  const session = await auth()
  if (!session?.user) return { error: 'Unauthorized' }

  const isAssigned = await verifyJudgeAssignment(session.user.email!, participantId)
  if (!isAssigned) return { error: 'Forbidden: not assigned to this participant' }

  // Save current values first, then flip is_draft to false
  await upsertScores(
    scores.map((s) => ({
      judge_email: session.user.email!,
      participant_id: participantId,
      criteria_id: s.criteriaId,
      score: s.score,
      comments: s.comments,
      is_draft: true,
    }))
  )
  await submitScores(session.user.email!, participantId)

  revalidatePath(`/judge/events/${eventId}`)
  revalidatePath(`/judge`)
  return {}
}
