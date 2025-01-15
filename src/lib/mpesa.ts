import axios from 'axios';

const MPESA_AUTH_URL = 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';
const MPESA_STK_URL = 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';

export async function getAccessToken(): Promise<string> {
  const auth = Buffer.from(
    `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
  ).toString('base64');

  try {
    const response = await axios.get(MPESA_AUTH_URL, {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });

    return response.data.access_token;
  } catch (error) {
    console.error('Error getting M-Pesa access token:', error);
    throw new Error('Failed to get M-Pesa access token');
  }
}

export async function initiateSTKPush(
  phoneNumber: string,
  amount: number,
  accountReference: string,
  callbackUrl: string
): Promise<any> {
  try {
    // Format phone number to include country code if not present
    const formattedPhone = phoneNumber.startsWith('254') 
      ? phoneNumber 
      : `254${phoneNumber.replace(/^0+/, '')}`;

    // Ensure amount is a positive whole number
    const formattedAmount = Math.max(1, Math.round(amount));

    const accessToken = await getAccessToken();
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
    const password = Buffer.from(
      `${process.env.BUSINESS_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`
    ).toString('base64');

    const payload = {
      BusinessShortCode: process.env.BUSINESS_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: formattedAmount,
      PartyA: formattedPhone,
      PartyB: process.env.BUSINESS_SHORTCODE,
      PhoneNumber: formattedPhone,
      CallBackURL: callbackUrl,
      AccountReference: accountReference,
      TransactionDesc: 'Event Ticket Payment',
    };

    console.log('STK Push payload:', payload);

    const response = await axios.post(
      MPESA_STK_URL,
      payload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('STK Push response:', response.data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      console.error('STK Push API error:', {
        status: error.response.status,
        data: error.response.data
      });
      throw new Error(`M-Pesa API error: ${JSON.stringify(error.response.data)}`);
    }
    console.error('Error initiating STK push:', error);
    throw new Error('Failed to initiate M-Pesa payment');
  }
} 