import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Transaction from '@/models/Transaction';
import Event from '@/models/Event';

export async function POST(request: Request) {
  try {
    await dbConnect();

    const callbackData = await request.json();
    const { Body: { stkCallback } } = callbackData;

    // Find the transaction
    const transaction = await Transaction.findOne({
      mpesaRequestId: stkCallback.CheckoutRequestID,
    });

    if (!transaction) {
      console.error('Transaction not found:', stkCallback.CheckoutRequestID);
      return NextResponse.json({ 
        success: false,
        message: 'Transaction not found' 
      });
    }

    // Update transaction status based on result
    if (stkCallback.ResultCode === 0) {
      const callbackMetadata = stkCallback.CallbackMetadata.Item;
      const mpesaReceiptNumber = callbackMetadata.find((item: any) => item.Name === 'MpesaReceiptNumber')?.Value;

      // Update transaction
      transaction.status = 'completed';
      transaction.mpesaReceiptNumber = mpesaReceiptNumber;
      transaction.resultCode = stkCallback.ResultCode;
      transaction.resultDesc = stkCallback.ResultDesc;
      transaction.completedAt = new Date();
      await transaction.save();

      // Update event ticket count
      await Event.findByIdAndUpdate(
        transaction.eventId,
        { $inc: { availableTickets: -1 } }
      );

      // Here you could also:
      // 1. Send confirmation email to user
      // 2. Generate and store ticket details
      // 3. Send SMS confirmation
    } else {
      transaction.status = 'failed';
      transaction.resultCode = stkCallback.ResultCode;
      transaction.resultDesc = stkCallback.ResultDesc;
      await transaction.save();
    }

    return NextResponse.json({
      success: true,
      message: 'Callback processed successfully',
    });
  } catch (error) {
    console.error('Callback processing error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process callback' },
      { status: 500 }
    );
  }
} 