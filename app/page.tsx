import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

const ROLE_DASHBOARDS: Record<string, string> = {
  admin: '/admin',
  coordinator: '/coordinator',
  judge: '/judge',
}

export default async function Home() {
  const session = await auth()
  if (session?.user) {
    redirect(ROLE_DASHBOARDS[session.user.role] ?? '/profile')
  }
  redirect('/login')
}
