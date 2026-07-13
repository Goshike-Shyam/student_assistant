/**
 * ADMIN ACCOUNTS API CONTRACT
 * - Queries admins table ONLY — never parents or children
 * - Requires SUPER_ADMIN role — returns 403 for others
 * - Uses sa-admin-session cookie — never useSession() or next-auth
 * - Returns id as string (BigInt safe for JSON)
 * - invitedByName defaults to 'Seed Script' if inviter is null
 */
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prismaClient';

interface AdminSessionPayload {
  adminId: string;
  role: string;
  name: string;
  email: string;
}

export async function GET(_req: NextRequest) {
  try {
    // Verify admin session cookie
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('sa-admin-session');

    if (!sessionCookie?.value) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let session: AdminSessionPayload;
    try {
      session = JSON.parse(sessionCookie.value) as AdminSessionPayload;
    } catch {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!session?.adminId || !session?.role) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Query admins table — never parents or children
    const admins = await prisma.admin.findMany({
      select: {
        id:        true,
        name:      true,
        email:     true,
        role:      true,
        isActive:  true,
        lastLogin: true,
        createdAt: true,
        inviter: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      admins: admins.map((a) => ({
        id:            a.id.toString(),
        name:          a.name,
        email:         a.email,
        role:          a.role,
        isActive:      a.isActive,
        lastLogin:     a.lastLogin?.toISOString() ?? null,
        createdAt:     a.createdAt.toISOString(),
        invitedByName: a.inviter?.name ?? 'Seed Script',
      })),
    });
  } catch (error) {
    console.error('[GET /api/admin/accounts] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
