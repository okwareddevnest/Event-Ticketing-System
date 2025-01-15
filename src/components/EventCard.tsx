'use client';

import { CalendarIcon, MapPinIcon, CurrencyDollarIcon, TicketIcon } from '@heroicons/react/24/outline';

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

interface EventCardProps {
  event: Event;
  onClick?: () => void;
}

export default function EventCard({ event, onClick }: EventCardProps) {
  return (
    <div
      className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow duration-300"
      onClick={onClick}
    >
      {event.imageUrl && (
        <div className="relative h-48">
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
        <p className="text-gray-600 line-clamp-2 mb-4">{event.description}</p>

        <div className="space-y-2">
          <div className="flex items-center text-gray-600">
            <CalendarIcon className="h-5 w-5 mr-2" />
            {new Date(event.date).toLocaleDateString('en-US', {
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
            {event.venue}
          </div>

          <div className="flex items-center text-gray-600">
            <CurrencyDollarIcon className="h-5 w-5 mr-2" />
            KES {event.price.toLocaleString()}
          </div>

          <div className="flex items-center text-gray-600">
            <TicketIcon className="h-5 w-5 mr-2" />
            {event.availableTickets} tickets available
          </div>
        </div>
      </div>
    </div>
  );
} 