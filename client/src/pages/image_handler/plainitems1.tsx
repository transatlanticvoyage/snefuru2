import React from 'react';
import Header from '../../components/Header';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';

// Define the interface for images3 data
interface Images3Data {
  id: number;
  created_at: string;
  rel_images3_plans_id: number;
  img_file_url1: string | null;
  img_file_extension: string | null;
  img_file_size: number | null;
  width: number | null;
  height: number | null;
}

const PlainItems1: React.FC = () => {
  useDocumentTitle('Plain Items 1');

  // Fetch images3 data
  const { data: images3Data, isLoading, error } = useQuery<Images3Data[]>({
    queryKey: ['images3'],
    queryFn: async () => {
      const response = await api.get('/api/images3');
      return response.data;
    }
  });

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-6">Images3 Data</h1>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          ) : error ? (
            <div className="text-red-500 text-center p-4">
              Error loading data. Please try again later.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File URL</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Extension</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File Size</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Width</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Height</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {images3Data?.map((image) => (
                    <tr key={image.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{image.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(image.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{image.rel_images3_plans_id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {image.img_file_url1 ? (
                          <a href={image.img_file_url1} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                            View
                          </a>
                        ) : (
                          'N/A'
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{image.img_file_extension || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {image.img_file_size ? `${(image.img_file_size / 1024).toFixed(2)} KB` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{image.width || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{image.height || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlainItems1; 