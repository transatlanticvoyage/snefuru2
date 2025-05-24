import { useState, useEffect } from "react";

interface StorageSelectionProps {
  onSelect: (storage: string) => void;
}

const StorageSelection = ({ onSelect }: StorageSelectionProps) => {
  const [selectedStorage, setSelectedStorage] = useState<string>("google_drive"); // Default to Google Drive

  const handleStorageSelect = (storage: string) => {
    setSelectedStorage(storage);
    onSelect(storage);
  };

  const storageOptions = [
    {
      id: "google_drive",
      name: "Google Drive",
      icon: "mdi-google-drive",
      description: "Cloud storage by Google"
    },
    {
      id: "dropbox",
      name: "Dropbox",
      icon: "mdi-dropbox",
      description: "Simple file sharing"
    },
    {
      id: "amazon_s3",
      name: "Amazon S3",
      icon: "mdi-amazon",
      description: "Secure cloud storage"
    }
  ];

  // Initialize with the default value
  useEffect(() => {
    onSelect(selectedStorage);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [storageCredentials, setStorageCredentials] = useState({
    google_drive: {
      api_key: "",
      client_id: ""
    },
    dropbox: {
      access_token: ""
    },
    amazon_s3: {
      access_key: "",
      secret_key: "",
      bucket: ""
    }
  });

  const handleCredentialChange = (service: string, field: string, value: string) => {
    setStorageCredentials(prev => ({
      ...prev,
      [service]: {
        ...prev[service as keyof typeof prev],
        [field]: value
      }
    }));
  };

  return (
    <section className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-neutral-600 mb-4">Step 3 - Select Where To Store The Images</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {storageOptions.map((option) => (
          <div 
            key={option.id}
            className={`flex flex-col items-center border rounded-lg p-4 cursor-pointer transition-all duration-200 hover:bg-primary-50 ${
              selectedStorage === option.id ? 'bg-primary-50 border-primary-500' : 'bg-white border-neutral-200'
            }`}
            onClick={() => handleStorageSelect(option.id)}
          >
            <input 
              type="radio" 
              name="storage" 
              value={option.id} 
              className="w-4 h-4 mb-2" 
              checked={selectedStorage === option.id}
              onChange={() => handleStorageSelect(option.id)}
            />
            <i className={`mdi ${option.icon} text-4xl text-primary-500 mb-2`}></i>
            <span className="font-medium">{option.name}</span>
            <span className="text-sm text-neutral-400 mt-2 text-center">{option.description}</span>
          </div>
        ))}
      </div>
      
      <div className="mt-6 bg-blue-50 p-4 rounded-md border border-blue-200">
        <h3 className="font-medium text-blue-700 flex items-center mb-2">
          <i className="mdi mdi-key-variant mr-2"></i>
          Cloud Storage Authentication
        </h3>
        <p className="text-sm text-blue-600 mb-4">
          Enter your authentication credentials for the selected cloud storage service.
        </p>

        <div className="space-y-4">
          {selectedStorage === "google_drive" && (
            <div className="space-y-3">
              <div>
                <label htmlFor="google_api_key" className="block text-sm font-medium text-neutral-500 mb-1">
                  Google Drive API Key
                </label>
                <input
                  id="google_api_key"
                  type="password"
                  className="w-full p-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter your Google Drive API key"
                  value={storageCredentials.google_drive.api_key}
                  onChange={(e) => handleCredentialChange("google_drive", "api_key", e.target.value)}
                />
              </div>
              
              <div>
                <label htmlFor="google_client_id" className="block text-sm font-medium text-neutral-500 mb-1">
                  Google Drive Client ID
                </label>
                <input
                  id="google_client_id"
                  type="password"
                  className="w-full p-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter your Google Drive Client ID"
                  value={storageCredentials.google_drive.client_id}
                  onChange={(e) => handleCredentialChange("google_drive", "client_id", e.target.value)}
                />
              </div>
            </div>
          )}
          
          {selectedStorage === "dropbox" && (
            <div>
              <label htmlFor="dropbox_token" className="block text-sm font-medium text-neutral-500 mb-1">
                Dropbox Access Token
              </label>
              <input
                id="dropbox_token"
                type="password"
                className="w-full p-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Enter your Dropbox access token"
                value={storageCredentials.dropbox.access_token}
                onChange={(e) => handleCredentialChange("dropbox", "access_token", e.target.value)}
              />
            </div>
          )}
          
          {selectedStorage === "amazon_s3" && (
            <div className="space-y-3">
              <div>
                <label htmlFor="aws_access_key" className="block text-sm font-medium text-neutral-500 mb-1">
                  AWS Access Key
                </label>
                <input
                  id="aws_access_key"
                  type="password"
                  className="w-full p-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter your AWS Access Key"
                  value={storageCredentials.amazon_s3.access_key}
                  onChange={(e) => handleCredentialChange("amazon_s3", "access_key", e.target.value)}
                />
              </div>
              
              <div>
                <label htmlFor="aws_secret_key" className="block text-sm font-medium text-neutral-500 mb-1">
                  AWS Secret Key
                </label>
                <input
                  id="aws_secret_key"
                  type="password"
                  className="w-full p-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter your AWS Secret Key"
                  value={storageCredentials.amazon_s3.secret_key}
                  onChange={(e) => handleCredentialChange("amazon_s3", "secret_key", e.target.value)}
                />
              </div>
              
              <div>
                <label htmlFor="s3_bucket" className="block text-sm font-medium text-neutral-500 mb-1">
                  S3 Bucket Name
                </label>
                <input
                  id="s3_bucket"
                  type="text"
                  className="w-full p-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter your S3 bucket name"
                  value={storageCredentials.amazon_s3.bucket}
                  onChange={(e) => handleCredentialChange("amazon_s3", "bucket", e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default StorageSelection;
