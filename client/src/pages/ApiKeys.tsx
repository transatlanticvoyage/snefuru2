import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Check, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

interface ApiKeysState {
  openai: string;
  dropbox: string;
  midjourney: string;
  gemini: string;
  wordpress: {
    url: string;
    username: string;
    password: string;
  };
}

interface User {
  id: number;
  username: string;
  email: string;
  api_keys?: ApiKeysState;
}

export default function ApiKeysPage() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  
  // API Keys state
  const [openaiApiKey, setOpenaiApiKey] = useState('');
  const [dropboxApiKey, setDropboxApiKey] = useState('');
  const [midjourneyApiKey, setMidjourneyApiKey] = useState('');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  
  // WordPress credentials
  const [wordpressUrl, setWordpressUrl] = useState('');
  const [wordpressUsername, setWordpressUsername] = useState('');
  const [wordpressPassword, setWordpressPassword] = useState('');
  
  // Load user data from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    
    try {
      const userData = JSON.parse(storedUser) as User;
      setUser(userData);
      
      // Load API keys if they exist
      if (userData.api_keys) {
        setOpenaiApiKey(userData.api_keys.openai || '');
        setDropboxApiKey(userData.api_keys.dropbox || '');
        setMidjourneyApiKey(userData.api_keys.midjourney || '');
        setGeminiApiKey(userData.api_keys.gemini || '');
        
        // Load WordPress credentials
        setWordpressUrl(userData.api_keys.wordpress?.url || '');
        setWordpressUsername(userData.api_keys.wordpress?.username || '');
        setWordpressPassword(userData.api_keys.wordpress?.password || '');
      }
    } catch (error) {
      console.error('Failed to parse user data:', error);
      navigate('/login');
    }
  }, [navigate]);
  
  const handleSaveApiKeys = () => {
    if (!user) return;
    
    setIsSaving(true);
    
    try {
      // Create updated API keys object
      const apiKeys: ApiKeysState = {
        openai: openaiApiKey,
        dropbox: dropboxApiKey,
        midjourney: midjourneyApiKey,
        gemini: geminiApiKey,
        wordpress: {
          url: wordpressUrl,
          username: wordpressUsername,
          password: wordpressPassword,
        }
      };
      
      // Update user data with API keys
      const updatedUser = {
        ...user,
        api_keys: apiKeys
      };
      
      // Save to localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Show success message
      toast({
        title: 'API Keys Saved',
        description: 'Your API keys have been saved successfully.',
      });
      
      // Update state
      setUser(updatedUser);
    } catch (error) {
      console.error('Error saving API keys:', error);
      toast({
        title: 'Save Failed',
        description: 'Failed to save your API keys. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-neutral-50">
        <p>Loading API keys...</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            className="mr-2"
            onClick={() => navigate('/')}
          >
            &larr; Back to Home
          </Button>
          <h1 className="text-2xl font-bold">API Keys</h1>
        </div>
        
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertTitle>Important</AlertTitle>
          <AlertDescription>
            Your API keys are stored securely in your browser's local storage and are only accessible by you.
            These keys will be used to generate images and access cloud storage services on your behalf.
          </AlertDescription>
        </Alert>
        
        <Tabs defaultValue="ai-services">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="ai-services">AI Services</TabsTrigger>
            <TabsTrigger value="publishing">Publishing Services</TabsTrigger>
          </TabsList>
          
          <TabsContent value="ai-services">
            <Card>
              <CardHeader>
                <CardTitle>AI Services API Keys</CardTitle>
                <CardDescription>
                  Add your API keys for AI image generation services.
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* OpenAI API Key */}
                <div className="space-y-2">
                  <Label htmlFor="openai-api-key" className="text-base font-semibold">
                    OpenAI API Key
                  </Label>
                  <Input
                    id="openai-api-key"
                    type="password"
                    placeholder="sk-..."
                    value={openaiApiKey}
                    onChange={(e) => setOpenaiApiKey(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Used for generating images with DALL-E models.
                    <a 
                      href="https://platform.openai.com/api-keys" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary ml-1 hover:underline"
                    >
                      Get your OpenAI API key
                    </a>
                  </p>
                </div>
                
                <Separator />
                
                {/* Midjourney API Key */}
                <div className="space-y-2">
                  <Label htmlFor="midjourney-api-key" className="text-base font-semibold">
                    Midjourney API Key
                  </Label>
                  <Input
                    id="midjourney-api-key"
                    type="password"
                    placeholder="mj-..."
                    value={midjourneyApiKey}
                    onChange={(e) => setMidjourneyApiKey(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Required for accessing Midjourney image generation.
                  </p>
                </div>
                
                <Separator />
                
                {/* Google Gemini API Key */}
                <div className="space-y-2">
                  <Label htmlFor="gemini-api-key" className="text-base font-semibold">
                    Google Gemini API Key
                  </Label>
                  <Input
                    id="gemini-api-key"
                    type="password"
                    placeholder="AIza..."
                    value={geminiApiKey}
                    onChange={(e) => setGeminiApiKey(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Used for generating images with Google's Gemini model.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="publishing">
            <div className="grid grid-cols-1 gap-6">
              {/* Dropbox API Key */}
              <Card>
                <CardHeader>
                  <CardTitle>Dropbox API Key</CardTitle>
                  <CardDescription>
                    Add your Dropbox API key to enable cloud storage.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="dropbox-api-key" className="text-base font-semibold">
                      Dropbox Access Token
                    </Label>
                    <Input
                      id="dropbox-api-key"
                      type="password"
                      placeholder="sl...."
                      value={dropboxApiKey}
                      onChange={(e) => setDropboxApiKey(e.target.value)}
                    />
                    <p className="text-sm text-muted-foreground">
                      Used for storing generated images in your Dropbox account.
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              {/* WordPress API Connection */}
              <Card>
                <CardHeader>
                  <CardTitle>WordPress Connection</CardTitle>
                  <CardDescription>
                    Connect your WordPress site to publish images directly.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="wordpress-url" className="text-base font-semibold">
                      WordPress Site URL
                    </Label>
                    <Input
                      id="wordpress-url"
                      placeholder="https://your-site.com"
                      value={wordpressUrl}
                      onChange={(e) => setWordpressUrl(e.target.value)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="wordpress-username" className="text-base font-semibold">
                        WordPress Username
                      </Label>
                      <Input
                        id="wordpress-username"
                        placeholder="Your username"
                        value={wordpressUsername}
                        onChange={(e) => setWordpressUsername(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="wordpress-password" className="text-base font-semibold">
                        Application Password
                      </Label>
                      <Input
                        id="wordpress-password"
                        type="password"
                        placeholder="xxxx xxxx xxxx xxxx"
                        value={wordpressPassword}
                        onChange={(e) => setWordpressPassword(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>WordPress Authentication</AlertTitle>
                    <AlertDescription>
                      Use an Application Password for better security. 
                      <a 
                        href="https://make.wordpress.org/core/2020/11/05/application-passwords-integration-guide/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary ml-1 hover:underline"
                      >
                        Learn how to create one
                      </a>
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="mt-6 flex justify-end">
          <Button
            onClick={handleSaveApiKeys}
            disabled={isSaving}
            className="flex items-center"
          >
            {isSaving ? (
              'Saving...'
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" /> Save All API Keys
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}