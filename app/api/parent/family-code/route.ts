import { NextResponse } from 'next/server'
import { getParentSession } from '@/lib/parent-auth'
import { getFamilyCode } from '@/lib/family-code'

export async function GET() {
  const session = await getParentSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const code = await getFamilyCode(session.parentId)
  return NextResponse.json({ code })
}
