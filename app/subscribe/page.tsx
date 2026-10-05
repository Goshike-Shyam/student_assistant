import Link from 'next/link'

type SubscribePageProps = {
  searchParams?: Promise<{ role?: string }>
}

export default async function SubscribePage({ searchParams }: SubscribePageProps) {
  const params = (await searchParams) ?? {}
  const role = typeof params.role === 'string' ? params.role.toLowerCase() : 'student'
  const roleLabel = role === 'parent' ? 'Parent' : role === 'teacher' ? 'Teacher' : 'Student'

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-white px-4 py-10 text-amber-950">
      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">Subscription</p>
          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">Continue Your {roleLabel} Journey</h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-amber-900/80 sm:text-base">
            Your free trial has ended. Subscribe now to restore full access to your learning tools,
            dashboards, and role-specific workflows.
          </p>
        </div>

        <div className="rounded-3xl border border-amber-200 bg-white p-6 shadow-[0_20px_60px_rgba(120,53,15,0.16)] sm:p-8">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">Premium Plan</h2>
              <p className="mt-1 text-sm text-amber-800/80">Best for active students, engaged parents, and dedicated teachers.</p>
            </div>
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">Most Popular</span>
          </div>

          <div className="mb-6">
            <p className="text-4xl font-black text-amber-900">
              $9.99
              <span className="ml-1 text-base font-semibold text-amber-700">/ month</span>
            </p>
          </div>

          <ul className="space-y-3 text-sm text-amber-950">
            <li>• Unlimited AI tutoring and concept explanations</li>
            <li>• Full access to assignments, practice, and progress dashboards</li>
            <li>• Parent and teacher workflow support with activity insights</li>
            <li>• Priority support and faster feature access</li>
          </ul>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-xl bg-amber-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-amber-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700"
            >
              Proceed to Payment
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-xl border border-amber-300 px-6 py-3 text-sm font-semibold text-amber-900 transition hover:bg-amber-100"
            >
              Back to Home
            </Link>
          </div>

          <p className="mt-4 text-xs text-amber-700/90">
            Note: Payment processing integration can be wired into this button in the next step.
          </p>
        </div>
      </div>
    </main>
  )
}
