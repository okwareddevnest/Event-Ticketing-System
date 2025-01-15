'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { toast } from 'sonner';
import { CalendarIcon, MapPinIcon, TicketIcon } from '@heroicons/react/24/outline';

interface Ticket {
  id: string;
  eventId: string;
  userId: string;
  quantity: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  createdAt: Date;
  updatedAt: Date;
  event: {
    id: string;
    title: string;
    description: string;
    date: Date;
    venue: string;
    price: number;
    imageUrl?: string;
  };
  transaction?: {
    id: string;
    amount: number;
    status: 'PENDING' | 'COMPLETED' | 'FAILED';
    mpesaReceiptNumber?: string;
  };
}

export default function TicketsPage() {
  const { isSignedIn } = useUser();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await fetch('/api/tickets');
        if (!response.ok) {
          throw new Error('Failed to fetch tickets');
        }
        const data = await response.json();
        setTickets(data);
      } catch (error) {
        toast.error('Failed to load tickets. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    if (isSignedIn) {
      fetchTickets();
    }
  }, [isSignedIn]);

  if (!isSignedIn) {
    return (
      <div className="min-h-screen pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Please sign in</h2>
            <p className="mt-2 text-gray-600">You need to be signed in to view your tickets.</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Tickets</h1>

        {tickets.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets yet</h3>
            <p className="text-gray-600">
              Browse our events and book your first ticket!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{ticket.event.title}</h2>
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center text-gray-600">
                          <CalendarIcon className="h-5 w-5 mr-2" />
                          {new Date(ticket.event.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <MapPinIcon className="h-5 w-5 mr-2" />
                          {ticket.event.venue}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <TicketIcon className="h-5 w-5 mr-2" />
                          {ticket.quantity} {ticket.quantity === 1 ? 'ticket' : 'tickets'}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-500">Total Amount</div>
                      <div className="text-xl font-bold text-purple-600">
                        KES {(ticket.event.price * ticket.quantity).toLocaleString()}
                      </div>
                      <div className={`mt-2 inline-flex px-3 py-1 rounded-full text-sm font-medium
                        ${ticket.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                          ticket.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'}`}
                      >
                        {ticket.status}
                      </div>
                    </div>
                  </div>

                  {ticket.transaction && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-500">
                          Transaction Status: {ticket.transaction.status}
                        </div>
                        {ticket.transaction.mpesaReceiptNumber && (
                          <div className="text-sm text-gray-500">
                            M-Pesa Receipt: {ticket.transaction.mpesaReceiptNumber}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 