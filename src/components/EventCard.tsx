'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { CalendarIcon, MapPinIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

interface EventCardProps {
  event: {
    id: string;
    title: string;
    description: string;
    date: Date;
    venue: string;
    price: number;
    imageUrl?: string;
    availableTickets: number;
  };
}

export default function EventCard({ event }: EventCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden border border-purple-100 hover:border-purple-300 transition-colors"
    >
      <div className="relative h-48 bg-purple-100">
        {event.imageUrl ? (
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-purple-500">
            <CalendarIcon className="h-12 w-12" />
          </div>
        )}
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{event.title}</h3>
        <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-gray-600">
            <CalendarIcon className="h-5 w-5 mr-2" />
            <span>{new Date(event.date).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <MapPinIcon className="h-5 w-5 mr-2" />
            <span>{event.venue}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <CurrencyDollarIcon className="h-5 w-5 mr-2" />
            <span>KES {event.price.toLocaleString()}</span>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">
            {event.availableTickets} tickets left
          </span>
          <Link
            href={`/event/${event.id}`}
            className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors inline-block"
          >
            View Details
          </Link>
        </div>
      </div>
    </motion.div>
  );
} 