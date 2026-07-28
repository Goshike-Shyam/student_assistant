import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/admin-auth'

/**
 * ADMIN AUTH CONTRACT
 * ONLY getAdminSession() - reads sa-admin-session
 * NEVER getServerSession() - reads student cookie
 * Cross-tab student login must NOT affect admin
 */

export async function GET() {
  try {
    const adminSession = await getAdminSession()

    if (!adminSession) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      )
    }

    return NextResponse.json(
      {
        authenticated: true,
        admin: {
          id: adminSession.adminId,
          role: adminSession.role,
          name: adminSession.name,
          email: adminSession.email,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      { authenticated: false },
      { status: 401 }
    )
  }
}
