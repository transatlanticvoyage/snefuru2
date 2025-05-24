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
      
      <div className="mt-4 bg-blue-50 p-4 rounded-md border border-blue-200">
        <h3 className="font-medium text-blue-700 flex items-center mb-2">
          <i className="mdi mdi-information-outline mr-2"></i>
          Cloud Storage Authentication
        </h3>
        <p className="text-sm text-blue-600">
          For demonstration purposes, cloud storage authentication is simulated. In a production environment, 
          you would need to provide API keys or authentication credentials for your selected cloud storage service.
        </p>
      </div>
    </section>
  );
};

export default StorageSelection;
