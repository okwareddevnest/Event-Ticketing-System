import { NextResponse } from 'next/server';
import axios from 'axios';

// Helper function to get access token (reusing from stkpush)
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

// Register C2B URLs
export async function POST(request: Request) {
  try {
    const accessToken = await getAccessToken();
    
    const registerUrl = 'https://sandbox.safaricom.co.ke/mpesa/c2b/v1/registerurl';
    const requestData = {
      ShortCode: process.env.BUSINESS_SHORTCODE,
      ResponseType: 'Completed',
      ConfirmationURL: `${process.env.BASE_URL}/api/mpesa/c2b/confirmation`,
      ValidationURL: `${process.env.BASE_URL}/api/mpesa/c2b/validation`,
    };

    const response = await axios.post(registerUrl, requestData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'C2B URLs registered successfully',
      data: response.data,
    });
  } catch (error: any) {
    console.error('C2B registration error:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: error.response?.data?.errorMessage || 'Failed to register C2B URLs',
      },
      { status: 500 }
    );
  }
}

// Validation endpoint
export async function PUT(request: Request) {
  try {
    const data = await request.json();
    
    // Implement your validation logic here
    // For example, check if the account number exists
    
    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: 'Validation successful',
    });
  } catch (error) {
    console.error('Validation error:', error);
    
    return NextResponse.json({
      ResultCode: 1,
      ResultDesc: 'Validation failed',
    });
  }
}

// Confirmation endpoint
export async function PATCH(request: Request) {
  try {
    const data = await request.json();
    
    // Process the payment confirmation
    // Store transaction details in your database
    // Update ticket status, send confirmation emails, etc.
    
    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: 'Confirmation received successfully',
    });
  } catch (error) {
    console.error('Confirmation error:', error);
    
    return NextResponse.json({
      ResultCode: 1,
      ResultDesc: 'Confirmation processing failed',
    });
  }
} 