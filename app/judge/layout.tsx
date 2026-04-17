import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import JudgeSidebar from '@/components/judge/JudgeSidebar'

export default async function JudgeLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect('/login')
  // All roles can access /judge — judges see their assignments, others redirected by proxy

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      <JudgeSidebar user={session.user} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
