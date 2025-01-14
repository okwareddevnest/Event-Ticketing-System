import { NextResponse } from 'next/server';
import axios from 'axios';
import dbConnect from '@/lib/db';
import Transaction from '@/models/Transaction';
import Event from '@/models/Event';

// Helper function to get the access token
async function getAccessToken() {
  const consumerKey = process.env.MPESA_CONSUMER_KEY;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

  try {
    const response = await axios.get(
      'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    );

    return response.data.access_token;
  } catch (error) {
    console.error('Error getting access token:', error);
    throw new Error('Failed to get access token');
  }
}

// Helper function to generate the password
function generatePassword() {
  const shortcode = process.env.BUSINESS_SHORTCODE;
  const passkey = process.env.MPESA_PASSKEY;
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
  const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');
  
  return { password, timestamp };
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    
    const { phoneNumber, amount, eventId } = await request.json();

    // Input validation
    if (!phoneNumber || !amount || !eventId) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get access token
    const accessToken = await getAccessToken();
    const { password, timestamp } = generatePassword();

    // Prepare STK push request
    const stkPushUrl = 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';
    const requestData = {
      BusinessShortCode: process.env.BUSINESS_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount,
      PartyA: phoneNumber,
      PartyB: process.env.BUSINESS_SHORTCODE,
      PhoneNumber: phoneNumber,
      CallBackURL: `${process.env.BASE_URL}/api/mpesa/callback`,
      AccountReference: `Event-${eventId}`,
      TransactionDesc: 'Event Ticket Purchase',
    };

    // Make STK push request
    const response = await axios.post(stkPushUrl, requestData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    // Store transaction details
    const transaction = await Transaction.create({
      eventId,
      phoneNumber,
      amount,
      mpesaRequestId: response.data.CheckoutRequestID,
      status: 'pending',
    });

    return NextResponse.json({
      success: true,
      message: 'STK push initiated successfully',
      data: {
        ...response.data,
        transactionId: transaction._id,
      },
    });
  } catch (error: any) {
    console.error('STK push error:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: error.response?.data?.errorMessage || 'Failed to initiate payment',
      },
      { status: 500 }
    );
  }
} 