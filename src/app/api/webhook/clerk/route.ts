import { NextResponse, NextRequest } from 'next/server';
import { Webhook } from 'svix';
import { WebhookEvent } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env.local');
  }

  // Get the headers
  const headerPayload = request.headers;
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new NextResponse('Error occured -- no svix headers', {
      status: 400,
    });
  }

  // Get the body
  const payload = await request.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new NextResponse('Error occured', {
      status: 400,
    });
  }

  const eventType = evt.type;
  console.log('Webhook event type:', eventType);

  if (eventType === 'user.created' || eventType === 'user.updated') {
    const { id: clerkId, email_addresses, first_name, last_name } = evt.data;
    const email = email_addresses[0]?.email_address;
    const name = [first_name, last_name].filter(Boolean).join(' ');

    console.log('Processing user:', { clerkId, email, name });

    try {
      // First try to find by clerkId
      let user = await prisma.user.findUnique({
        where: { clerkId }
      });

      // If not found by clerkId, try by email
      if (!user && email) {
        user = await prisma.user.findUnique({
          where: { email }
        });
      }

      if (user) {
        // Update existing user
        const updatedUser = await prisma.user.update({
          where: { id: user.id },
          data: {
            name,
            clerkId,
            email: email || user.email
          }
        });
        console.log('Updated user:', updatedUser);
      } else {
        // Create new user
        const newUser = await prisma.user.create({
          data: {
            email: email!,
            name,
            clerkId,
            password: '', // We don't need password as we're using Clerk
            role: 'USER', // Default role
          }
        });
        console.log('Created new user:', newUser);
      }

      return NextResponse.json({ message: 'User synchronized' });
    } catch (error) {
      console.error('Error syncing user:', error);
      return new NextResponse('Error syncing user', { status: 500 });
    }
  }

  return NextResponse.json({ message: 'Webhook received' });
} 