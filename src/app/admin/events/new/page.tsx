'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import EventForm from '@/components/EventForm';

export default function NewEventPage() {
  const router = useRouter();
  const { isSignedIn } = useUser();
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Event</h1>
          <EventForm />
        </div>
      </div>
    </div>
  );
} 