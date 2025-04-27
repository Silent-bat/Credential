'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import Link from 'next/link';
import { defaultLocale } from '@/i18n/config';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // You can log the error to an error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // If a custom fallback was provided, use it
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Otherwise, render a default error message
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 py-12 dark:bg-gray-900 lg:px-8">
          <div className="text-center">
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
              Something went wrong
            </h1>
            <p className="mt-6 text-base leading-7 text-gray-600 dark:text-gray-400">
              We've encountered an unexpected error.
            </p>
            {this.state.error && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p className="text-sm text-red-700 dark:text-red-400">
                  {this.state.error.toString()}
                </p>
              </div>
            )}
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href={`/${defaultLocale}`}
                className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                Go back home
              </Link>
              <button 
                onClick={() => window.location.reload()}
                className="text-sm font-semibold text-gray-900 dark:text-white"
              >
                Try again <span aria-hidden="true">⟳</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 