import { useState } from "react";

interface StorageSelectionProps {
  onSelect: (storage: string) => void;
}

const StorageSelection = ({ onSelect }: StorageSelectionProps) => {
  const [selectedStorage, setSelectedStorage] = useState<string | null>(null);

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

  return (
    <section className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-neutral-600 mb-4">Step 3 - Select Where To Store The Images</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {storageOptions.map((option) => (
          <label 
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
              className="sr-only" 
              checked={selectedStorage === option.id}
              onChange={() => {}} // React requires onChange handler for controlled inputs
            />
            <i className={`mdi ${option.icon} text-4xl text-primary-500 mb-2`}></i>
            <span className="font-medium">{option.name}</span>
            <span className="text-sm text-neutral-400 mt-2 text-center">{option.description}</span>
          </label>
        ))}
      </div>
    </section>
  );
};

export default StorageSelection;
