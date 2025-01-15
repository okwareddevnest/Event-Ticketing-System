'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { toast } from 'sonner';
import EventForm from '@/components/EventForm';

interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  venue: string;
  price: number;
  availableTickets: number;
  imageUrl?: string;
}

export default function EditEventPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { isSignedIn } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (isSignedIn) {
        try {
          const response = await fetch('/api/user/role');
          if (response.ok) {
            const data = await response.json();
            setIsAdmin(data.role === 'ADMIN');
          }
        } catch (error) {
          console.error('Error checking admin status:', error);
        }
      }
    };

    checkAdminStatus();
  }, [isSignedIn]);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/events/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch event');
        }
        const data = await response.json();
        setEvent(data);
      } catch (error) {
        toast.error('Failed to load event details. Please try again later.');
        router.push('/admin/events');
      } finally {
        setIsLoading(false);
      }
    };

    if (isAdmin) {
      fetchEvent();
    }
  }, [isAdmin, params.id, router]);

  if (!isSignedIn || !isAdmin) {
    return (
      <div className="min-h-screen pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
            <p className="mt-2 text-gray-600">You need to be an admin to view this page.</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Event Not Found</h2>
            <p className="mt-2 text-gray-600">The event you're trying to edit doesn't exist.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Event</h1>
          <EventForm
            eventId={params.id}
            initialData={{
              title: event.title,
              description: event.description,
              date: new Date(event.date).toISOString(),
              venue: event.venue,
              price: event.price,
              availableTickets: event.availableTickets,
              imageUrl: event.imageUrl,
            }}
          />
        </div>
      </div>
    </div>
  );
} 