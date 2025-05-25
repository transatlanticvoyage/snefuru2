import React from 'react';
import Header from '@/components/Header';

const Screen1 = () => {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Header pageTitle="Reddit Scraper" />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-semibold text-neutral-600">Reddit Scraper</h1>
      </div>
    </div>
  );
};

export default Screen1; 