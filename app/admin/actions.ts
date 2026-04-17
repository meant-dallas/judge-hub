'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { createEvent, updateEventStatus, updateActiveParticipant, updateEventTimeLimit, getEventById } from '@/lib/db/events'
import { createParticipant, updateParticipantStatus, updateParticipantOvertime, getParticipantsByEvent } from '@/lib/db/participants'
import { createCriterion, deleteCriterion, getCriteriaByEvent } from '@/lib/db/criteria'
import { upsertUser, setUserStatus } from '@/lib/db/users'
import { assignJudgeToParticipant, removeAssignment, getAllAssignments } from '@/lib/db/assignments'
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
    active_participant_id: '',
    time_limit_minutes: 0,
    overtime_deduction: 0,
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
    overtime: false,
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

// ─── Live session ─────────────────────────────────────────────────────────────

export async function setActiveParticipantAction(
  eventId: string,
  participantId: string  // '' to clear without ending session
): Promise<{ error?: string }> {
  const session = await auth()
  if (!session?.user || !['admin', 'coordinator'].includes(session.user.role)) {
    return { error: 'Forbidden' }
  }

  // Mark the previously active participant as complete
  const event = await getEventById(eventId)
  if (event?.active_participant_id && event.active_participant_id !== participantId) {
    await updateParticipantStatus(event.active_participant_id, 'complete')
  }

  await updateActiveParticipant(eventId, participantId)

  revalidatePath(`/admin/events/${eventId}`)
  revalidatePath(`/coordinator/events/${eventId}`)
  revalidatePath(`/judge/events/${eventId}`)
  return {}
}

export async function endSessionAction(eventId: string): Promise<{ error?: string }> {
  const session = await auth()
  if (!session?.user || !['admin', 'coordinator'].includes(session.user.role)) {
    return { error: 'Forbidden' }
  }

  // Mark last presenting participant as complete
  const event = await getEventById(eventId)
  if (event?.active_participant_id) {
    await updateParticipantStatus(event.active_participant_id, 'complete')
  }

  await updateActiveParticipant(eventId, '')
  await updateEventStatus(eventId, 'completed')

  revalidatePath(`/admin/events/${eventId}`)
  revalidatePath(`/coordinator/events/${eventId}`)
  revalidatePath(`/judge/events/${eventId}`)
  revalidatePath('/coordinator/events')
  revalidatePath('/admin/events')
  return {}
}

// ─── Overtime ─────────────────────────────────────────────────────────────────

export async function updateEventTimeLimitAction(
  eventId: string,
  timeLimitMinutes: number,
  overtimeDeduction: number
): Promise<{ error?: string }> {
  const session = await auth()
  if (!session?.user || !['admin', 'coordinator'].includes(session.user.role)) {
    return { error: 'Forbidden' }
  }

  await updateEventTimeLimit(eventId, timeLimitMinutes, overtimeDeduction)
  revalidatePath(`/admin/events/${eventId}`)
  revalidatePath(`/coordinator/events/${eventId}`)
  return {}
}

export async function setParticipantOvertimeAction(
  participantId: string,
  overtime: boolean,
  eventId: string
): Promise<{ error?: string }> {
  const session = await auth()
  if (!session?.user || !['admin', 'coordinator'].includes(session.user.role)) {
    return { error: 'Forbidden' }
  }

  await updateParticipantOvertime(participantId, overtime)
  revalidatePath(`/admin/events/${eventId}`)
  revalidatePath(`/coordinator/events/${eventId}`)
  return {}
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

const STANDARD_CRITERIA = [
  { name: 'Introduction',            description: 'Opening and context-setting',                    max_score: 15 },
  { name: 'Knowledge & Depth',       description: 'Technical depth and understanding of the subject', max_score: 35 },
  { name: 'Presentation & Delivery', description: 'Clarity, confidence, and communication skills',   max_score: 35 },
  { name: 'Conclusion',              description: 'Summary and closing remarks',                      max_score: 15 },
] as const

export async function applyStandardCriteriaTemplateAction(
  eventId: string
): Promise<{ error?: string }> {
  const session = await auth()
  if (!session?.user || !['admin', 'coordinator'].includes(session.user.role)) {
    return { error: 'Forbidden' }
  }

  // Idempotent: skip if criteria already exist
  const existing = await getCriteriaByEvent(eventId)
  if (existing.length > 0) return {}

  for (const t of STANDARD_CRITERIA) {
    await createCriterion({
      criteria_id: generateId('CRIT'),
      name: t.name,
      description: t.description,
      max_score: t.max_score,
      weight: 1,
      category: '',
      event_id: eventId,
    })
  }

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
