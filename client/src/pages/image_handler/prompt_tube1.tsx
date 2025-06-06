import React, { useState } from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

const PromptTube: React.FC = () => {
  useDocumentTitle("Prompt Tube - Snefuru");
  // Generate initial content with numbers 1-300, each on a new line
  const generateInitialContent = () => {
    let content = '';
    for (let i = 1; i <= 300; i++) {
      content += i + '\n';
    }
    return content;
  };

  const [textContent, setTextContent] = useState(generateInitialContent());
  const [isSaving, setIsSaving] = useState(false);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextContent(e.target.value);
  };

  const handleSave = () => {
    setIsSaving(true);

    // Simulate saving process
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Success",
        description: "Your prompts have been saved successfully.",
      });
    }, 800);
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header pageTitle="Prompt Tube" />

      <div className="container mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-800">Prompt Collection</h1>
            <Button 
              onClick={handleSave}
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSaving ? 'Saving...' : 'Save Prompts'}
            </Button>
          </div>

          {/* Green Google Sheets Button */}
          <div className="mb-6">
            <a 
              href="https://docs.google.com/spreadsheets/d/1-yPm-uFuGmij7hjJyuew--DBLZgJ4uuWD6V2On1zYZo/edit?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
            >
              <Button className="bg-green-600 hover:bg-green-700 text-white text-lg px-8 py-3">
                &gt;&gt; Go To The Google Sheet &lt;&lt; (Recommended)
              </Button>
            </a>
          </div>

          <div className="mb-2 text-sm text-gray-500">
            Enter your prompts below, one per line:
          </div>

          {/* Large text editor area */}
          <div className="border border-gray-200 rounded-md">
            <textarea
              className="w-full h-[70vh] p-4 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md"
              value={textContent}
              onChange={handleTextChange}
              spellCheck={false}
            />
          </div>

          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {textContent.split('\n').length} lines
            </div>
            <Button 
              onClick={handleSave}
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSaving ? 'Saving...' : 'Save Prompts'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptTube;