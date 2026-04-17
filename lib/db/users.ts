import { eq } from 'drizzle-orm'
import { db, tables } from './index'
import type { UserRole, AppUser } from '@/types'
import type { SheetUser } from '@/types/sheets'

// Simple in-memory cache for role lookups (called on every auth check)
const roleCache = new Map<string, { role: UserRole; expiresAt: number }>()
const ROLE_CACHE_TTL = 5 * 60 * 1000 // 5 minutes

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapSheetUser(r: any): SheetUser {
  return {
    email:      r.email,
    role:       r.role as UserRole,
    name:       r.name ?? '',
    status:     r.status as 'active' | 'inactive',
    created_at: r.created_at ?? '',
    notes:      r.notes ?? '',
  }
}

export async function getRoleForEmail(email: string): Promise<UserRole | null> {
  const key = email.toLowerCase()
  const cached = roleCache.get(key)
  if (cached && cached.expiresAt > Date.now()) return cached.role

  const rows = await db
    .select()
    .from(tables.users)
    .where(eq(tables.users.email, key))

  if (rows.length === 0) return null
  const user = mapSheetUser(rows[0])
  if (user.status !== 'active') return null

  roleCache.set(key, { role: user.role, expiresAt: Date.now() + ROLE_CACHE_TTL })
  return user.role
}

export async function getAllUsers(): Promise<AppUser[]> {
  const rows = await db
    .select()
    .from(tables.users)
    .where(eq(tables.users.status, 'active'))
  return rows.map((r: ReturnType<typeof mapSheetUser>) => ({
    id:    r.email,
    email: r.email,
    name:  r.name || null,
    image: null,
    role:  r.role,
  }))
}

export async function getAllSheetUsers(): Promise<SheetUser[]> {
  const rows = await db.select().from(tables.users)
  return rows.map(mapSheetUser)
}

export async function upsertUser(data: { email: string; role: UserRole; name?: string }): Promise<void> {
  const email = data.email.toLowerCase()
  const existing = await db
    .select()
    .from(tables.users)
    .where(eq(tables.users.email, email))

  if (existing.length > 0) {
    await db
      .update(tables.users)
      .set({ role: data.role, ...(data.name ? { name: data.name } : {}), status: 'active' })
      .where(eq(tables.users.email, email))
  } else {
    await db.insert(tables.users).values({
      email,
      role:       data.role,
      name:       data.name ?? '',
      status:     'active',
      created_at: new Date().toISOString(),
      notes:      '',
    })
  }
  roleCache.delete(email)
}

export async function setUserStatus(email: string, status: 'active' | 'inactive'): Promise<void> {
  const key = email.toLowerCase()
  await db.update(tables.users).set({ status }).where(eq(tables.users.email, key))
  roleCache.delete(key)
}
