import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getAuth } from '@clerk/nextjs/server';
import { initiateSTKPush } from '../../../../lib/mpesa';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
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

    const { ticketId, phoneNumber, method } = await request.json();

    // Validate input
    if (!ticketId || !phoneNumber || !method) {
      return new NextResponse('Invalid request data', { status: 400 });
    }

    // Get the ticket and check if it exists
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        transaction: true,
      },
    });

    if (!ticket) {
      return new NextResponse('Ticket not found', { status: 404 });
    }

    if (ticket.userId !== user.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    if (ticket.transaction?.status === 'COMPLETED') {
      return new NextResponse('Ticket is already paid for', { status: 400 });
    }

    // Initialize M-Pesa payment based on method
    if (method === 'stk') {
      try {
        const callbackUrl = `${process.env.BASE_URL}/api/mpesa/callback`;
        const stkResponse = await initiateSTKPush(
          phoneNumber,
          ticket.transaction!.amount,
          ticketId,
          callbackUrl
        );

        // Update transaction with checkout request ID
        await prisma.transaction.update({
          where: { id: ticket.transaction!.id },
          data: {
            checkoutRequestId: stkResponse.CheckoutRequestID,
            merchantRequestId: stkResponse.MerchantRequestID,
          },
        });

        return NextResponse.json({
          message: 'STK push initiated',
          checkoutRequestId: stkResponse.CheckoutRequestID,
        });
      } catch (error) {
        console.error('STK push error:', error);
        return new NextResponse(
          'Failed to initiate M-Pesa payment. Please try again.',
          { status: 500 }
        );
      }
    } else if (method === 'c2b') {
      // Return paybill details for manual payment
      return NextResponse.json({
        paybill: process.env.BUSINESS_SHORTCODE,
        accountNumber: ticketId,
      });
    } else {
      return new NextResponse('Invalid payment method', { status: 400 });
    }
  } catch (error) {
    console.error('Error processing payment:', error);
    return new NextResponse(
      error instanceof Error ? error.message : 'Internal Server Error',
      { status: 500 }
    );
  }
} 