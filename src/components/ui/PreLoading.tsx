'use client';

import React from 'react';

export default function PreLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="text-gray-700 dark:text-gray-300">Loading...</p>
      </div>
    </div>
  );
} 