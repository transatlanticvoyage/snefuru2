import React from 'react';
import Header from '../../components/Header';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

const PlainItems1: React.FC = () => {
  useDocumentTitle('Plain Items 1');

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Content area left blank for now */}
      </div>
    </div>
  );
};

export default PlainItems1; 