# Power Learn Project Events Platform

A modern event ticketing platform built with Next.js, featuring M-Pesa integration for payments and real-time ticket management.

![Power Learn Project Logo](public/plp-logo.png)

## Features

### User Features
- **Authentication & Authorization**
  - Secure user authentication with Clerk
  - Role-based access control (Admin/User)
  - Protected routes and API endpoints

### Event Management
- **Admin Features**
  - Create, edit, and delete events
  - Manage event details (title, description, date, venue, price, tickets)
  - Track ticket sales and availability
  - View transaction history

- **User Features**
  - Browse upcoming events
  - View event details
  - Book tickets with M-Pesa payment
  - View purchased tickets
  - Download ticket PDFs with QR codes

### Payment Integration
- **M-Pesa Integration**
  - Seamless STK Push for payments
  - Real-time payment confirmation
  - Automatic ticket status updates
  - Transaction tracking and receipts

### Technical Features
- **Real-time Updates**
  - WebHook integration for Clerk user events
  - M-Pesa callback handling
  - Automatic ticket status synchronization

- **Security**
  - Environment variable protection
  - API route protection
  - Secure webhook endpoints
  - Data validation and sanitization

## Technology Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TailwindCSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **React PDF** - PDF generation
- **QR Code** - Ticket verification

### Backend
- **Prisma** - Type-safe database ORM
- **MongoDB** - Primary database
- **Clerk** - Authentication and user management
- **M-Pesa Daraja API** - Payment processing

### Development & Deployment
- **TypeScript** - Type safety
- **ESLint** - Code linting
- **ngrok** - Tunnel for webhook testing
- **Vercel** - Deployment platform

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- MongoDB database
- M-Pesa Daraja API credentials
- Clerk account
- ngrok for local webhook testing

### Environment Variables
Create a `.env.local` file with the following:

```env
# Database
DATABASE_URL="mongodb+srv://your-username:your-password@your-cluster.mongodb.net/your-database"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
CLERK_SECRET_KEY=your_secret_key
CLERK_WEBHOOK_SECRET=your_webhook_secret

# M-Pesa Configuration
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_PASSKEY=your_passkey
MPESA_SHORTCODE=your_shortcode
MPESA_CALLBACK_URL=your_callback_url

# Application URLs
NEXT_PUBLIC_URL=your_public_url
BASE_URL=your_base_url
```

### Installation

1. Clone the repository:
```bash
git clone https://github.com/okwareddevnest/Event-Ticketing-System.git
cd Event-Ticketing-System
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

4. Start the development server:
```bash
npm run dev
```

5. Start ngrok for webhook testing:
```bash
npx ngrok http 3000
```

## API Documentation

### Event Endpoints
- `GET /api/events` - Get all events
- `POST /api/events` - Create new event (Admin only)
- `GET /api/events/[id]` - Get specific event
- `PUT /api/events/[id]` - Update event (Admin only)
- `DELETE /api/events/[id]` - Delete event (Admin only)

### Ticket Endpoints
- `GET /api/tickets` - Get user's tickets
- `POST /api/tickets` - Create ticket booking
- `GET /api/tickets/[id]` - Get specific ticket

### Payment Endpoints
- `POST /api/mpesa/payment` - Initiate STK Push
- `POST /api/mpesa/callback` - Handle M-Pesa callback

### User Endpoints
- `GET /api/user/role` - Get user role
- `POST /api/webhook/clerk` - Handle Clerk webhooks

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Power Learn Project for the inspiration and support
- M-Pesa Daraja API documentation
- Clerk Authentication documentation
- Next.js documentation and community
