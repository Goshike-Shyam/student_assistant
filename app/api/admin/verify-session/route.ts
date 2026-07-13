import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('sa-admin-session')

    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      )
    }

    // Session cookie exists and is valid
    return NextResponse.json(
      { authenticated: true },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      { authenticated: false },
      { status: 401 }
    )
  }
}
