import { useState } from "react";
import SpreadsheetInput from "@/components/SpreadsheetInput";
import ModelSelection from "@/components/ModelSelection";
import StorageSelection from "@/components/StorageSelection";
import WordPressConnection from "@/components/WordPressConnection";
import ImageGeneration from "@/components/ImageGeneration";
import ProgressIndicator, { ProgressStage } from "@/components/ProgressIndicator";
import UserLoginStatus from "@/components/UserLoginStatus";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import type { SpreadsheetRow, WpCredentials } from "@shared/schema";

export default function Home() {
  const [spreadsheetData, setSpreadsheetData] = useState<SpreadsheetRow[]>([]);
  const [selectedAiModel, setSelectedAiModel] = useState<string | null>(null);
  const [selectedStorage, setSelectedStorage] = useState<string | null>(null);
  const [wpCredentials, setWpCredentials] = useState<WpCredentials>({
    url: "",
    username: "",
    password: "",
    post_id: "",
    mapping_key: "",
  });
  const [wpInfoSaved, setWpInfoSaved] = useState(false);
  
  // Shared progress tracking state for both progress indicators
  const [generationProgress, setGenerationProgress] = useState(0);
  const [progressStage, setProgressStage] = useState<ProgressStage>('idle');
  const [progressError, setProgressError] = useState<string | null>(null);
  
  const { toast } = useToast();

  const { mutate: generateImages, isPending, error: generationError } = useMutation({
    mutationFn: async () => {
      // Reset and start progress indicator
      setGenerationProgress(0);
      setProgressStage('connecting');
      setProgressError(null);
      
      // Start a progress simulation for visual feedback
      let currentProgress = 0;
      const progressInterval = setInterval(() => {
        if (currentProgress < 15) {
          // Connecting to OpenAI phase
          setProgressStage('connecting');
          currentProgress += 2;
        } 
        else if (currentProgress < 50) {
          // Generating images phase
          setProgressStage('generating');
          currentProgress += 3;
        }
        else if (currentProgress < 75) {
          // Saving to cloud storage phase
          setProgressStage('saving');
          currentProgress += 2;
        }
        else if (currentProgress < 90) {
          // Publishing to WordPress phase
          setProgressStage('publishing');
          currentProgress += 1;
        }
        
        setGenerationProgress(Math.min(90, currentProgress));
      }, 200);
      
      try {
        const response = await apiRequest("POST", "/api/generate", {
          spreadsheetData,
          aiModel: selectedAiModel,
          storageService: selectedStorage,
          wpCredentials,
        });
        
        // Success - clear interval and set to 100%
        clearInterval(progressInterval);
        setGenerationProgress(100);
        setProgressStage('completed');
        
        // Reset progress after delay
        setTimeout(() => {
          setGenerationProgress(0);
          setProgressStage('idle');
        }, 3000);
        
        return response.json();
      } catch (error) {
        // Error - clear interval and show error
        clearInterval(progressInterval);
        setProgressStage('failed');
        if (error instanceof Error) {
          setProgressError(error.message);
        } else {
          setProgressError('Unknown error occurred');
        }
        throw error;
      }
    },
    onSuccess: (data) => {
      toast({
        title: "Success!",
        description: `Generated ${data.count} images and published to ${data.publishedToWordPress ? 'WordPress' : 'Dropbox'}.`,
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate images. Please check your API keys and try again.",
        variant: "destructive",
      });
      
      // Make sure progress indicator shows error state
      setProgressStage('failed');
      setProgressError(error.message || "Generation failed");
    },
  });

  const saveWpInfo = () => {
    if (!wpCredentials.url || !wpCredentials.username || !wpCredentials.password) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required WordPress fields",
        variant: "destructive",
      });
      return;
    }
    
    setWpInfoSaved(true);
    toast({
      title: "WordPress credentials saved",
      description: "Your WordPress site information has been saved",
    });
  };

  const handleGenerateImages = () => {
    // Validate required fields before generation
    if (!spreadsheetData.length) {
      toast({
        title: "No data",
        description: "Please paste spreadsheet data first",
        variant: "destructive",
      });
      return;
    }

    if (!selectedAiModel) {
      toast({
        title: "No AI model selected",
        description: "Please select an AI model to use",
        variant: "destructive",
      });
      return;
    }

    if (!selectedStorage) {
      toast({
        title: "No storage selected",
        description: "Please select where to store the images",
        variant: "destructive",
      });
      return;
    }

    // WordPress info is completely optional - no validation needed
    // We'll automatically save any WordPress credentials if they exist
    if (wpCredentials.url && wpCredentials.username && wpCredentials.password && !wpInfoSaved) {
      // Auto-save WordPress credentials
      setWpInfoSaved(true);
    }

    generateImages();
  };

  return (
    <div className="font-sans bg-neutral-50 text-neutral-500 min-h-screen">
      {/* Full-width header */}
      <header className="w-full bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-semibold text-neutral-600 flex items-center">
              <span className="mr-2">Snefuru</span>
              <span className="text-base text-neutral-400 font-normal">AI Image Generation & Management</span>
            </h1>
            
            <div className="flex items-center space-x-4">
              {/* User Login Status */}
              <UserLoginStatus />
              
              {/* Quick Generate Button */}
              <button 
                className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-md transition-colors duration-200 font-medium flex items-center"
                onClick={handleGenerateImages}
                disabled={isPending}
              >
                <i className="mdi mdi-image-multiple mr-2"></i>
                {isPending ? 'Generating...' : 'Generate Images'}
              </button>
            </div>
          </div>
          
          {/* Header Progress Bar */}
          {(isPending || generationProgress > 0) && (
            <div className="mt-4">
              <ProgressIndicator 
                progress={generationProgress} 
                statusStage={progressStage} 
                errorMessage={progressError} 
              />
            </div>
          )}
        </div>
      </header>

      {/* Spreadsheet section - 100% width */}
      <div className="w-full py-6 bg-neutral-50">
        <div className="w-full px-4">
          <SpreadsheetInput onDataUpdate={setSpreadsheetData} />
        </div>
      </div>
      
      {/* Other content - standard width */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Main Content */}
        <main className="space-y-8">
          <ModelSelection onSelect={setSelectedAiModel} />
          <StorageSelection onSelect={setSelectedStorage} />
          <WordPressConnection 
            credentials={wpCredentials} 
            onCredentialsChange={setWpCredentials} 
            onSave={saveWpInfo} 
          />
          <ImageGeneration 
            onGenerate={handleGenerateImages} 
            isGenerating={isPending}
            progress={generationProgress}
            statusStage={progressStage}
            errorMessage={progressError}
          />
        </main>

        {/* Footer */}
        <footer className="mt-8 text-center text-sm text-neutral-400">
          <p>Snefuru - AI Image Generation & Management Tool</p>
        </footer>
      </div>
    </div>
  );
}
