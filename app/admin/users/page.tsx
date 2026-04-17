import { getAllSheetUsers } from '@/lib/db/users'
import AddUserForm from '@/components/admin/AddUserForm'
import { RoleSelect, StatusToggle } from '@/components/admin/UserActions'

export default async function UsersPage() {
  const users = await getAllSheetUsers()
  const sorted = [...users].sort((a, b) => a.email.localeCompare(b.email))

  const roleCounts = { admin: 0, coordinator: 0, judge: 0 }
  for (const u of users) {
    if (u.role in roleCounts) roleCounts[u.role as keyof typeof roleCounts]++
  }

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Users</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {users.length} user{users.length !== 1 ? 's' : ''} ·{' '}
            {roleCounts.admin} admin{roleCounts.admin !== 1 ? 's' : ''},{' '}
            {roleCounts.coordinator} coordinator{roleCounts.coordinator !== 1 ? 's' : ''},{' '}
            {roleCounts.judge} judge{roleCounts.judge !== 1 ? 's' : ''}
          </p>
        </div>
        <AddUserForm />
      </div>

      {sorted.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/60 py-16 text-center">
          <p className="text-slate-400 dark:text-slate-500 text-sm">No users yet. Add the first one above.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/60 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-700/60">
                <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide px-5 py-3">User</th>
                <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide px-4 py-3">Role</th>
                <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide px-4 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide px-4 py-3">Added</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {sorted.map((user) => (
                <tr key={user.email} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      {user.name || <span className="text-slate-400 dark:text-slate-500 italic">No name</span>}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{user.email}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <RoleSelect email={user.email} role={user.role} />
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusToggle email={user.email} status={user.status} />
                  </td>
                  <td className="px-4 py-3.5 text-xs text-slate-400 dark:text-slate-500">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
