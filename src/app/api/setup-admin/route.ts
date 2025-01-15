import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getAuth } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    const { userId: clerkId } = getAuth(request);
    
    if (email !== 'softengdedan@gmail.com') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Try to find user by email or clerkId
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { clerkId: clerkId || undefined }
        ]
      }
    });

    if (!user) {
      // Create new user if not found
      user = await prisma.user.create({
        data: {
          email,
          name: 'Okware',
          password: '',
          role: 'ADMIN',
          clerkId: clerkId || 'pending'
        }
      });
      console.log('Created new admin user:', user);
    } else {
      // Update existing user to admin
      user = await prisma.user.update({
        where: { id: user.id },
        data: { 
          role: 'ADMIN',
          clerkId: clerkId || user.clerkId // Update clerkId if available
        }
      });
      console.log('Updated user to admin:', user);
    }

    return NextResponse.json({
      message: 'Admin setup complete',
      user
    });
  } catch (error) {
    console.error('Error setting up admin:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 