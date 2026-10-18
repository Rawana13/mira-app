import React from 'react';

export default function LoadingCard({ message }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-12 h-12 border-4 border-light-blue border-t-sky-blue rounded-full animate-spin mb-6" />
      <p className="text-dark-blue text-lg font-medium animate-pulse-soft">
        {message}
      </p>
    </div>
  );
}
