import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface StorageSelectionProps {
  onSelect: (storage: string) => void;
}

const StorageSelection = ({ onSelect }: StorageSelectionProps) => {
  const { toast } = useToast();
  const [selectedStorage, setSelectedStorage] = useState<string>("dropbox"); // Default to Dropbox

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

  // Initialize with the default value and load saved credentials
  useEffect(() => {
    onSelect(selectedStorage);
    
    // Load saved credentials from localStorage
    const savedCreds = localStorage.getItem('storage_credentials');
    if (savedCreds) {
      try {
        const parsedCreds = JSON.parse(savedCreds);
        setStorageCredentials(parsedCreds);
      } catch (error) {
        console.error("Error parsing saved credentials:", error);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [storageCredentials, setStorageCredentials] = useState({
    google_drive: {
      api_key: "",
      client_id: "",
      selectedFolder: { id: "", name: "" }
    },
    dropbox: {
      access_token: "",
      selectedFolder: { id: "", name: "", path: "" }
    },
    amazon_s3: {
      access_key: "",
      secret_key: "",
      bucket: "",
      selectedFolder: { name: "", path: "/" }
    }
  });

  const [showFolderDialog, setShowFolderDialog] = useState(false);
  const [folderList, setFolderList] = useState<Array<{ id: string; name: string; path?: string }>>([]);

  const fetchFolders = async (service: string) => {
    try {
      const response = await fetch(`/api/storage/${service}/folders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credentials: storageCredentials[service as keyof typeof storageCredentials] })
      });
      
      if (!response.ok) throw new Error('Failed to fetch folders');
      
      const folders = await response.json();
      setFolderList(folders);
      setShowFolderDialog(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch folders. Please check your credentials.",
        variant: "destructive"
      });
    }
  };

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
                <div className="flex space-x-2">
                  <input
                    id="google_api_key"
                    type="password"
                    className="flex-1 p-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter your Google Drive API key"
                    value={storageCredentials.google_drive.api_key}
                    onChange={(e) => handleCredentialChange("google_drive", "api_key", e.target.value)}
                  />
                  <button 
                    className="bg-navy hover:bg-navy/90 text-white font-bold py-2 px-4 rounded transition-colors"
                    onClick={() => {
                      if (storageCredentials.google_drive.api_key) {
                        toast({ 
                          title: "API Key Saved", 
                          description: "Your Google Drive API key has been saved successfully." 
                        });
                      } else {
                        toast({ 
                          title: "Error", 
                          description: "Please enter an API key before saving.",
                          variant: "destructive" 
                        });
                      }
                    }}
                  >
                    Save
                  </button>
                </div>
              </div>
              
              <div>
                <label htmlFor="google_client_id" className="block text-sm font-medium text-neutral-500 mb-1">
                  Google Drive Client ID
                </label>
                <div className="flex space-x-2">
                  <input
                    id="google_client_id"
                    type="password"
                    className="flex-1 p-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter your Google Drive Client ID"
                    value={storageCredentials.google_drive.client_id}
                    onChange={(e) => handleCredentialChange("google_drive", "client_id", e.target.value)}
                  />
                  <button 
                    className="bg-navy hover:bg-navy/90 text-white font-bold py-2 px-4 rounded transition-colors"
                    onClick={() => {
                      if (storageCredentials.google_drive.client_id) {
                        toast({ 
                          title: "Client ID Saved", 
                          description: "Your Google Drive Client ID has been saved successfully." 
                        });
                      } else {
                        toast({ 
                          title: "Error", 
                          description: "Please enter a Client ID before saving.",
                          variant: "destructive" 
                        });
                      }
                    }}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {selectedStorage === "dropbox" && (
            <div>
              <label htmlFor="dropbox_token" className="block text-sm font-medium text-neutral-500 mb-1">
                Dropbox Access Token
              </label>
              <div className="flex space-x-2">
                <input
                  id="dropbox_token"
                  type="password"
                  className="flex-1 p-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter your Dropbox access token"
                  value={storageCredentials.dropbox.access_token}
                  onChange={(e) => handleCredentialChange("dropbox", "access_token", e.target.value)}
                />
                <button 
                  className="bg-navy hover:bg-navy/90 text-white font-bold py-2 px-4 rounded transition-colors"
                  onClick={() => {
                    if (storageCredentials.dropbox.access_token) {
                      // Save the access token to localStorage
                      const storageData = JSON.stringify(storageCredentials);
                      localStorage.setItem('storage_credentials', storageData);
                      
                      toast({ 
                        title: "Access Token Saved", 
                        description: "Your Dropbox access token has been saved successfully." 
                      });
                    } else {
                      toast({ 
                        title: "Error", 
                        description: "Please enter an access token before saving.",
                        variant: "destructive" 
                      });
                    }
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          )}
          
          {selectedStorage === "amazon_s3" && (
            <div className="space-y-3">
              <div>
                <label htmlFor="aws_access_key" className="block text-sm font-medium text-neutral-500 mb-1">
                  AWS Access Key
                </label>
                <div className="flex space-x-2">
                  <input
                    id="aws_access_key"
                    type="password"
                    className="flex-1 p-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter your AWS Access Key"
                    value={storageCredentials.amazon_s3.access_key}
                    onChange={(e) => handleCredentialChange("amazon_s3", "access_key", e.target.value)}
                  />
                  <button 
                    className="bg-navy hover:bg-navy/90 text-white font-bold py-2 px-4 rounded transition-colors"
                    onClick={() => {
                      if (storageCredentials.amazon_s3.access_key) {
                        toast({ 
                          title: "Access Key Saved", 
                          description: "Your AWS Access Key has been saved successfully." 
                        });
                      } else {
                        toast({ 
                          title: "Error", 
                          description: "Please enter an access key before saving.",
                          variant: "destructive" 
                        });
                      }
                    }}
                  >
                    Save
                  </button>
                </div>
              </div>
              
              <div>
                <label htmlFor="aws_secret_key" className="block text-sm font-medium text-neutral-500 mb-1">
                  AWS Secret Key
                </label>
                <div className="flex space-x-2">
                  <input
                    id="aws_secret_key"
                    type="password"
                    className="flex-1 p-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter your AWS Secret Key"
                    value={storageCredentials.amazon_s3.secret_key}
                    onChange={(e) => handleCredentialChange("amazon_s3", "secret_key", e.target.value)}
                  />
                  <button 
                    className="bg-navy hover:bg-navy/90 text-white font-bold py-2 px-4 rounded transition-colors"
                    onClick={() => {
                      if (storageCredentials.amazon_s3.secret_key) {
                        toast({ 
                          title: "Secret Key Saved", 
                          description: "Your AWS Secret Key has been saved successfully." 
                        });
                      } else {
                        toast({ 
                          title: "Error", 
                          description: "Please enter a secret key before saving.",
                          variant: "destructive" 
                        });
                      }
                    }}
                  >
                    Save
                  </button>
                </div>
              </div>
              
              <div>
                <label htmlFor="s3_bucket" className="block text-sm font-medium text-neutral-500 mb-1">
                  S3 Bucket Name
                </label>
                <div className="flex space-x-2">
                  <input
                    id="s3_bucket"
                    type="text"
                    className="flex-1 p-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter your S3 bucket name"
                    value={storageCredentials.amazon_s3.bucket}
                    onChange={(e) => handleCredentialChange("amazon_s3", "bucket", e.target.value)}
                  />
                  <button 
                    className="bg-navy hover:bg-navy/90 text-white font-bold py-2 px-4 rounded transition-colors"
                    onClick={() => {
                      if (storageCredentials.amazon_s3.bucket) {
                        toast({ 
                          title: "Bucket Name Saved", 
                          description: "Your S3 bucket name has been saved successfully." 
                        });
                      } else {
                        toast({ 
                          title: "Error", 
                          description: "Please enter a bucket name before saving.",
                          variant: "destructive" 
                        });
                      }
                    }}
                  >
                    Save
                  </button>
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-neutral-500 mb-1">
                  Selected Folder
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    className="flex-1 p-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="No folder selected"
                    value={storageCredentials[selectedStorage as keyof typeof storageCredentials].selectedFolder?.name || ""}
                    readOnly
                  />
                  <button
                    className="bg-navy hover:bg-navy/90 text-white font-bold py-2 px-4 rounded transition-colors"
                    onClick={() => fetchFolders(selectedStorage)}
                  >
                    Browse
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showFolderDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Select Folder</h3>
            <div className="space-y-2">
              {folderList.map((folder) => (
                <div
                  key={folder.id || folder.path}
                  className="p-2 hover:bg-gray-100 rounded cursor-pointer flex items-center"
                  onClick={() => {
                    setStorageCredentials(prev => ({
                      ...prev,
                      [selectedStorage]: {
                        ...prev[selectedStorage as keyof typeof prev],
                        selectedFolder: folder
                      }
                    }));
                    setShowFolderDialog(false);
                    toast({
                      title: "Folder Selected",
                      description: `Selected folder: ${folder.name}`
                    });
                  }}
                >
                  <i className="mdi mdi-folder text-primary-500 mr-2"></i>
                  {folder.name}
                </div>
              ))}
            </div>
            <button
              className="mt-4 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
              onClick={() => setShowFolderDialog(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default StorageSelection;
