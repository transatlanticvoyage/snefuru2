import { useState } from 'react';

export function Logo() {
  // Create a fallback logo with CSS gradient in case the image fails to load
  return (
    <div className="flex items-center">
      <div className="h-8 w-8 bg-gradient-to-br from-purple-600 to-orange-500 rounded-lg mr-2 flex items-center justify-center">
        <div className="h-4 w-4 bg-white rounded-sm relative">
          <div className="absolute w-2 h-2 bg-white rounded-full top-0 right-0"></div>
        </div>
      </div>
    </div>
  );
}