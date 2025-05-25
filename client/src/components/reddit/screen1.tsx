import React, { ChangeEvent, FormEvent } from 'react';

interface Screen1Props {
  onNext?: () => void;
}

const Screen1: React.FC<Screen1Props> = ({ onNext }) => {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (onNext) {
      onNext();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Reddit URL Input
          </h1>
          <p className="text-gray-600 mb-8">
            Enter the Reddit URLs you want to process. You can add multiple URLs, one per line.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            className="w-full h-48 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter Reddit URLs here, one per line..."
          />
          
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Next
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Screen1; 