
import { useState } from 'react';
import { useLocation } from 'wouter';
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';

export default function ImageHandlerScreen2() {
  useDocumentTitle("Image Handler - Screen 2");
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header pageTitle="Image Handler - Screen 2" />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            className="mr-2"
            onClick={() => navigate('/')}
          >
            &larr; Back to Home
          </Button>
          <h1 className="text-2xl font-bold">Image Handler - Screen 2</h1>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">Image Handler Screen 2 content will be implemented here.</p>
        </div>
      </div>
    </div>
  );
}
