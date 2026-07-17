import { NextResponse } from 'next/server'
import { deleteTeacherSession } from '@/lib/teacher-auth'

export async function POST() {
  await deleteTeacherSession()
  return NextResponse.json({ ok: true })
}
