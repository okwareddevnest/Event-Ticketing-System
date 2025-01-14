import { NextResponse, NextRequest } from 'next/server';
import { getAuth } from "@clerk/nextjs/server";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { userId } = getAuth(request);
    
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!dbUser || dbUser.role !== 'ADMIN') {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const data = await request.json();
    const event = await prisma.event.create({
      data: {
        ...data,
        createdById: userId,
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
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