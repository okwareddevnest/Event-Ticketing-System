'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { toast } from 'sonner';
import { CalendarIcon, MapPinIcon, TicketIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import dynamic from 'next/dynamic';

// Dynamically import TicketPDF to avoid SSR issues
const TicketPDF = dynamic(() => import('@/components/TicketPDF'), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center items-center h-[600px] bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
    </div>
  ),
});

interface Ticket {
  id: string;
  quantity: number;
  status: string;
  event: {
    title: string;
    description: string;
    date: Date;
    venue: string;
    price: number;
    imageUrl?: string;
  };
  transaction: {
    amount: number;
    status: string;
    mpesaReceiptNumber?: string;
  };
  user: {
    name: string;
    email: string;
  };
}

export default function TicketsPage() {
  const { isSignedIn, user } = useUser();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

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

  const handleViewTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
  };

  const handleCloseTicket = () => {
    setSelectedTicket(null);
  };

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
                        KES {ticket.transaction.amount.toLocaleString()}
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
                      
                      {ticket.status === 'CONFIRMED' && (
                        <button
                          onClick={() => handleViewTicket(ticket)}
                          className="mt-4 flex items-center text-purple-600 hover:text-purple-700"
                        >
                          <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                          View Ticket PDF
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">Ticket PDF</h3>
              <button
                onClick={handleCloseTicket}
                className="text-gray-500 hover:text-gray-700"
              >
                Close
              </button>
            </div>
            <div className="p-4">
              <TicketPDF ticket={selectedTicket} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 