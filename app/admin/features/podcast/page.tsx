import { getAdminSession } from '@/lib/admin-auth'
import { redirect } from 'next/navigation'
import { PodcastAccessManager } from '@/components/admin/PodcastAccessManager'

export default async function PodcastFeaturePage() {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Podcast Feature Access
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Manually enable or disable podcast generation for individual students and teachers. This is a premium feature.
        </p>
      </div>
      <PodcastAccessManager />
    </div>
  )
}
