'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { upsertScores, submitScores } from '@/lib/db/scores'

export async function saveScoreDraftsAction(
  participantId: string,
  eventId: string,
  scores: Array<{ criteriaId: string; score: number; comments: string }>
): Promise<{ error?: string }> {
  const session = await auth()
  if (!session?.user) return { error: 'Unauthorized' }

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
