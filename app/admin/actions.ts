'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { createEvent, updateEventStatus } from '@/lib/sheets/events'
import { createParticipant, updateParticipantStatus, getParticipantsByEvent } from '@/lib/sheets/participants'
import { createCriterion, deleteCriterion } from '@/lib/sheets/criteria'
import { upsertUser, setUserStatus } from '@/lib/sheets/users'
import { assignJudgeToParticipant, removeAssignment, getAllAssignments } from '@/lib/sheets/assignments'
import type { Event, Participant } from '@/types/sheets'
import type { UserRole } from '@/types/index'

function generateId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `${prefix}-${Date.now()}-${rand}`
}

// ─── Events ──────────────────────────────────────────────────────────────────

export async function createEventAction(formData: FormData): Promise<{ error?: string }> {
  const session = await auth()
  if (session?.user?.role !== 'admin') return { error: 'Forbidden' }

  const name = formData.get('name')?.toString().trim()
  const description = formData.get('description')?.toString().trim() ?? ''
  const date = formData.get('date')?.toString().trim()

  if (!name || !date) return { error: 'Name and date are required' }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { error: 'Date must be YYYY-MM-DD' }

  await createEvent({
    event_id: generateId('EVT'),
    name,
    description,
    date,
    status: 'draft',
    created_by: session.user.email!,
  })

  revalidatePath('/admin/events')
  revalidatePath('/admin')
  return {}
}

export async function updateEventStatusAction(
  eventId: string,
  status: Event['status']
): Promise<void> {
  const session = await auth()
  if (session?.user?.role !== 'admin') return
  await updateEventStatus(eventId, status)
  revalidatePath('/admin/events')
  revalidatePath(`/admin/events/${eventId}`)
  revalidatePath('/admin')
}

// ─── Participants ─────────────────────────────────────────────────────────────

export async function createParticipantAction(
  eventId: string,
  formData: FormData
): Promise<{ error?: string }> {
  const session = await auth()
  if (!session?.user || !['admin', 'coordinator'].includes(session.user.role)) {
    return { error: 'Forbidden' }
  }

  const name = formData.get('name')?.toString().trim()
  const description = formData.get('description')?.toString().trim() ?? ''
  const category = formData.get('category')?.toString().trim() ?? ''
  const team_name = formData.get('team_name')?.toString().trim() ?? ''
  const contact_email = formData.get('contact_email')?.toString().trim() ?? ''

  if (!name) return { error: 'Name is required' }

  await createParticipant({
    participant_id: generateId('PART'),
    name,
    description,
    category,
    team_name,
    contact_email,
    status: 'pending',
    event_id: eventId,
  })

  revalidatePath(`/admin/events/${eventId}`)
  return {}
}

export async function updateParticipantStatusAction(
  participantId: string,
  status: Participant['status'],
  eventId: string
): Promise<void> {
  const session = await auth()
  if (!session?.user || !['admin', 'coordinator'].includes(session.user.role)) return
  await updateParticipantStatus(participantId, status)
  revalidatePath(`/admin/events/${eventId}`)
}

// ─── Criteria ─────────────────────────────────────────────────────────────────

export async function createCriterionAction(
  eventId: string,
  formData: FormData
): Promise<{ error?: string }> {
  const session = await auth()
  if (!session?.user || !['admin', 'coordinator'].includes(session.user.role)) {
    return { error: 'Forbidden' }
  }

  const name = formData.get('name')?.toString().trim()
  const description = formData.get('description')?.toString().trim() ?? ''
  const category = formData.get('category')?.toString().trim() ?? ''
  const maxScoreRaw = formData.get('max_score')?.toString()
  const weightRaw = formData.get('weight')?.toString() ?? '1'

  if (!name) return { error: 'Name is required' }

  const max_score = parseFloat(maxScoreRaw ?? '')
  const weight = parseFloat(weightRaw)

  if (isNaN(max_score) || max_score <= 0) return { error: 'Max score must be a positive number' }
  if (isNaN(weight) || weight <= 0) return { error: 'Weight must be a positive number' }

  await createCriterion({
    criteria_id: generateId('CRIT'),
    name,
    description,
    max_score,
    weight,
    category,
    event_id: eventId,
  })

  revalidatePath(`/admin/events/${eventId}`)
  revalidatePath(`/coordinator/events/${eventId}`)
  return {}
}

export async function deleteCriterionAction(
  criteriaId: string,
  eventId: string
): Promise<{ error?: string }> {
  const session = await auth()
  if (!session?.user || !['admin', 'coordinator'].includes(session.user.role)) {
    return { error: 'Forbidden' }
  }

  await deleteCriterion(criteriaId)
  revalidatePath(`/admin/events/${eventId}`)
  revalidatePath(`/coordinator/events/${eventId}`)
  return {}
}

// ─── Event-level judge assignment ─────────────────────────────────────────────

export async function assignJudgeToEventAction(
  judgeEmail: string,
  eventId: string
): Promise<{ error?: string }> {
  const session = await auth()
  if (!session?.user || !['admin', 'coordinator'].includes(session.user.role)) {
    return { error: 'Forbidden' }
  }

  const participants = await getParticipantsByEvent(eventId)
  if (participants.length === 0) return { error: 'No participants in this event' }

  await Promise.all(
    participants.map((p) =>
      assignJudgeToParticipant(judgeEmail, p.participant_id, session.user!.email!)
    )
  )

  revalidatePath(`/admin/events/${eventId}`)
  revalidatePath(`/coordinator/events/${eventId}`)
  revalidatePath('/judge')
  return {}
}

export async function removeJudgeFromEventAction(
  judgeEmail: string,
  eventId: string
): Promise<{ error?: string }> {
  const session = await auth()
  if (!session?.user || !['admin', 'coordinator'].includes(session.user.role)) {
    return { error: 'Forbidden' }
  }

  const [allAssignments, participants] = await Promise.all([
    getAllAssignments(),
    getParticipantsByEvent(eventId),
  ])

  const participantIds = new Set(participants.map((p) => p.participant_id))
  const toRemove = allAssignments.filter(
    (a) =>
      a.judge_email.toLowerCase() === judgeEmail.toLowerCase() &&
      participantIds.has(a.participant_id)
  )

  for (const a of toRemove) {
    await removeAssignment(a.assignment_id)
  }

  revalidatePath(`/admin/events/${eventId}`)
  revalidatePath(`/coordinator/events/${eventId}`)
  revalidatePath('/judge')
  return {}
}

// ─── Users ───────────────────────────────────────────────────────────────────

export async function upsertUserAction(formData: FormData): Promise<{ error?: string }> {
  const session = await auth()
  if (session?.user?.role !== 'admin') return { error: 'Forbidden' }

  const email = formData.get('email')?.toString().trim()
  const role = formData.get('role')?.toString() as UserRole
  const name = formData.get('name')?.toString().trim()

  if (!email || !role) return { error: 'Email and role are required' }
  if (!['admin', 'coordinator', 'judge'].includes(role)) return { error: 'Invalid role' }

  await upsertUser({ email, role, name })
  revalidatePath('/admin/users')
  return {}
}

export async function setUserStatusAction(
  email: string,
  status: 'active' | 'inactive'
): Promise<void> {
  const session = await auth()
  if (session?.user?.role !== 'admin') return
  await setUserStatus(email, status)
  revalidatePath('/admin/users')
}

export async function changeUserRoleAction(
  email: string,
  role: UserRole
): Promise<void> {
  const session = await auth()
  if (session?.user?.role !== 'admin') return
  await upsertUser({ email, role })
  revalidatePath('/admin/users')
}
