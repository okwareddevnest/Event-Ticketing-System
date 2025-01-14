import { NextResponse } from 'next/server';
import axios from 'axios';

// Helper function to get access token (reusing from previous handlers)
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

// Helper function to generate security credential
function generateSecurityCredential() {
  // In production, this should be generated using the security certificate from Safaricom
  // For sandbox, you can use any string
  return 'your_security_credential';
}

export async function POST(request: Request) {
  try {
    const { phoneNumber, amount, remarks } = await request.json();

    // Input validation
    if (!phoneNumber || !amount) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const accessToken = await getAccessToken();
    const securityCredential = generateSecurityCredential();

    // Prepare B2C request
    const b2cUrl = 'https://sandbox.safaricom.co.ke/mpesa/b2c/v1/paymentrequest';
    const requestData = {
      InitiatorName: process.env.INITIATOR_NAME,
      SecurityCredential: securityCredential,
      CommandID: 'BusinessPayment', // Use 'SalaryPayment' or 'PromotionPayment' as needed
      Amount: amount,
      PartyA: process.env.BUSINESS_SHORTCODE,
      PartyB: phoneNumber,
      Remarks: remarks || 'Refund payment',
      QueueTimeOutURL: `${process.env.BASE_URL}/api/mpesa/b2c/timeout`,
      ResultURL: `${process.env.BASE_URL}/api/mpesa/b2c/result`,
      Occasion: 'Refund',
    };

    // Make B2C request
    const response = await axios.post(b2cUrl, requestData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'B2C payment initiated successfully',
      data: response.data,
    });
  } catch (error: any) {
    console.error('B2C payment error:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: error.response?.data?.errorMessage || 'Failed to process B2C payment',
      },
      { status: 500 }
    );
  }
}

// Result endpoint
export async function PUT(request: Request) {
  try {
    const data = await request.json();
    
    // Process the B2C result
    // Update refund status in your database
    // Send notifications, etc.
    
    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: 'Result processed successfully',
    });
  } catch (error) {
    console.error('B2C result processing error:', error);
    
    return NextResponse.json({
      ResultCode: 1,
      ResultDesc: 'Result processing failed',
    });
  }
}

// Timeout endpoint
export async function PATCH(request: Request) {
  try {
    const data = await request.json();
    
    // Handle timeout scenario
    // Update transaction status
    // Implement retry logic if needed
    
    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: 'Timeout handled successfully',
    });
  } catch (error) {
    console.error('B2C timeout handling error:', error);
    
    return NextResponse.json({
      ResultCode: 1,
      ResultDesc: 'Timeout handling failed',
    });
  }
} 