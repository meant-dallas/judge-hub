import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import CoordinatorSidebar from '@/components/coordinator/CoordinatorSidebar'

export default async function CoordinatorLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user || !['admin', 'coordinator'].includes(session.user.role)) {
    redirect('/unauthorized')
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      <CoordinatorSidebar user={session.user} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
