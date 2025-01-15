'use client';

import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignUp
        appearance={{
          elements: {
            formButtonPrimary: 'bg-purple-600 hover:bg-purple-700',
            footerActionLink: 'text-purple-600 hover:text-purple-700'
          }
        }}
        afterSignUpUrl="/"
        signInUrl="/sign-in"
      />
    </div>
  );
} 