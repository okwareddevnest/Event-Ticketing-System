import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { Webhook } from 'svix';

export async function POST(req: Request) {
  try {
    // Get the headers
    const headersList = headers();
    const svix_id = headersList.get("svix-id");
    const svix_timestamp = headersList.get("svix-timestamp");
    const svix_signature = headersList.get("svix-signature");

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
      return new Response('Error occurred -- no svix headers', {
        status: 400
      });
    }

    // Get the body
    const payload = await req.json();
    const body = JSON.stringify(payload);

    // Create a new Svix instance with your webhook secret
    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '');

    let evt: WebhookEvent;

    // Verify the payload with the headers
    try {
      evt = wh.verify(body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      }) as WebhookEvent;
    } catch (err) {
      console.error('Error verifying webhook:', err);
      return new Response('Error occurred', {
        status: 400
      });
    }

    const eventType = evt.type;
    console.log('Webhook event type:', eventType);

    if (eventType === 'user.created' || eventType === 'user.updated') {
      const { id, email_addresses, username } = evt.data;
      const email = email_addresses?.[0]?.email_address || '';
      const name = username || '';

      // Check if the username starts with "plp_admin-" (case sensitive)
      const isAdmin = name.startsWith('plp_admin-');
      const role = isAdmin ? 'ADMIN' : 'USER';

      console.log('Processing user:', {
        clerkId: id,
        email,
        name,
        role
      });

      try {
        const user = await prisma.user.upsert({
          where: { clerkId: id },
          update: {
            email,
            name,
            role // Update role based on username pattern
          },
          create: {
            email,
            name,
            clerkId: id,
            role, // Set initial role based on username pattern
            password: '' // Empty password since we're using Clerk for auth
          }
        });

        console.log('Updated user:', user);
        return new Response('User updated successfully', { status: 200 });
      } catch (error) {
        console.error('Error updating user:', error);
        return new Response('Error updating user', { status: 500 });
      }
    }

    return new Response('Webhook processed', { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response('Webhook error', { status: 500 });
  }
} 