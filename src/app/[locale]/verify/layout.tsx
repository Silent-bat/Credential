import React from 'react';
import { Header } from '@/components/layout/Header';

export default function VerifyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      {children}
    </>
  );
} 