'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'

const ROLE_BADGE_STYLES: Record<string, string> = {
  admin: 'bg-red-100 text-red-700',
  coordinator: 'bg-blue-100 text-blue-700',
  judge: 'bg-green-100 text-green-700',
}

export function UserNav() {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)

  if (!session?.user) return null

  const { name, email, image, role } = session.user

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-100 transition-colors"
        aria-expanded={open}
        aria-haspopup="true"
      >
        {image ? (
          <Image
            src={image}
            alt={name ?? 'User avatar'}
            width={32}
            height={32}
            className="rounded-full"
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-600">
            {name?.[0]?.toUpperCase() ?? '?'}
          </div>
        )}
        <span className="text-sm font-medium text-gray-700 hidden sm:block">{name}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-2 w-52 rounded-xl bg-white shadow-lg border border-gray-200 py-1">
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
              <p className="text-xs text-gray-500 truncate">{email}</p>
              <span
                className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize ${ROLE_BADGE_STYLES[role]}`}
              >
                {role}
              </span>
            </div>
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Profile
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  )
}
