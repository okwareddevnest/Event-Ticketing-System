'use client';

import { UserButton, SignInButton, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Menu } from '@headlessui/react';
import { CalendarIcon, TicketIcon, UserCircleIcon } from '@heroicons/react/24/outline';

export default function Navbar() {
  const { user, isSignedIn } = useUser();
  const isAdmin = user?.publicMetadata?.role === 'admin';

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="font-bold text-xl text-purple-600">
            Events Platform
          </Link>
          
          <div className="flex items-center space-x-4">
            <Link 
              href="/events" 
              className="text-gray-600 hover:text-purple-600 px-3 py-2 rounded-md flex items-center"
            >
              <CalendarIcon className="h-5 w-5 mr-1" />
              Events
            </Link>
            
            {isSignedIn ? (
              <>
                <Link 
                  href="/tickets" 
                  className="text-gray-600 hover:text-purple-600 px-3 py-2 rounded-md flex items-center"
                >
                  <TicketIcon className="h-5 w-5 mr-1" />
                  My Tickets
                </Link>
                
                {isAdmin && (
                  <Link 
                    href="/admin/events" 
                    className="text-gray-600 hover:text-purple-600 px-3 py-2 rounded-md flex items-center"
                  >
                    <UserCircleIcon className="h-5 w-5 mr-1" />
                    Admin
                  </Link>
                )}
                
                <Menu as="div" className="relative">
                  <UserButton afterSignOutUrl="/" />
                </Menu>
              </>
            ) : (
              <SignInButton mode="modal">
                <button className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors">
                  Sign In
                </button>
              </SignInButton>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
} 