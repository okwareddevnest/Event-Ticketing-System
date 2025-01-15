'use client';

import { useUser } from '@clerk/nextjs';
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
  isAdminView?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function EventCard({ event, onClick, isAdminView, onEdit, onDelete }: EventCardProps) {
  const { isSignedIn } = useUser();

  return (
    <div
      className="bg-white/70 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
    >
      {event.imageUrl && (
        <div className="relative h-48">
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
      )}

      <div className="p-6">
        <h3 className="text-xl font-bold bg-gradient-to-r from-[#00B3B0] to-[#E6007E] text-transparent bg-clip-text mb-2 line-clamp-1">
          {event.title}
        </h3>
        <p className="text-gray-600 line-clamp-2 mb-4">{event.description}</p>

        <div className="space-y-3">
          <div className="flex items-center text-gray-600">
            <CalendarIcon className="h-5 w-5 mr-2 text-[#00B3B0]" />
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
            <MapPinIcon className="h-5 w-5 mr-2 text-[#E6007E]" />
            {event.venue}
          </div>

          <div className="flex items-center text-gray-600">
            <CurrencyDollarIcon className="h-5 w-5 mr-2 text-[#00B3B0]" />
            KES {event.price.toLocaleString()}
          </div>

          <div className="flex items-center text-gray-600">
            <TicketIcon className="h-5 w-5 mr-2 text-[#E6007E]" />
            {event.availableTickets} tickets available
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {isAdminView ? (
            <div className="flex gap-2">
              <button
                onClick={onEdit}
                className="flex-1 bg-[#00B3B0]/90 text-white px-4 py-2 rounded-md hover:bg-[#00B3B0] transition-colors"
              >
                Edit
              </button>
              <button
                onClick={onDelete}
                className="flex-1 bg-red-600/90 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={onClick}
                className="w-full bg-[#E6007E]/90 text-white px-4 py-2 rounded-md hover:bg-[#E6007E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!isSignedIn || event.availableTickets === 0}
              >
                {event.availableTickets === 0 ? 'Sold Out' : 'Book Now'}
              </button>
              {!isSignedIn && (
                <p className="text-sm text-center text-gray-500">
                  Please sign in to book tickets
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
} 