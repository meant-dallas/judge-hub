import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy — MEANT JudgeHub',
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-50 py-16 px-4">
      <div className="max-w-2xl mx-auto">

        <div className="mb-10">
          <Link href="/login" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
            ← Back to sign in
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-slate-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-slate-500 mb-10">
          Malayalee Engineers&apos; Association of North Texas (MEANT) · Last updated: April 2025
        </p>

        <div className="prose prose-slate max-w-none space-y-8 text-slate-700">

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">1. About this policy</h2>
            <p className="text-sm leading-relaxed">
              This Privacy Policy describes how MEANT JudgeHub (&quot;the Platform&quot;), operated by the
              Malayalee Engineers&apos; Association of North Texas (&quot;MEANT&quot;, &quot;we&quot;, &quot;us&quot;), collects,
              uses, and stores information when you access the Platform. By signing in, you agree to
              the practices described here.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">2. Information we collect</h2>
            <p className="text-sm leading-relaxed mb-3">
              We collect only the minimum information needed to operate the judging platform.
              When you sign in with Google, we receive and store:
            </p>
            <ul className="text-sm leading-relaxed space-y-2 list-disc pl-5">
              <li><strong>Email address</strong> — used to identify your account and determine your role (Admin, Coordinator, or Judge).</li>
              <li><strong>Display name</strong> — shown to other users in the platform (e.g. in judge assignment lists).</li>
            </ul>
            <p className="text-sm leading-relaxed mt-3">
              Your <strong>Google profile photo</strong> is fetched directly from Google and displayed
              in the platform interface (e.g. in the navigation sidebar). It is <strong>not stored</strong> in
              our database — it is loaded from Google&apos;s servers on each page view using the URL
              provided by your Google account.
            </p>
            <p className="text-sm leading-relaxed mt-3">
              We do not collect passwords, phone numbers, location data, or any information beyond
              what is listed above.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">3. How we use your information</h2>
            <ul className="text-sm leading-relaxed space-y-2 list-disc pl-5">
              <li>Authenticating your identity and maintaining your session.</li>
              <li>Assigning and displaying your role within the platform.</li>
              <li>Associating judging scores and event assignments with your account.</li>
              <li>Displaying your name to administrators and coordinators in the context of event management.</li>
            </ul>
            <p className="text-sm leading-relaxed mt-3">
              We do not use your information for marketing, advertising, or any purpose outside
              the operation of the judging platform.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">4. Data storage</h2>
            <p className="text-sm leading-relaxed">
              Your email, name, role, and judging activity (scores, event assignments) are stored
              in a hosted PostgreSQL database (Neon) located in the United States. Data is
              transmitted over HTTPS. We do not sell, share, or transfer your data to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">5. Data retention</h2>
            <p className="text-sm leading-relaxed">
              Your account information is retained for as long as you have an active account on
              the Platform. If you wish to have your data removed, contact us at the address below
              and we will delete your account and associated records within a reasonable timeframe.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">6. Third-party services</h2>
            <p className="text-sm leading-relaxed">
              The Platform uses the following third-party services:
            </p>
            <ul className="text-sm leading-relaxed space-y-2 list-disc pl-5 mt-3">
              <li><strong>Google OAuth</strong> — for authentication. Google&apos;s privacy policy applies to data processed by Google during sign-in.</li>
              <li><strong>Vercel</strong> — for hosting the application.</li>
              <li><strong>Neon</strong> — for database hosting.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">7. Contact</h2>
            <p className="text-sm leading-relaxed">
              For questions or requests regarding your data, contact MEANT at{' '}
              <a href="https://www.meant.org" className="text-indigo-600 hover:underline" target="_blank" rel="noopener noreferrer">
                www.meant.org
              </a>.
            </p>
          </section>

        </div>

        <div className="mt-12 pt-8 border-t border-slate-200">
          <p className="text-xs text-slate-400 text-center">
            © {new Date().getFullYear()} Malayalee Engineers&apos; Association of North Texas ·{' '}
            <Link href="/terms" className="hover:text-slate-600 transition-colors">Terms of Service</Link>
          </p>
        </div>

      </div>
    </main>
  )
}
