import { useState } from "react";
import SpreadsheetInput from "@/components/SpreadsheetInput";
import ModelSelection from "@/components/ModelSelection";
import StorageSelection from "@/components/StorageSelection";
import WordPressConnection from "@/components/WordPressConnection";
import ImageGeneration from "@/components/ImageGeneration";
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
  const { toast } = useToast();

  const { mutate: generateImages, isPending } = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/generate", {
        spreadsheetData,
        aiModel: selectedAiModel,
        storageService: selectedStorage,
        wpCredentials,
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success!",
        description: `Generated ${data.count} images and published to WordPress.`,
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate images",
        variant: "destructive",
      });
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

    // WordPress info is optional - only validate if info was entered but not saved
    if ((wpCredentials.url || wpCredentials.username || wpCredentials.password) && !wpInfoSaved) {
      toast({
        title: "WordPress info not saved",
        description: "Please save your WordPress credentials or clear the fields",
        variant: "destructive",
      });
      return;
    }

    generateImages();
  };

  return (
    <div className="font-sans bg-neutral-50 text-neutral-500 min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-semibold text-neutral-600 flex items-center">
            <span className="mr-2">Snefuru</span>
            <span className="text-base text-neutral-400 font-normal">AI Image Generation & Management</span>
          </h1>
        </header>

        {/* Main Content */}
        <main className="space-y-8">
          <SpreadsheetInput onDataUpdate={setSpreadsheetData} />
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
