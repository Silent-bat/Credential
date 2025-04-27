'use client';

import { Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';

interface SessionProviderWrapperProps {
  children: React.ReactNode;
  session: Session | null;
}

export default function SessionProviderWrapper({ 
  children,
  session
}: SessionProviderWrapperProps) {
  return <SessionProvider session={session}>{children}</SessionProvider>;
} 