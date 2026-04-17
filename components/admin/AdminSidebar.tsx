'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import Image from 'next/image'

interface SidebarUser {
  name?: string | null
  email?: string | null
  image?: string | null
}

const NAV = [
  {
    href: '/admin',
    label: 'Dashboard',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/>
        <rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
    exact: true,
  },
  {
    href: '/admin/events',
    label: 'Events',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
    exact: false,
  },
  {
    href: '/admin/users',
    label: 'Users',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    exact: false,
  },
]

export default function AdminSidebar({ user }: { user: SidebarUser }) {
  const pathname = usePathname()

  function isActive(href: string, exact: boolean) {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <aside className="w-60 flex flex-col bg-white border-r border-slate-200 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-slate-100">
        <Image src="/logo.png" alt="MEANT JudgeHub" width={32} height={32} className="rounded-lg" />
        <div>
          <p className="text-sm font-semibold text-slate-900 leading-tight">JudgeHub</p>
          <p className="text-[10px] text-slate-400 leading-tight">Admin Panel</p>
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
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span className={active ? 'text-indigo-600' : 'text-slate-400'}>{icon}</span>
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-slate-100">
        <div className="flex items-center gap-3 mb-3">
          {user.image ? (
            <Image src={user.image} alt={user.name ?? ''} width={32} height={32} className="rounded-full" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">
              {user.name?.[0]?.toUpperCase() ?? '?'}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-900 truncate">{user.name}</p>
            <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg px-3 py-1.5 text-left transition-colors"
        >
          Sign out
        </button>
      </div>
    </aside>
  )
}
