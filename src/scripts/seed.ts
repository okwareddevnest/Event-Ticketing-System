import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

import dbConnect from '../lib/db';
import Event from '../models/Event';

const events = [
  {
    title: "Tech Conference 2024",
    date: new Date("2024-03-15"),
    price: 5000,
    description: "Join us for an amazing tech conference with industry leaders.",
    venue: "Tech Hub, Nairobi",
    availableTickets: 100,
  },
  {
    title: "Music Festival",
    date: new Date("2024-04-20"),
    price: 3000,
    description: "A day filled with live music performances and entertainment.",
    venue: "Freedom Park, Nairobi",
    availableTickets: 200,
  },
];

async function seed() {
  try {
    await dbConnect();
    
    // Clear existing events
    await Event.deleteMany({});
    
    // Insert new events
    const createdEvents = await Event.insertMany(events);
    
    console.log('Database seeded successfully!');
    console.log('Created events:', createdEvents);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed(); 