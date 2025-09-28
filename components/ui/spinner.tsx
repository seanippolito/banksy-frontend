// src/components/ui/spinner.tsx
import React from 'react';

export default function LoadingSpinner() {
    return (
        <div className="flex justify-center items-center h-full w-full p-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="ml-4 text-primary font-semibold">Loading...</p>
        </div>
    );
}