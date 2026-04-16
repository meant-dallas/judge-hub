export type UserRole = 'admin' | 'coordinator' | 'judge'

export interface AppUser {
  id: string
  email: string
  name: string | null
  image: string | null
  role: UserRole
}

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  admin: 3,
  coordinator: 2,
  judge: 1,
}
