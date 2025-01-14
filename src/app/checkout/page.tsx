'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { useSearchParams } from 'next/navigation';

// Mock data - in a real app, this would come from an API/database
const events = [
  {
    id: "1",
    title: "Tech Conference 2024",
    price: 5000,
  },
  {
    id: "2",
    title: "Music Festival",
    price: 3000,
  },
];

export default function Checkout() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get('eventId');
  const event = events.find((e) => e.id === eventId);

  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handlePayment = async () => {
    if (!phoneNumber.match(/^254[0-9]{9}$/)) {
      setError('Please enter a valid phone number starting with 254');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/mpesa/stkpush', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber,
          amount: event?.price || 0,
          eventId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.message || 'Payment failed. Please try again.');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!event) {
    return <div>Event not found</div>;
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden p-6"
        >
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>
          
          <div className="space-y-4">
            <div>
              <h2 className="font-semibold text-gray-700">{event.title}</h2>
              <p className="text-gray-600">Amount: KES {event.price}</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                M-Pesa Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                placeholder="254712345678"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
              {error && (
                <p className="text-red-500 text-sm">{error}</p>
              )}
            </div>

            {success ? (
              <div className="bg-green-50 p-4 rounded-md">
                <p className="text-green-800">
                  Payment initiated! Please check your phone for the STK push.
                </p>
              </div>
            ) : (
              <Button
                className="w-full"
                onClick={handlePayment}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Pay with M-Pesa'}
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </main>
  );
} 