import Link from 'next/link'

export const metadata = {
  title: 'Terms of Service — MEANT JudgeHub',
}

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-50 py-16 px-4">
      <div className="max-w-2xl mx-auto">

        <div className="mb-10">
          <Link href="/login" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
            ← Back to sign in
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-slate-900 mb-2">Terms of Service</h1>
        <p className="text-sm text-slate-500 mb-10">
          Malayalee Engineers&apos; Association of North Texas (MEANT) · Last updated: April 2025
        </p>

        <div className="prose prose-slate max-w-none space-y-8 text-slate-700">

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">1. Acceptance</h2>
            <p className="text-sm leading-relaxed">
              By accessing or using MEANT JudgeHub (&quot;the Platform&quot;), you agree to be bound by
              these Terms of Service. If you do not agree, do not use the Platform. These terms
              apply to all users including Admins, Coordinators, and Judges.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">2. Access and eligibility</h2>
            <p className="text-sm leading-relaxed">
              Access to the Platform is by invitation only. You must be granted an account by a
              MEANT administrator before you can sign in. You are responsible for maintaining the
              security of your Google account used to access the Platform.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">3. Permitted use</h2>
            <p className="text-sm leading-relaxed mb-3">
              The Platform is provided solely for the purpose of facilitating the judging of
              MEANT-organised events and competitions. You agree to use it only for this purpose and
              in accordance with your assigned role:
            </p>
            <ul className="text-sm leading-relaxed space-y-2 list-disc pl-5">
              <li><strong>Judges</strong> must submit scores that reflect their honest, independent evaluation of each participant.</li>
              <li><strong>Coordinators</strong> must manage events and participants fairly and accurately.</li>
              <li><strong>Admins</strong> must manage user accounts and roles responsibly.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">4. Prohibited conduct</h2>
            <p className="text-sm leading-relaxed mb-3">You must not:</p>
            <ul className="text-sm leading-relaxed space-y-2 list-disc pl-5">
              <li>Share your account credentials or allow others to access the Platform on your behalf.</li>
              <li>Submit scores on behalf of another judge.</li>
              <li>Attempt to access parts of the Platform beyond your assigned role.</li>
              <li>Interfere with or disrupt the Platform or its data.</li>
              <li>Use the Platform for any purpose other than MEANT event judging.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">5. Scores and results</h2>
            <p className="text-sm leading-relaxed">
              Scores submitted through the Platform are used to determine event results.
              Once submitted (marked as final), scores may not be modified. MEANT reserves the
              right to review, adjust, or disqualify scores in cases of error, misconduct, or
              conflict of interest, at its sole discretion.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">6. Intellectual property</h2>
            <p className="text-sm leading-relaxed">
              The Platform and its content are owned by MEANT. You may not copy, modify, distribute,
              or reproduce any part of the Platform without prior written permission from MEANT.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">7. Disclaimer of warranties</h2>
            <p className="text-sm leading-relaxed">
              The Platform is provided &quot;as is&quot; without warranties of any kind. MEANT does not
              guarantee that the Platform will be available at all times, free of errors, or secure
              from unauthorised access. Use of the Platform is at your own risk.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">8. Limitation of liability</h2>
            <p className="text-sm leading-relaxed">
              To the fullest extent permitted by law, MEANT shall not be liable for any indirect,
              incidental, or consequential damages arising from your use of or inability to use the
              Platform, including any loss of data.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">9. Changes to these terms</h2>
            <p className="text-sm leading-relaxed">
              MEANT may update these Terms at any time. Continued use of the Platform after changes
              are posted constitutes acceptance of the revised Terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">10. Contact</h2>
            <p className="text-sm leading-relaxed">
              For questions about these Terms, contact MEANT at{' '}
              <a href="https://www.meant.org" className="text-indigo-600 hover:underline" target="_blank" rel="noopener noreferrer">
                www.meant.org
              </a>.
            </p>
          </section>

        </div>

        <div className="mt-12 pt-8 border-t border-slate-200">
          <p className="text-xs text-slate-400 text-center">
            © {new Date().getFullYear()} Malayalee Engineers&apos; Association of North Texas ·{' '}
            <Link href="/privacy" className="hover:text-slate-600 transition-colors">Privacy Policy</Link>
          </p>
        </div>

      </div>
    </main>
  )
}
