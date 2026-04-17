import Link from 'next/link'
import { getAllEvents } from '@/lib/db/events'
import { getAllParticipants } from '@/lib/db/participants'
import CreateEventForm from '@/components/admin/CreateEventForm'
import EventStatusSelect from '@/components/admin/EventStatusSelect'

export default async function EventsPage() {
  const [events, participants] = await Promise.all([getAllEvents(), getAllParticipants()])

  const sorted = [...events].sort((a, b) => b.date.localeCompare(a.date))
  const countMap = new Map<string, number>()
  for (const p of participants) {
    countMap.set(p.event_id, (countMap.get(p.event_id) ?? 0) + 1)
  }

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Events</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{events.length} event{events.length !== 1 ? 's' : ''} total</p>
        </div>
        <CreateEventForm />
      </div>

      {sorted.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/60 py-16 text-center">
          <p className="text-slate-400 dark:text-slate-500 text-sm">No events yet. Create your first event above.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/60 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-700/60">
                <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide px-5 py-3">Event</th>
                <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide px-4 py-3">Date</th>
                <th className="text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide px-4 py-3">Participants</th>
                <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide px-4 py-3">Status</th>
                <th className="px-4 py-3"/>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {sorted.map((event) => {
                const count = countMap.get(event.event_id) ?? 0
                return (
                  <tr key={event.event_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-900 dark:text-slate-100">{event.name}</p>
                      {event.description && (
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 line-clamp-1">{event.description}</p>
                      )}
                    </td>
                    <td className="px-4 py-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">{event.date}</td>
                    <td className="px-4 py-4 text-center">
                      <span className="text-slate-700 dark:text-slate-300 font-medium">{count}</span>
                    </td>
                    <td className="px-4 py-4">
                      <EventStatusSelect eventId={event.event_id} status={event.status} />
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Link
                        href={`/admin/events/${event.event_id}`}
                        className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium"
                      >
                        Manage →
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
