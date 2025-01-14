'use client';

import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";

// Mock data - in a real app, this would come from an API/database
const events = [
  {
    id: "1",
    title: "Tech Conference 2024",
    date: "March 15, 2024",
    price: 5000,
    description: "Join us for an amazing tech conference with industry leaders.",
    venue: "Tech Hub, Nairobi",
    availableTickets: 100,
  },
  {
    id: "2",
    title: "Music Festival",
    date: "April 20, 2024",
    price: 3000,
    description: "A day filled with live music performances and entertainment.",
    venue: "Freedom Park, Nairobi",
    availableTickets: 200,
  },
];

export default function EventDetails() {
  const params = useParams();
  const router = useRouter();
  const event = events.find((e) => e.id === params.id);

  if (!event) {
    return <div>Event not found</div>;
  }

  const handleBooking = async () => {
    try {
      // In a real app, this would make an API call to initiate STK Push
      router.push(`/checkout?eventId=${event.id}`);
    } catch (error) {
      console.error('Booking failed:', error);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-lg shadow-lg overflow-hidden p-6"
        >
          <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
          
          <div className="mt-6 space-y-4">
            <p className="text-gray-600">{event.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-gray-700">
                  <strong>Date:</strong> {event.date}
                </p>
                <p className="text-gray-700">
                  <strong>Venue:</strong> {event.venue}
                </p>
              </div>
              
              <div className="space-y-2">
                <p className="text-gray-700">
                  <strong>Price:</strong> KES {event.price}
                </p>
                <p className="text-gray-700">
                  <strong>Available Tickets:</strong> {event.availableTickets}
                </p>
              </div>
            </div>
            
            <div className="mt-8">
              <Button
                className="w-full md:w-auto"
                onClick={handleBooking}
              >
                Book Tickets
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
} 