'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { toast } from 'sonner';
import EventCard from '@/components/EventCard';

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

export default function AdminEventsPage() {
  const router = useRouter();
  const { isSignedIn } = useUser();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

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
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/events');
        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        toast.error('Failed to load events. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    if (isAdmin) {
      fetchEvents();
    }
  }, [isAdmin]);

  const handleCreateEvent = () => {
    router.push('/admin/events/new');
  };

  const handleEditEvent = (eventId: string) => {
    router.push(`/admin/events/${eventId}/edit`);
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete event');
      }

      toast.success('Event deleted successfully');
      setEvents(events.filter(event => event.id !== eventId));
    } catch (error) {
      toast.error('Failed to delete event. Please try again.');
    }
  };

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manage Events</h1>
          <button
            onClick={handleCreateEvent}
            className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition-colors"
          >
            Create Event
          </button>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No events available</h3>
            <p className="text-gray-600">Create your first event to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                isAdminView
                onEdit={() => handleEditEvent(event.id)}
                onDelete={() => handleDeleteEvent(event.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 