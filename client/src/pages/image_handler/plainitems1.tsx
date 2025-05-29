import React, { useState } from 'react';
import Header from '../../components/Header';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';

// Create API client
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

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

interface ApiKeys {
  dropbox2_api_key: string;
  dropbox2_app_key: string;
  dropbox2_app_secret: string;
  openai2_api_key: string;
}

const PlainItems1: React.FC = () => {
  useDocumentTitle('Plain Items 1');
  const { user } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [apiKeys, setApiKeys] = useState<ApiKeys>({
    dropbox2_api_key: '',
    dropbox2_app_key: '',
    dropbox2_app_secret: '',
    openai2_api_key: ''
  });

  // Fetch images3 data
  const { data: images3Data, isLoading, error, refetch } = useQuery<Images3Data[]>({
    queryKey: ['images3'],
    queryFn: async () => {
      const response = await api.get('/images3');
      return Array.isArray(response.data) ? response.data : [];
    }
  });

  // Fetch user's API keys
  const { data: userData } = useQuery<ApiKeys>({
    queryKey: ['userApiKeys'],
    queryFn: async () => {
      const response = await api.get('/user/keys');
      return response.data;
    }
  });

  // Update API keys when user data changes
  React.useEffect(() => {
    if (userData) {
      setApiKeys({
        dropbox2_api_key: userData.dropbox2_api_key || '',
        dropbox2_app_key: userData.dropbox2_app_key || '',
        dropbox2_app_secret: userData.dropbox2_app_secret || '',
        openai2_api_key: userData.openai2_api_key || ''
      });
    }
  }, [userData]);

  // Save API keys mutation
  const saveApiKeysMutation = useMutation<void, Error, ApiKeys>({
    mutationFn: async (keys: ApiKeys) => {
      const response = await api.post('/user/keys', keys);
      return response.data;
    },
    onSuccess: () => {
      alert('API keys saved successfully!');
    },
    onError: (error: Error) => {
      alert('Error saving API keys: ' + error.message);
    }
  });

  // Generate image mutation
  const generateImageMutation = useMutation<void, Error, string>({
    mutationFn: async (prompt: string) => {
      const response = await api.post('/generate-image', { prompt });
      return response.data;
    },
    onSuccess: () => {
      refetch(); // Refresh the images list
      setPrompt(''); // Clear the prompt input
    },
    onError: (error: Error) => {
      alert('Error generating image: ' + error.message);
    }
  });

  const handleSaveApiKeys = (e: React.FormEvent) => {
    e.preventDefault();
    saveApiKeysMutation.mutate(apiKeys);
  };

  const handleGenerateImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      alert('Please enter a prompt');
      return;
    }
    generateImageMutation.mutate(prompt);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* API Keys Form */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">API Keys</h2>
          <form onSubmit={handleSaveApiKeys} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Dropbox API Key</label>
                <input
                  type="password"
                  value={apiKeys.dropbox2_api_key}
                  onChange={(e) => setApiKeys({ ...apiKeys, dropbox2_api_key: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Dropbox App Key</label>
                <input
                  type="password"
                  value={apiKeys.dropbox2_app_key}
                  onChange={(e) => setApiKeys({ ...apiKeys, dropbox2_app_key: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Dropbox App Secret</label>
                <input
                  type="password"
                  value={apiKeys.dropbox2_app_secret}
                  onChange={(e) => setApiKeys({ ...apiKeys, dropbox2_app_secret: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">OpenAI API Key</label>
                <input
                  type="password"
                  value={apiKeys.openai2_api_key}
                  onChange={(e) => setApiKeys({ ...apiKeys, openai2_api_key: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              disabled={saveApiKeysMutation.isPending}
            >
              {saveApiKeysMutation.isPending ? 'Saving...' : 'Save API Keys'}
            </button>
          </form>
        </div>

        {/* Image Generation Form */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Generate Image</h2>
          <form onSubmit={handleGenerateImage} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Prompt</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={3}
                placeholder="Enter your image generation prompt..."
              />
            </div>
            <button
              type="submit"
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              disabled={generateImageMutation.isPending}
            >
              {generateImageMutation.isPending ? 'Generating...' : 'Generate Image'}
            </button>
          </form>
        </div>

        {/* Images Table */}
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
          ) : !Array.isArray(images3Data) ? (
            <div className="text-red-500 text-center p-4">
              Invalid data format received from server.
            </div>
          ) : images3Data.length === 0 ? (
            <div className="text-gray-500 text-center p-4">
              No images found.
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
                  {images3Data.map((image) => (
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