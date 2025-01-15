import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Extract the callback data
    const callbackData = data.Body.stkCallback;
    const merchantRequestId = callbackData.MerchantRequestID;
    const checkoutRequestId = callbackData.CheckoutRequestID;
    const resultCode = callbackData.ResultCode;
    const resultDesc = callbackData.ResultDesc;

    // Find the transaction by checkoutRequestId
    const transaction = await prisma.transaction.findFirst({
      where: {
        checkoutRequestId,
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
      const amount = callbackMetadata.find((item: any) => item.Name === 'Amount')?.Value;
      const mpesaReceiptNumber = callbackMetadata.find(
        (item: any) => item.Name === 'MpesaReceiptNumber'
      )?.Value;
      const transactionDate = callbackMetadata.find(
        (item: any) => item.Name === 'TransactionDate'
      )?.Value;

      // Update transaction and ticket status
      await prisma.$transaction([
        prisma.transaction.update({
          where: { id: transaction.id },
          data: {
            status: 'COMPLETED',
            mpesaReceiptNumber,
            completedAt: new Date(),
          },
        }),
        prisma.ticket.update({
          where: { id: transaction.ticketId },
          data: {
            status: 'CONFIRMED',
          },
        }),
      ]);
    } else {
      // Payment failed
      await prisma.$transaction([
        prisma.transaction.update({
          where: { id: transaction.id },
          data: {
            status: 'FAILED',
            failureReason: resultDesc,
          },
        }),
        prisma.ticket.update({
          where: { id: transaction.ticketId },
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