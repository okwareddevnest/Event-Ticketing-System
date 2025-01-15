import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getAuth } from '@clerk/nextjs/server';
import { initiateSTKPush } from '../../../../lib/mpesa';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = getAuth(request);
    if (!clerkId) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized'
      }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'User not found'
      }, { status: 404 });
    }

    const { ticketId, phoneNumber, method } = await request.json();

    // Validate input
    if (!ticketId || !phoneNumber || !method) {
      return NextResponse.json({
        success: false,
        message: 'Invalid request data'
      }, { status: 400 });
    }

    // Get the ticket and check if it exists
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        transaction: true,
      },
    });

    if (!ticket) {
      return NextResponse.json({
        success: false,
        message: 'Ticket not found'
      }, { status: 404 });
    }

    if (ticket.userId !== user.id) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized'
      }, { status: 401 });
    }

    if (ticket.transaction?.status === 'COMPLETED') {
      return NextResponse.json({
        success: false,
        message: 'Ticket is already paid for'
      }, { status: 400 });
    }

    // Initialize M-Pesa payment based on method
    if (method === 'stk') {
      try {
        const callbackUrl = `${process.env.BASE_URL}/api/mpesa/callback`;
        // Convert amount to whole number (multiply by 100 if it's in decimal)
        const amount = Math.round(ticket.transaction!.amount);
        
        const stkResponse = await initiateSTKPush(
          phoneNumber,
          amount,
          ticketId,
          callbackUrl
        );
        
        if (!stkResponse || !stkResponse.CheckoutRequestID) {
          return NextResponse.json({
            success: false,
            message: 'Failed to initiate STK push'
          }, { status: 500 });
        }

        // Update transaction with checkout request ID
        await prisma.transaction.update({
          where: { id: ticket.transaction!.id },
          data: {
            checkoutRequestId: stkResponse.CheckoutRequestID,
            merchantRequestId: stkResponse.MerchantRequestID,
            status: 'PENDING'
          }
        });

        return NextResponse.json({
          success: true,
          message: 'STK push initiated',
          checkoutRequestId: stkResponse.CheckoutRequestID
        });
      } catch (error) {
        console.error('STK push error:', error instanceof Error ? error.message : 'Unknown error');
        return NextResponse.json({
          success: false,
          message: 'Failed to initiate M-Pesa payment. Please try again.',
          error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
      }
    } else if (method === 'c2b') {
      // Return paybill details for manual payment
      return NextResponse.json({
        success: true,
        paybill: process.env.BUSINESS_SHORTCODE,
        accountNumber: ticketId,
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Invalid payment method'
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Error processing payment:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({
      success: false,
      message: 'Internal Server Error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 