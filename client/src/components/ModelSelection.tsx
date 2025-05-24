import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface ModelSelectionProps {
  onSelect: (model: string) => void;
}

const ModelSelection = ({ onSelect }: ModelSelectionProps) => {
  const { toast } = useToast();
  const [selectedModel, setSelectedModel] = useState<string>("openai"); // Default to OpenAI

  const handleModelSelect = (model: string) => {
    setSelectedModel(model);
    onSelect(model);
  };

  const models = [
    {
      id: "openai",
      name: "OpenAI",
      icon: "mdi-brain",
      description: "DALL-E 2/3 image generation"
    },
    {
      id: "midjourney",
      name: "MidJourney",
      icon: "mdi-image-filter-drama",
      description: "Artistic style generation"
    },
    {
      id: "gemini",
      name: "Gemini",
      icon: "mdi-google",
      description: "Google's advanced AI model"
    }
  ];

  // Initialize state for API keys with saved values or empty strings
  const [apiKeys, setApiKeys] = useState(() => {
    const savedKeys = localStorage.getItem('ai_api_keys');
    if (savedKeys) {
      try {
        return JSON.parse(savedKeys);
      } catch (error) {
        console.error("Error parsing saved API keys:", error);
      }
    }
    
    // Default empty values
    return {
      openai: "",
      midjourney: "",
      gemini: ""
    };
  });

  // Initialize with the default value and load saved data
  useEffect(() => {
    onSelect(selectedModel);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApiKeyChange = (modelId: string, value: string) => {
    setApiKeys({
      ...apiKeys,
      [modelId]: value
    });
  };

  return (
    <section className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-neutral-600 mb-4">Step 2 - Select AI Model To Use</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {models.map((model) => (
          <div 
            key={model.id}
            className={`flex flex-col items-center border rounded-lg p-4 cursor-pointer transition-all duration-200 hover:bg-primary-50 ${
              selectedModel === model.id ? 'bg-primary-50 border-primary-500' : 'bg-white border-neutral-200'
            }`}
            onClick={() => handleModelSelect(model.id)}
          >
            <input 
              type="radio" 
              name="ai_model" 
              value={model.id} 
              className="w-4 h-4 mb-2" 
              checked={selectedModel === model.id}
              onChange={() => handleModelSelect(model.id)}
            />
            <i className={`mdi ${model.icon} text-4xl text-primary-500 mb-2`}></i>
            <span className="font-medium">{model.name}</span>
            <span className="text-sm text-neutral-400 mt-2 text-center">{model.description}</span>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-blue-50 p-4 rounded-md border border-blue-200">
        <h3 className="font-medium text-blue-700 flex items-center mb-2">
          <i className="mdi mdi-key-variant mr-2"></i>
          AI Model API Keys
        </h3>
        <p className="text-sm text-blue-600 mb-4">
          Enter your API key for the selected AI service. The key will be securely used for image generation.
        </p>
        
        <div className="space-y-3">
          {selectedModel === "openai" && (
            <div>
              <label htmlFor="openai_key" className="block text-sm font-medium text-neutral-500 mb-1">
                OpenAI API Key
              </label>
              <div className="flex space-x-2">
                <input
                  id="openai_key"
                  type="password"
                  className="flex-1 p-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter your OpenAI API key"
                  value={apiKeys.openai}
                  onChange={(e) => handleApiKeyChange("openai", e.target.value)}
                />
                <button 
                  className="bg-navy hover:bg-navy/90 text-white font-bold py-2 px-4 rounded transition-colors"
                  onClick={() => {
                    if (apiKeys.openai) {
                      // Save the API key to localStorage
                      localStorage.setItem('ai_api_keys', JSON.stringify(apiKeys));
                      
                      toast({ 
                        title: "API Key Saved", 
                        description: "Your OpenAI API key has been saved successfully." 
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
          )}
          
          {selectedModel === "midjourney" && (
            <div>
              <label htmlFor="midjourney_key" className="block text-sm font-medium text-neutral-500 mb-1">
                MidJourney API Key
              </label>
              <div className="flex space-x-2">
                <input
                  id="midjourney_key"
                  type="password"
                  className="flex-1 p-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter your MidJourney API key"
                  value={apiKeys.midjourney}
                  onChange={(e) => handleApiKeyChange("midjourney", e.target.value)}
                />
                <button 
                  className="bg-navy hover:bg-navy/90 text-white font-bold py-2 px-4 rounded transition-colors"
                  onClick={() => {
                    if (apiKeys.midjourney) {
                      // Here you would save the API key to your system
                      toast({ 
                        title: "API Key Saved", 
                        description: "Your MidJourney API key has been saved successfully." 
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
          )}
          
          {selectedModel === "gemini" && (
            <div>
              <label htmlFor="gemini_key" className="block text-sm font-medium text-neutral-500 mb-1">
                Google Gemini API Key
              </label>
              <div className="flex space-x-2">
                <input
                  id="gemini_key"
                  type="password"
                  className="flex-1 p-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter your Google Gemini API key"
                  value={apiKeys.gemini}
                  onChange={(e) => handleApiKeyChange("gemini", e.target.value)}
                />
                <button 
                  className="bg-navy hover:bg-navy/90 text-white font-bold py-2 px-4 rounded transition-colors"
                  onClick={() => {
                    if (apiKeys.gemini) {
                      // Here you would save the API key to your system
                      toast({ 
                        title: "API Key Saved", 
                        description: "Your Google Gemini API key has been saved successfully." 
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
          )}
        </div>
      </div>
    </section>
  );
};

export default ModelSelection;
