import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from 'sonner';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Events Platform',
  description: 'Book your favorite events with M-Pesa integration',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <Toaster position="top-center" richColors />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
