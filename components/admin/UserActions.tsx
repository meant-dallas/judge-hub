'use client'

import { useTransition } from 'react'
import { setUserStatusAction, changeUserRoleAction } from '@/app/admin/actions'
import type { UserRole } from '@/types/index'

const ROLE_BADGE: Record<UserRole, string> = {
  admin: 'bg-red-100 text-red-700',
  coordinator: 'bg-blue-100 text-blue-700',
  judge: 'bg-green-100 text-green-700',
}

export function RoleSelect({ email, role }: { email: string; role: UserRole }) {
  const [isPending, startTransition] = useTransition()

  return (
    <select
      value={role}
      disabled={isPending}
      onChange={(e) => {
        const next = e.target.value as UserRole
        startTransition(() => changeUserRoleAction(email, next))
      }}
      className={`text-xs font-semibold capitalize px-2.5 py-1 rounded-full border-0 cursor-pointer appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-300 ${ROLE_BADGE[role]} disabled:opacity-60`}
    >
      <option value="admin">admin</option>
      <option value="coordinator">coordinator</option>
      <option value="judge">judge</option>
    </select>
  )
}

export function StatusToggle({ email, status }: { email: string; status: 'active' | 'inactive' }) {
  const [isPending, startTransition] = useTransition()
  const next = status === 'active' ? 'inactive' : 'active'

  return (
    <button
      disabled={isPending}
      onClick={() => startTransition(() => setUserStatusAction(email, next))}
      className={`text-xs font-medium px-3 py-1 rounded-full transition-colors disabled:opacity-60 ${
        status === 'active'
          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
      }`}
    >
      {isPending ? '…' : status}
    </button>
  )
}
