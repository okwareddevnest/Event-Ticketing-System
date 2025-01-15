import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const auth = getAuth(req);
    const userId = auth.userId;

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, role: true },
    });

    if (!user || user.role !== 'ADMIN') {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const data = await req.json();

    if (!data) {
      return new NextResponse('Bad Request - Missing event data', { status: 400 });
    }

    const { title, description, date, venue, price, availableTickets, imageUrl } = data;

    if (!title || !description || !date || !venue || typeof price !== 'number' || typeof availableTickets !== 'number') {
      return new NextResponse('Bad Request - Missing required fields', { status: 400 });
    }

    const event = await prisma.event.create({
      data: {
        title,
        description,
        date: new Date(date),
        venue,
        price,
        availableTickets,
        imageUrl,
        createdById: user.id,
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const events = await prisma.event.findMany({
      orderBy: {
        date: 'asc',
      },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 