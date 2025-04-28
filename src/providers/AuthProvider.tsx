"use client";

import React from "react";
import { SessionProvider } from "next-auth/react";

type Props = {
  children: React.ReactNode;
};

export default function AuthProvider({ children }: Props) {
  return (
    <SessionProvider 
      refetchInterval={5 * 60} // Refetch session every 5 minutes
      refetchOnWindowFocus={true} // Refetch when window regains focus
    >
      {children}
    </SessionProvider>
  );
} 