import { Suspense } from 'react'
import { AcceptInviteForm } from './accept-invite-form'

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f8f9ff] to-[#e5eeff]">
      <div className="text-center">
        <div className="animate-spin w-12 h-12 border-4 border-[#e5eeff] border-t-[#0058be] rounded-full mx-auto mb-4"></div>
        <p className="text-[#6d7b6c] font-semibold">Loading invite...</p>
      </div>
    </div>
  )
}

type SearchParams = Promise<{ token?: string }>

export default async function AcceptInvitePage(props: {
  searchParams: SearchParams
}) {
  const searchParams = await props.searchParams
  const token = searchParams?.token

  return (
    <Suspense fallback={<LoadingFallback />}>
      <AcceptInviteForm token={token} />
    </Suspense>
  )
}
