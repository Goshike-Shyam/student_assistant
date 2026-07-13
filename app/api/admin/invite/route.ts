import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prismaClient'
import { generateInviteToken, hashToken } from '@/lib/admin-auth'
import { AdminRole } from '@prisma/client'

/**
 * Get admin from session cookie
 */
function getAdminFromCookie(request: NextRequest) {
  const sessionCookie = request.cookies.get('sa-admin-session')
  if (!sessionCookie?.value) {
    return null
  }

  try {
    return JSON.parse(sessionCookie.value)
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check admin session
    const admin = getAdminFromCookie(request)
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Only SUPER_ADMIN can invite
    if (admin.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Only Super Admin can invite new admins' },
        { status: 403 }
      )
    }

    const { email, role } = await request.json()

    if (!email || !role) {
      return NextResponse.json(
        { error: 'Email and role are required' },
        { status: 400 }
      )
    }

    // Validate role
    const validRoles: AdminRole[] = ['CONTENT_MOD', 'SUPPORT', 'FINANCE']
    if (!validRoles.includes(role as AdminRole)) {
      return NextResponse.json(
        { error: 'Invalid role. Cannot invite to SUPER_ADMIN role.' },
        { status: 400 }
      )
    }

    // Check if email already exists in admins table
    const existingAdmin = await prisma.admin.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existingAdmin) {
      return NextResponse.json(
        { error: 'An admin account with this email already exists' },
        { status: 400 }
      )
    }

    // Generate and hash invite token
    const rawToken = generateInviteToken()
    const tokenHash = hashToken(rawToken)

    // Expire in 48 hours
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000)

    // Create invite
    const invite = await prisma.adminInvite.create({
      data: {
        email: email.toLowerCase(),
        role: role as AdminRole,
        tokenHash,
        invitedBy: BigInt(admin.adminId),
        expiresAt,
      },
    })

    console.log(`[Admin Invite] Created invite for ${email} by ${admin.email}`)

    // In production, send email here
    // For now, we'll return the raw token (in production, send via email only)
    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/accept-invite?token=${rawToken}`

    return NextResponse.json(
      {
        message: 'Invite sent',
        email,
        role,
        inviteLink, // In production, this would only be in the email
        expiresAt,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[POST /api/admin/invite] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
