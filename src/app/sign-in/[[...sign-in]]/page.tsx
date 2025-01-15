'use client';

import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn
        appearance={{
          elements: {
            formButtonPrimary: 'bg-purple-600 hover:bg-purple-700',
            footerActionLink: 'text-purple-600 hover:text-purple-700'
          }
        }}
        afterSignInUrl="/"
        signUpUrl="/sign-up"
      />
    </div>
  );
} 