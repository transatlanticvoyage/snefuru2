import { useEffect, useRef, useState } from "react";

interface ImageGenerationProps {
  onGenerate: () => void;
  isGenerating: boolean;
}

// Status stages for more detailed progress messages
type StatusStage = 
  | 'connecting'   // 0-15%
  | 'generating'   // 15-50%
  | 'saving'       // 50-75% 
  | 'publishing'   // 75-90%
  | 'completed'    // 100%
  | 'failed'       // error state
  | 'idle';        // not running

const ImageGeneration = ({ onGenerate, isGenerating }: ImageGenerationProps) => {
  const [progress, setProgress] = useState(0);
  const [statusStage, setStatusStage] = useState<StatusStage>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const progressIntervalRef = useRef<number | null>(null);
  
  // Handle errors from generation process
  useEffect(() => {
    if (!isGenerating && progress > 0) {
      const urlParams = new URLSearchParams(window.location.search);
      const errorParam = urlParams.get('error');
      if (errorParam) {
        setErrorMessage(decodeURIComponent(errorParam));
        // Remove the parameter after reading it
        urlParams.delete('error');
        const newUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '');
        window.history.replaceState({}, '', newUrl);
      }
    }
  }, [isGenerating, progress]);

  useEffect(() => {
    if (isGenerating) {
      // Reset error state when starting a new generation
      setErrorMessage(null);
      
      // Start simulated progress bar with distinct phases
      let currentProgress = 0;
      setStatusStage('connecting');
      
      progressIntervalRef.current = window.setInterval(() => {
        // Update progress and status message based on current progress
        if (currentProgress < 15) {
          // Connecting to OpenAI phase
          setStatusStage('connecting');
          currentProgress += 2;
        } 
        else if (currentProgress < 50) {
          // Generating images phase
          setStatusStage('generating');
          currentProgress += 3;
        }
        else if (currentProgress < 75) {
          // Saving to Dropbox phase
          setStatusStage('saving');
          currentProgress += 2;
        }
        else if (currentProgress < 90) {
          // Publishing to WordPress phase
          setStatusStage('publishing');
          currentProgress += 1;
        }
        
        setProgress(Math.min(90, currentProgress));
      }, 200);
    } else {
      // When isGenerating becomes false, either generation is complete or errored
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      
      // If we were previously generating, set to 100% complete
      if (progress > 0) {
        // If we had an error, don't show completed
        if (!errorMessage) {
          setProgress(100);
          setStatusStage('completed');
        } else {
          setStatusStage('failed');
        }
        
        // Reset progress after a delay to allow the user to see the completed progress
        const resetTimeout = setTimeout(() => {
          setProgress(0);
          setStatusStage('idle');
        }, 3000);
        
        return () => clearTimeout(resetTimeout);
      }
    }
    
    // Cleanup interval on unmount
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [isGenerating, progress, errorMessage]);

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
            <p className="text-sm mt-1 font-medium" style={{ color: statusStage === 'failed' ? '#e11d48' : '#6b7280' }}>
              {statusStage === 'connecting' && 'Attempting to connect to OpenAI...'}
              {statusStage === 'generating' && 'Generating images with OpenAI...'}
              {statusStage === 'saving' && 'Saving images to Dropbox...'}
              {statusStage === 'publishing' && 'Publishing images to WordPress...'}
              {statusStage === 'completed' && 'Task completed successfully.'}
              {statusStage === 'failed' && `Task failed${errorMessage ? `: ${errorMessage}` : '.'}`}
            </p>
          </div>
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
