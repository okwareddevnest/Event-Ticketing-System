import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getAuth } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = getAuth(request);
    if (!clerkId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Find the user in our database using clerkId
    const user = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    const { eventId, quantity } = await request.json();

    // Validate input
    if (!eventId || !quantity || quantity < 1) {
      return new NextResponse('Invalid request data', { status: 400 });
    }

    // Get the event and check availability
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return new NextResponse('Event not found', { status: 404 });
    }

    if (event.availableTickets < quantity) {
      return new NextResponse('Not enough tickets available', { status: 400 });
    }

    // Start a transaction to ensure data consistency
    const [ticket, updatedEvent] = await prisma.$transaction([
      // Create the ticket
      prisma.ticket.create({
        data: {
          eventId,
          userId: user.id, // Use our database user ID
          quantity,
          status: 'PENDING',
          transaction: {
            create: {
              amount: event.price * quantity,
              status: 'PENDING',
            },
          },
        },
        include: {
          event: true,
          transaction: true,
        },
      }),
      // Update available tickets
      prisma.event.update({
        where: { id: eventId },
        data: {
          availableTickets: event.availableTickets - quantity,
        },
      }),
    ]);

    return NextResponse.json(ticket);
  } catch (error) {
    console.error('Error creating ticket:', error);
    return new NextResponse(error instanceof Error ? error.message : 'Internal Server Error', { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkId } = getAuth(request);
    if (!clerkId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Find the user in our database using clerkId
    const user = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    const tickets = await prisma.ticket.findMany({
      where: {
        userId: user.id, // Use our database user ID
      },
      include: {
        event: true,
        transaction: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(tickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return new NextResponse(error instanceof Error ? error.message : 'Internal Server Error', { status: 500 });
  }
} 