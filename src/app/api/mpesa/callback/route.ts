import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    if (!data || !data.Body || !data.Body.stkCallback) {
      return new NextResponse('Invalid callback data', { status: 400 });
    }
    
    // Extract the callback data
    const callbackData = data.Body.stkCallback;
    const merchantRequestId = callbackData.MerchantRequestID;
    const checkoutRequestId = callbackData.CheckoutRequestID;
    const resultCode = callbackData.ResultCode;
    const resultDesc = callbackData.ResultDesc;

    console.log('M-Pesa callback data:', {
      merchantRequestId,
      checkoutRequestId,
      resultCode,
      resultDesc
    });

    // Find the transaction by merchantRequestId and checkoutRequestId
    const transaction = await prisma.transaction.findFirst({
      where: {
        AND: [
          { merchantRequestId },
          { checkoutRequestId }
        ]
      },
      include: {
        ticket: true,
      },
    });

    if (!transaction) {
      console.error('Transaction not found for checkout request:', checkoutRequestId);
      return new NextResponse('Transaction not found', { status: 404 });
    }

    if (resultCode === 0) {
      // Payment successful
      const callbackMetadata = callbackData.CallbackMetadata.Item;
      const mpesaReceiptNumber = callbackMetadata.find(
        (item: any) => item.Name === 'MpesaReceiptNumber'
      )?.Value;

      console.log('Updating transaction with receipt:', mpesaReceiptNumber);

      // Update transaction and ticket status
      await prisma.$transaction([
        prisma.transaction.update({
          where: { id: transaction.id },
          data: {
            status: 'COMPLETED',
            mpesaReceiptNumber,
          },
        }),
        prisma.ticket.update({
          where: { id: transaction.ticket.id },
          data: {
            status: 'CONFIRMED',
          },
        }),
      ]);

      console.log('Transaction and ticket updated successfully');
    } else {
      // Payment failed
      console.log('Payment failed:', resultDesc);
      
      await prisma.$transaction([
        prisma.transaction.update({
          where: { id: transaction.id },
          data: {
            status: 'FAILED',
          },
        }),
        prisma.ticket.update({
          where: { id: transaction.ticket.id },
          data: {
            status: 'CANCELLED',
          },
        }),
        // Restore available tickets
        prisma.event.update({
          where: { id: transaction.ticket.eventId },
          data: {
            availableTickets: {
              increment: transaction.ticket.quantity,
            },
          },
        }),
      ]);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing M-Pesa callback:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 