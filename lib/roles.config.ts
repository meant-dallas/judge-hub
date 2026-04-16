import type { UserRole } from '@/types'

// Interim: hardcoded email → role map.
// Phase 3: replace this lookup with a Google Sheets API call.
const roleMap: Record<string, UserRole> = {
  'sudhin@gmail.com': 'admin',
  'nithyasam@gmail.com': 'coordinator',
  'judge@example.com': 'judge',
  // Add authorized user emails and their roles here during development.
  // Example:
  // 'admin@example.com': 'admin',
  // 'coord@example.com': 'coordinator',
  // 'judge@example.com': 'judge',
}

export async function getRoleForEmail(email: string): Promise<UserRole | null> {
  return roleMap[email.toLowerCase()] ?? null
}
