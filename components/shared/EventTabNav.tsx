'use client'

import Link from 'next/link'

const TABS = [
  { key: 'participants', label: 'Participants' },
  { key: 'criteria', label: 'Criteria' },
  { key: 'judges', label: 'Judges' },
] as const

type TabKey = (typeof TABS)[number]['key']

export default function EventTabNav({
  basePath,
  activeTab,
}: {
  basePath: string
  activeTab: string
}) {
  const active = (TABS.find((t) => t.key === activeTab)?.key ?? 'participants') as TabKey

  return (
    <div className="flex gap-1 border-b border-slate-200 dark:border-slate-700/60">
      {TABS.map((tab) => {
        const isActive = tab.key === active
        const href = tab.key === 'participants' ? basePath : `${basePath}?tab=${tab.key}`
        return (
          <Link
            key={tab.key}
            href={href}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              isActive
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
          >
            {tab.label}
          </Link>
        )
      })}
    </div>
  )
}
