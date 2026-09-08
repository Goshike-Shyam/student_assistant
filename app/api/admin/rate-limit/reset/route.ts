import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/admin-auth'
import { resetRateLimit } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { childId, feature } = await req.json()

  if (!childId || !feature) {
    return NextResponse.json({ error: 'childId and feature required' }, { status: 400 })
  }

  if (!['RESEARCH', 'PODCAST'].includes(feature)) {
    return NextResponse.json({ error: 'Invalid feature' }, { status: 400 })
  }

  await resetRateLimit(feature, childId)

  console.log(`[Admin] Rate limit reset: ${feature} for child ${childId} by admin ${session.adminId}`)

  return NextResponse.json({ ok: true, message: `${feature} rate limit reset for child ${childId}` })
}
