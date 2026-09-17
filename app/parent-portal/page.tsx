import { redirect } from 'next/navigation'

export default function ParentPortalRedirectPage() {
  redirect('/parent/dashboard')
}
