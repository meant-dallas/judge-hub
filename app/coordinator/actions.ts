'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { assignJudgeToParticipant, removeAssignment } from '@/lib/db/assignments'

export async function assignJudgeAction(
  participantId: string,
  judgeEmail: string,
  eventId: string
): Promise<{ error?: string }> {
  const session = await auth()
  if (!session?.user || !['admin', 'coordinator'].includes(session.user.role)) {
    return { error: 'Forbidden' }
  }
  if (!judgeEmail) return { error: 'Select a judge' }

  await assignJudgeToParticipant(judgeEmail, participantId, session.user.email!)
  revalidatePath(`/coordinator/events/${eventId}`)
  return {}
}

export async function removeAssignmentAction(
  assignmentId: string,
  eventId: string
): Promise<void> {
  const session = await auth()
  if (!session?.user || !['admin', 'coordinator'].includes(session.user.role)) return
  await removeAssignment(assignmentId)
  revalidatePath(`/coordinator/events/${eventId}`)
}
