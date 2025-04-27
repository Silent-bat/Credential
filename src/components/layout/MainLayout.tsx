'use client';

import React from 'react';
import { Header } from './Header';

interface MainLayoutProps {
  children: React.ReactNode;
  fullscreen?: boolean;
}

export function MainLayout({ children, fullscreen = false }: MainLayoutProps) {
  return (
    <>
      {!fullscreen && <Header />}
      {children}
    </>
  );
} 