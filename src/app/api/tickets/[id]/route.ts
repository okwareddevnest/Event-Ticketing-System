import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getAuth } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId: clerkId } = getAuth(request);
    if (!clerkId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id: params.id },
      include: {
        event: true,
        transaction: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!ticket) {
      return new NextResponse('Ticket not found', { status: 404 });
    }

    if (ticket.userId !== user.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    return NextResponse.json(ticket);
  } catch (error) {
    console.error('Error fetching ticket:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 