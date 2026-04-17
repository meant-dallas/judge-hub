'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import Image from 'next/image'
import ThemeToggle from '@/components/admin/ThemeToggle'

interface SidebarUser {
  name?: string | null
  email?: string | null
  image?: string | null
}

const NAV = [
  {
    href: '/coordinator',
    label: 'Dashboard',
    exact: true,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/>
        <rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
  {
    href: '/coordinator/events',
    label: 'Events',
    exact: false,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
  },
]

export default function CoordinatorSidebar({ user }: { user: SidebarUser }) {
  const pathname = usePathname()

  function isActive(href: string, exact: boolean) {
    return exact ? pathname === href : pathname.startsWith(href)
  }

  return (
    <aside className="w-60 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700/60 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-slate-100 dark:border-slate-700/60">
        <Image src="/logo.png" alt="MEANT JudgeHub" width={32} height={32} className="rounded-lg" />
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-tight">JudgeHub</p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight">Coordinator</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(({ href, label, icon, exact }) => {
          const active = isActive(href, exact)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <span className={active ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}>{icon}</span>
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-3 border-t border-slate-100 dark:border-slate-700/60 space-y-1">
        <ThemeToggle />
        <div className="flex items-center gap-3 px-3 py-2">
          {user.image ? (
            <Image src={user.image} alt={user.name ?? ''} width={28} height={28} className="rounded-full shrink-0" />
          ) : (
            <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-xs font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
              {user.name?.[0]?.toUpperCase() ?? '?'}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-slate-900 dark:text-slate-100 truncate">{user.name}</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{user.email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg px-3 py-1.5 text-left transition-colors"
        >
          Sign out
        </button>
      </div>
    </aside>
  )
}
