import React from 'react';
import Header from '@/components/Header';

const ImageHandlerScreen1: React.FC = () => {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Header pageTitle="Image Handler" />
      
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600 mb-4">
              Welcome to the Image Handler page. This is where you can manage your images.
            </p>
            
            {/* Add your image handler content here */}
            <div className="mt-6">
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageHandlerScreen1; 