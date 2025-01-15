import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return NextResponse.json({ role: 'GUEST' });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true, name: true }
    });

    if (!user) {
      return NextResponse.json({ role: 'GUEST' });
    }

    // Double-check admin status based on username pattern
    const isAdmin = user.name?.startsWith('plp_Admin-');
    if (isAdmin && user.role !== 'ADMIN') {
      // Update to admin if username matches pattern but role isn't set
      await prisma.user.update({
        where: { clerkId: userId },
        data: { role: 'ADMIN' }
      });
      return NextResponse.json({ role: 'ADMIN' });
    }

    return NextResponse.json({ role: user.role });
  } catch (error) {
    console.error('Error getting user role:', error);
    return NextResponse.json({ role: 'GUEST' }, { status: 500 });
  }
} 