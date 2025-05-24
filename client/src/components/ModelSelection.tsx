import { useState, useEffect } from "react";

interface ModelSelectionProps {
  onSelect: (model: string) => void;
}

const ModelSelection = ({ onSelect }: ModelSelectionProps) => {
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

  // Initialize with the default value
  useEffect(() => {
    onSelect(selectedModel);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    </section>
  );
};

export default ModelSelection;
