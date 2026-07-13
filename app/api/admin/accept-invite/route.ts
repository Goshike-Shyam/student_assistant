import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prismaClient'
import { hashToken, validatePasswordStrength, hashPassword } from '@/lib/admin-auth'

async function validateInviteToken(token: string) {
  const tokenHash = hashToken(token)
  const now = new Date()

  const invite = await prisma.adminInvite.findFirst({
    where: {
      tokenHash,
      isUsed: false,
      expiresAt: { gt: now },
    },
    include: {
      inviter: {
        select: { name: true },
      },
    },
  })

  return invite
}

// GET: Validate token and return invite info (for form pre-filling)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Invite token is required' },
        { status: 400 }
      )
    }

    const invite = await validateInviteToken(token)

    if (!invite) {
      return NextResponse.json(
        { error: 'Invite link is invalid or has expired. Please request a new invite.' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        email: invite.email,
        role: invite.role,
        inviterName: invite.inviter.name,
        expiresAt: invite.expiresAt,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[GET /api/admin/accept-invite] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST: Accept invite and create admin account
export async function POST(request: NextRequest) {
  try {
    const { token, name, password } = await request.json()

    if (!token || !name || !password) {
      return NextResponse.json(
        { error: 'Token, name, and password are required' },
        { status: 400 }
      )
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password)
    if (!passwordValidation.valid) {
      return NextResponse.json(
        {
          error: 'Password does not meet requirements',
          details: passwordValidation.errors,
        },
        { status: 400 }
      )
    }

    // Validate and find invite
    const invite = await validateInviteToken(token)

    if (!invite) {
      // Generic message to not reveal token validity
      return NextResponse.json(
        { error: 'Unable to accept invite. Please request a new link.' },
        { status: 400 }
      )
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Create admin and mark invite as used in a transaction
    const admin = await prisma.$transaction(async (tx) => {
      const newAdmin = await tx.admin.create({
        data: {
          name,
          email: invite.email,
          passwordHash,
          role: invite.role,
          isActive: true,
          invitedBy: invite.invitedBy,
        },
      })

      // Mark invite as used
      await tx.adminInvite.update({
        where: { id: invite.id },
        data: {
          isUsed: true,
          usedAt: new Date(),
        },
      })

      return newAdmin
    })

    console.log(`[Admin Invite] Accepted invite for ${admin.email} (id: ${admin.id})`)

    // Create session cookie for auto-login
    const sessionData = JSON.stringify({
      adminId: admin.id.toString(),
      role: admin.role,
      name: admin.name,
      email: admin.email,
    })

    const response = NextResponse.json(
      {
        message: 'Account created successfully',
        admin: {
          id: admin.id.toString(),
          name: admin.name,
          email: admin.email,
          role: admin.role,
        },
      },
      { status: 201 }
    )

    // Set secure admin session cookie
    response.cookies.set('sa-admin-session', sessionData, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/',
    })

    return response
  } catch (error) {
    console.error('[POST /api/admin/accept-invite] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
