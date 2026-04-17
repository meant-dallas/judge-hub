import type { UserRole, AppUser } from '@/types'
import { SHEET_NAMES } from './client'
import { cache, ROLE_CACHE_TTL_MS } from './cache'
import { readSheet, appendRow, updateRow, findRowByColumn } from './helpers'
import { rowToUser } from '@/types/sheets'

const COL = {
  EMAIL: 0,
  ROLE: 1,
  NAME: 2,
  STATUS: 3,
  CREATED_AT: 4,
  NOTES: 5,
}

export async function getRoleForEmail(email: string): Promise<UserRole | null> {
  const key = `role:${email.toLowerCase()}`
  const cached = cache.get<UserRole>(key)
  if (cached) return cached

  const result = await findRowByColumn(SHEET_NAMES.USERS, COL.EMAIL, email)
  if (!result) return null

  const user = rowToUser(result.row)
  if (user.status !== 'active') return null

  cache.set(key, user.role, ROLE_CACHE_TTL_MS)
  return user.role
}

export async function getAllUsers(): Promise<AppUser[]> {
  const rows = await readSheet(SHEET_NAMES.USERS)
  return rows
    .map(rowToUser)
    .filter((u) => u.status === 'active')
    .map((u) => ({
      id: u.email,
      email: u.email,
      name: u.name || null,
      image: null,
      role: u.role,
    }))
}

export async function upsertUser(data: {
  email: string
  role: UserRole
  name?: string
}): Promise<void> {
  const email = data.email.toLowerCase()
  const existing = await findRowByColumn(SHEET_NAMES.USERS, COL.EMAIL, email)

  if (existing) {
    const updated = [...existing.row]
    updated[COL.ROLE] = data.role
    if (data.name) updated[COL.NAME] = data.name
    updated[COL.STATUS] = 'active'
    await updateRow(SHEET_NAMES.USERS, existing.rowIndex, updated)
  } else {
    await appendRow(SHEET_NAMES.USERS, [
      email,
      data.role,
      data.name ?? '',
      'active',
      new Date().toISOString(),
      '',
    ])
  }
  cache.invalidate(`role:${email}`)
}

export async function setUserStatus(
  email: string,
  status: 'active' | 'inactive'
): Promise<void> {
  const existing = await findRowByColumn(SHEET_NAMES.USERS, COL.EMAIL, email.toLowerCase())
  if (!existing) return

  const updated = [...existing.row]
  updated[COL.STATUS] = status
  await updateRow(SHEET_NAMES.USERS, existing.rowIndex, updated)
  cache.invalidate(`role:${email.toLowerCase()}`)
}
