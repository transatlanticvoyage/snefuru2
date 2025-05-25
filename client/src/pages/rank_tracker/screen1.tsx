import { useState } from 'react';
import { useLocation } from 'wouter';
import MainNavigationMenu from '@/components/NavigationMenu';
import UserLoginStatus from '@/components/UserLoginStatus';

export default function RankTrackerScreen1() {
  const [, navigate] = useLocation();
  
  return (
    <div className="font-sans bg-neutral-50 text-neutral-500 min-h-screen">
      {/* Full-width header - same as homepage but without Generate Images button */}
      <header className="w-full bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-semibold text-neutral-600 flex items-center">
              <span className="mr-2">Snefuru</span>
              <span className="text-base text-neutral-400 font-normal">Rank Tracker</span>
            </h1>
            
            <div className="flex items-center space-x-4">
              {/* Navigation Menu */}
              <MainNavigationMenu />
              
              {/* User Login Status */}
              <UserLoginStatus />
            </div>
          </div>
        </div>
      </header>

      {/* Page content - currently blank */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-col items-center justify-center p-10 bg-white rounded-lg shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">Rank Tracker</h2>
          <p className="text-lg text-center">This page is under construction.</p>
        </div>
      </div>
    </div>
  );
}