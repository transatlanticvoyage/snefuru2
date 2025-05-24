import { useEffect, useRef, useState } from "react";

interface ImageGenerationProps {
  onGenerate: () => void;
  isGenerating: boolean;
}

const ImageGeneration = ({ onGenerate, isGenerating }: ImageGenerationProps) => {
  const [progress, setProgress] = useState(0);
  const progressIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isGenerating) {
      // Start simulated progress bar when generation starts
      let currentProgress = 0;
      
      progressIntervalRef.current = window.setInterval(() => {
        // Increment progress more slowly as it gets closer to 90%
        // We don't go to 100% until we actually complete the task
        const increment = currentProgress < 50 ? 5 : 
                          currentProgress < 80 ? 2 : 1;
        
        currentProgress = Math.min(90, currentProgress + increment);
        setProgress(currentProgress);
      }, 200);
    } else {
      // When isGenerating becomes false, either generation is complete or errored
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      
      // If we were previously generating, set to 100% complete
      if (progress > 0) {
        setProgress(100);
        
        // Reset progress after a delay to allow the user to see the completed progress
        const resetTimeout = setTimeout(() => {
          setProgress(0);
        }, 1500);
        
        return () => clearTimeout(resetTimeout);
      }
    }
    
    // Cleanup interval on unmount
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [isGenerating, progress]);

  return (
    <section className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-neutral-600 mb-4">Step 5 - Generate Images</h2>
      <div className="space-y-4">
        {(isGenerating || progress > 0) && (
          <div>
            <div className="w-full bg-neutral-100 rounded-full h-6 overflow-hidden">
              <div 
                className="bg-primary-500 h-full transition-all duration-300 rounded-full" 
                style={{ width: `${progress}%` }} 
                role="progressbar" 
                aria-valuenow={progress} 
                aria-valuemin={0} 
                aria-valuemax={100}
              ></div>
            </div>
            <p className="text-sm text-neutral-400 mt-1">Processing images and publishing to WordPress...</p>
          </div>
        )}
        
        <button 
          className="w-full bg-warning-500 hover:bg-warning-600 text-white py-3 px-4 rounded-md transition-colors duration-200 text-lg font-medium flex items-center justify-center"
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
