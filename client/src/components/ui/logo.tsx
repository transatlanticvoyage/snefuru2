import React from 'react';

export function Logo() {
  return (
    <div className="w-8 h-8 mr-2 bg-gradient-to-br from-orange-400 to-orange-600 rounded-md flex items-center justify-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-white"
      >
        <rect width="18" height="10" x="3" y="3" rx="2" />
        <rect width="18" height="6" x="3" y="15" rx="2" />
        <path d="M7 7h.01" />
        <path d="M11 7h.01" />
        <path d="M7 19h.01" />
        <path d="M11 19h.01" />
      </svg>
    </div>
  );
}