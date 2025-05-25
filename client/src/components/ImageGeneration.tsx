import React from "react";
import ProgressIndicator, { ProgressStage } from "./ProgressIndicator";

interface ImageGenerationProps {
  onGenerate: () => void;
  isGenerating: boolean;
  progress?: number;
  statusStage?: ProgressStage;
  errorMessage?: string | null;
}

const ImageGeneration = ({ 
  onGenerate, 
  isGenerating,
  progress = 0,
  statusStage = 'idle',
  errorMessage = null
}: ImageGenerationProps) => {

  return (
    <section className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-neutral-600 mb-4">Step 5 - Generate Images</h2>
      <div className="space-y-4">
        {(isGenerating || progress > 0) && (
          <ProgressIndicator 
            progress={progress} 
            statusStage={statusStage as ProgressStage} 
            errorMessage={errorMessage} 
          />
        )}
        
        <button 
          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 rounded-md transition-colors duration-200 text-lg font-medium flex items-center justify-center"
          onClick={onGenerate}
          disabled={isGenerating}
        >
          <i className="mdi mdi-image-multiple mr-2"></i>
          Generate Images
        </button>
        
        <div className="bg-neutral-50 p-4 rounded-md border border-neutral-200 mt-4">
          <h3 className="font-medium mb-2 text-neutral-600">What happens when you click "Generate Images":</h3>
          <ol className="list-decimal list-inside text-sm text-neutral-500 space-y-1">
            <li>Process data from spreadsheet input</li>
            <li>Generate images with selected AI model</li>
            <li>Upload images to selected cloud storage</li>
            <li>Publish images to your WordPress site</li>
            <li>Store metadata in database for tracking</li>
          </ol>
        </div>
      </div>
    </section>
  );
};

export default ImageGeneration;
