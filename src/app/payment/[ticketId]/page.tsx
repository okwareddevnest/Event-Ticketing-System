'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { PhoneIcon } from '@heroicons/react/24/outline';

interface Ticket {
  id: string;
  quantity: number;
  status: string;
  event: {
    title: string;
    price: number;
  };
  transaction: {
    amount: number;
    status: string;
  };
}

export default function PaymentPage({ params }: { params: { ticketId: string } }) {
  const { isSignedIn } = useUser();
  const router = useRouter();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const ticketId = params.ticketId;

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const response = await fetch(`/api/tickets/${ticketId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch ticket');
        }
        const data = await response.json();
        setTicket(data);
        
        // If ticket is already paid for, set payment completed
        if (data.transaction?.status === 'COMPLETED') {
          setPaymentCompleted(true);
        }
      } catch (error) {
        toast.error('Failed to load ticket details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    if (isSignedIn) {
      fetchTicket();
    }
  }, [isSignedIn, ticketId]);

  const handlePayment = async (method: 'stk' | 'c2b') => {
    if (!phoneNumber.match(/^254[0-9]{9}$/)) {
      toast.error('Please enter a valid phone number starting with 254');
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch('/api/mpesa/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticketId,
          phoneNumber,
          method,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Payment failed');
      }
      
      if (method === 'stk') {
        toast.success('Please check your phone to complete the payment');
        
        // Poll for payment status
        const checkStatus = setInterval(async () => {
          try {
            const statusResponse = await fetch(`/api/tickets/${ticketId}`);
            if (!statusResponse.ok) {
              throw new Error('Failed to check payment status');
            }
            
            const updatedTicket = await statusResponse.json();
            
            if (updatedTicket.transaction?.status === 'COMPLETED') {
              clearInterval(checkStatus);
              setPaymentCompleted(true);
              setIsProcessing(false);
              toast.success('Payment completed successfully!');
              // Redirect to tickets page after 2 seconds
              setTimeout(() => {
                router.push('/tickets');
              }, 2000);
            } else if (updatedTicket.transaction?.status === 'FAILED') {
              clearInterval(checkStatus);
              setIsProcessing(false);
              toast.error('Payment failed. Please try again.');
            }
            // Keep polling if status is still PENDING
          } catch (error) {
            console.error('Error checking payment status:', error);
          }
        }, 5000); // Check every 5 seconds

        // Stop polling after 2 minutes
        setTimeout(() => {
          clearInterval(checkStatus);
          if (!paymentCompleted) {
            setIsProcessing(false);
            toast.error('Payment timeout. Please check your M-Pesa messages or try again.');
          }
        }, 120000);
      } else {
        toast.success(`Please send KES ${ticket?.transaction?.amount} to ${data.paybill}`);
        setIsProcessing(false);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Payment failed. Please try again.');
      setIsProcessing(false);
    }
  };

  const handleReturnHome = () => {
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (paymentCompleted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <div className="mb-4 text-green-500">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-4">Payment Successful!</h2>
          <p className="text-gray-600 mb-6">
            Your ticket for {ticket?.event.title} has been confirmed.
          </p>
          <div className="space-y-4">
            <button
              onClick={() => router.push('/tickets')}
              className="w-full bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              View My Tickets
            </button>
            <button
              onClick={handleReturnHome}
              className="w-full bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Please sign in</h2>
            <p className="mt-2 text-gray-600">You need to be signed in to complete payment.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Ticket not found</h2>
            <p className="mt-2 text-gray-600">The ticket you're trying to pay for doesn't exist or has been removed.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Complete Payment</h1>
            
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900">{ticket.event.title}</h2>
              <p className="text-gray-600">{ticket.quantity} {ticket.quantity === 1 ? 'ticket' : 'tickets'}</p>
              <p className="text-xl font-bold text-purple-600 mt-2">
                Total: KES {ticket.transaction.amount.toLocaleString()}
              </p>
            </div>

            <div className="mb-6">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                M-Pesa Phone Number
              </label>
              <div className="flex rounded-md shadow-sm">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                  <PhoneIcon className="h-5 w-5" />
                </span>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="254712345678"
                  className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border-gray-300 focus:ring-purple-500 focus:border-purple-500"
                  disabled={isProcessing}
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">Enter your phone number in the format: 254712345678</p>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => handlePayment('stk')}
                disabled={isProcessing}
                className="w-full bg-purple-600 text-white px-4 py-3 rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing...' : 'Pay with M-Pesa (STK Push)'}
              </button>

              <button
                onClick={() => handlePayment('c2b')}
                disabled={isProcessing}
                className="w-full bg-white text-purple-600 px-4 py-3 rounded-md border-2 border-purple-600 hover:bg-purple-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing...' : 'Pay with M-Pesa (Paybill)'}
              </button>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => router.push('/tickets')}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                View My Tickets
              </button>
            </div>
          </div>
        </div>
      </div>

      {isProcessing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold mb-2">Processing Payment</h3>
            <p className="text-gray-600">
              Please complete the payment on your phone. This window will automatically update once payment is confirmed.
            </p>
          </div>
        </div>
      )}
    </div>
  );
} 