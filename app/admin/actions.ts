'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { createEvent, updateEventStatus } from '@/lib/sheets/events'
import { createParticipant, updateParticipantStatus } from '@/lib/sheets/participants'
import { upsertUser, setUserStatus } from '@/lib/sheets/users'
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
