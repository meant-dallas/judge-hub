import { auth } from '@/lib/auth'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { SignOutButton } from '@/components/auth/SignOutButton'

const ROLE_BADGE_STYLES: Record<string, string> = {
  admin: 'bg-red-100 text-red-700',
  coordinator: 'bg-blue-100 text-blue-700',
  judge: 'bg-green-100 text-green-700',
}

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user) notFound()

  const { name, email, image, role } = session.user

  return (
    <main className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="mx-auto max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8 flex flex-col items-center gap-6">
        {image ? (
          <Image
            src={image}
            alt={name ?? 'User avatar'}
            width={80}
            height={80}
            className="rounded-full"
          />
        ) : (
          <div className="h-20 w-20 rounded-full bg-indigo-100 flex items-center justify-center text-2xl font-bold text-indigo-600">
            {name?.[0]?.toUpperCase() ?? '?'}
          </div>
        )}

        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-900">{name}</h1>
          <p className="text-sm text-gray-500">{email}</p>
          <span
            className={`mt-2 inline-block rounded-full px-3 py-0.5 text-xs font-medium capitalize ${ROLE_BADGE_STYLES[role]}`}
          >
            {role}
          </span>
        </div>

        <SignOutButton />
      </div>
    </main>
  )
}
