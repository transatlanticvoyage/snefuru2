import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Check, Info, Edit, Save, Lock } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';

interface ApiKeysState {
  openai: string;
  dropbox: string;
  midjourney: string;
  gemini: string;
  googledrive: {
    clientId: string;
    clientSecret: string;
    refreshToken: string;
  };
  amazons3: {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
    bucketName: string;
  };
  dataforseo: {
    login: string;
    password: string;
  };
  wordpress: {
    url: string;
    username: string;
    password: string;
  };
  airtable: {
    apiKey: string;
    baseId: string;
    tableId: string;
  };
  notion: {
    integrationSecret: string;
    pageUrl: string;
  };
  webScraping: {
    scraperapi: {
      apiKey: string;
    };
    oxylabs: {
      username: string;
      password: string;
    };
    brightdata: {
      username: string;
      password: string;
      endpoint: string;
    };
  };
}

interface User {
  id: number;
  username: string;
  email: string;
  api_keys?: ApiKeysState;
}

export default function ApiKeysPage() {
  useDocumentTitle("API Keys");
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  
  // API Keys state
  const [openaiApiKey, setOpenaiApiKey] = useState('');
  const [dropboxApiKey, setDropboxApiKey] = useState('');
  const [midjourneyApiKey, setMidjourneyApiKey] = useState('');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  
  // Edit mode state for each field
  const [openaiEditMode, setOpenaiEditMode] = useState(false);
  const [dropboxEditMode, setDropboxEditMode] = useState(false);
  const [midjourneyEditMode, setMidjourneyEditMode] = useState(false);
  const [geminiEditMode, setGeminiEditMode] = useState(false);
  
  // Google Drive credentials
  const [googleDriveClientId, setGoogleDriveClientId] = useState('');
  const [googleDriveClientSecret, setGoogleDriveClientSecret] = useState('');
  const [googleDriveRefreshToken, setGoogleDriveRefreshToken] = useState('');
  const [googleDriveEditMode, setGoogleDriveEditMode] = useState(false);
  
  // Amazon S3 credentials
  const [amazonS3AccessKeyId, setAmazonS3AccessKeyId] = useState('');
  const [amazonS3SecretAccessKey, setAmazonS3SecretAccessKey] = useState('');
  const [amazonS3Region, setAmazonS3Region] = useState('');
  const [amazonS3BucketName, setAmazonS3BucketName] = useState('');
  const [amazonS3EditMode, setAmazonS3EditMode] = useState(false);
  
  // DataForSEO credentials
  const [dataforseoLogin, setDataforseoLogin] = useState('');
  const [dataforseoPassword, setDataforseoPassword] = useState('');
  const [dataforseoEditMode, setDataforseoEditMode] = useState(false);
  
  // WordPress credentials
  const [wordpressUrl, setWordpressUrl] = useState('');
  const [wordpressUsername, setWordpressUsername] = useState('');
  const [wordpressPassword, setWordpressPassword] = useState('');
  const [wordpressEditMode, setWordpressEditMode] = useState(false);

  // Airtable credentials
  const [airtableApiKey, setAirtableApiKey] = useState('');
  const [airtableBaseId, setAirtableBaseId] = useState('');
  const [airtableTableId, setAirtableTableId] = useState('');
  const [airtableEditMode, setAirtableEditMode] = useState(false);

  // Notion credentials
  const [notionIntegrationSecret, setNotionIntegrationSecret] = useState('');
  const [notionPageUrl, setNotionPageUrl] = useState('');
  const [notionEditMode, setNotionEditMode] = useState(false);
  
  // Web Scraping API credentials
  const [scraperapiKey, setScraperapiKey] = useState('');
  const [scraperapiEditMode, setScraperapiEditMode] = useState(false);
  const [oxylabsUsername, setOxylabsUsername] = useState('');
  const [oxylabsPassword, setOxylabsPassword] = useState('');
  const [oxylabsEditMode, setOxylabsEditMode] = useState(false);
  const [brightdataUsername, setBrightdataUsername] = useState('');
  const [brightdataPassword, setBrightdataPassword] = useState('');
  const [brightdataEndpoint, setBrightdataEndpoint] = useState('');
  const [brightdataEditMode, setBrightdataEditMode] = useState(false);
  
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
        // Load API keys
        setOpenaiApiKey(userData.api_keys.openai || '');
        setDropboxApiKey(userData.api_keys.dropbox || '');
        setMidjourneyApiKey(userData.api_keys.midjourney || '');
        setGeminiApiKey(userData.api_keys.gemini || '');
        
        // Set edit mode to false for fields that have values
        setOpenaiEditMode(!userData.api_keys.openai);
        setDropboxEditMode(!userData.api_keys.dropbox);
        setMidjourneyEditMode(!userData.api_keys.midjourney);
        setGeminiEditMode(!userData.api_keys.gemini);
        
        // Load Google Drive credentials
        if (userData.api_keys.googledrive) {
          setGoogleDriveClientId(userData.api_keys.googledrive.clientId || '');
          setGoogleDriveClientSecret(userData.api_keys.googledrive.clientSecret || '');
          setGoogleDriveRefreshToken(userData.api_keys.googledrive.refreshToken || '');
          setGoogleDriveEditMode(!(userData.api_keys.googledrive.clientId || userData.api_keys.googledrive.clientSecret));
        }
        
        // Load Amazon S3 credentials
        if (userData.api_keys.amazons3) {
          setAmazonS3AccessKeyId(userData.api_keys.amazons3.accessKeyId || '');
          setAmazonS3SecretAccessKey(userData.api_keys.amazons3.secretAccessKey || '');
          setAmazonS3Region(userData.api_keys.amazons3.region || '');
          setAmazonS3BucketName(userData.api_keys.amazons3.bucketName || '');
          setAmazonS3EditMode(!(userData.api_keys.amazons3.accessKeyId || userData.api_keys.amazons3.secretAccessKey));
        }
        
        // Load DataForSEO credentials
        if (userData.api_keys.dataforseo) {
          setDataforseoLogin(userData.api_keys.dataforseo.login || '');
          setDataforseoPassword(userData.api_keys.dataforseo.password || '');
          setDataforseoEditMode(!(userData.api_keys.dataforseo.login || userData.api_keys.dataforseo.password));
        }
        
        // Load WordPress credentials
        if (userData.api_keys.wordpress) {
          setWordpressUrl(userData.api_keys.wordpress.url || '');
          setWordpressUsername(userData.api_keys.wordpress.username || '');
          setWordpressPassword(userData.api_keys.wordpress.password || '');
          setWordpressEditMode(!(userData.api_keys.wordpress.url || userData.api_keys.wordpress.username));
        }
        
        // Load Web Scraping API credentials
        if (userData.api_keys.webScraping) {
          if (userData.api_keys.webScraping.scraperapi) {
            setScraperapiKey(userData.api_keys.webScraping.scraperapi.apiKey || '');
            setScraperapiEditMode(!userData.api_keys.webScraping.scraperapi.apiKey);
          }
          if (userData.api_keys.webScraping.oxylabs) {
            setOxylabsUsername(userData.api_keys.webScraping.oxylabs.username || '');
            setOxylabsPassword(userData.api_keys.webScraping.oxylabs.password || '');
            setOxylabsEditMode(!(userData.api_keys.webScraping.oxylabs.username || userData.api_keys.webScraping.oxylabs.password));
          }
          if (userData.api_keys.webScraping.brightdata) {
            setBrightdataUsername(userData.api_keys.webScraping.brightdata.username || '');
            setBrightdataPassword(userData.api_keys.webScraping.brightdata.password || '');
            setBrightdataEndpoint(userData.api_keys.webScraping.brightdata.endpoint || '');
            setBrightdataEditMode(!(userData.api_keys.webScraping.brightdata.username || userData.api_keys.webScraping.brightdata.password));
          }
        }
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
        googledrive: {
          clientId: googleDriveClientId,
          clientSecret: googleDriveClientSecret,
          refreshToken: googleDriveRefreshToken,
        },
        amazons3: {
          accessKeyId: amazonS3AccessKeyId,
          secretAccessKey: amazonS3SecretAccessKey,
          region: amazonS3Region,
          bucketName: amazonS3BucketName,
        },
        dataforseo: {
          login: dataforseoLogin,
          password: dataforseoPassword,
        },
        wordpress: {
          url: wordpressUrl,
          username: wordpressUsername,
          password: wordpressPassword,
        },
        webScraping: {
          scraperapi: {
            apiKey: scraperapiKey,
          },
          oxylabs: {
            username: oxylabsUsername,
            password: oxylabsPassword,
          },
          brightdata: {
            username: brightdataUsername,
            password: brightdataPassword,
            endpoint: brightdataEndpoint,
          },
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
  
  // Individual field save handlers
  const handleSaveOpenAI = () => {
    if (!user) return;
    
    try {
      const updatedApiKeys = {
        ...user.api_keys,
        openai: openaiApiKey,
      };
      
      // Update user data
      const updatedUser = {
        ...user,
        api_keys: updatedApiKeys
      };
      
      // Save to localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Show success message
      toast({
        title: 'OpenAI API Key Saved',
        description: 'Your OpenAI API key has been saved successfully.',
      });
      
      // Update state
      setUser(updatedUser);
      setOpenaiEditMode(false);
    } catch (error) {
      console.error('Error saving OpenAI API key:', error);
      toast({
        title: 'Save Failed',
        description: 'Failed to save your OpenAI API key. Please try again.',
        variant: 'destructive'
      });
    }
  };
  
  // Helper function to create a handler for saving individual keys
  const createSaveHandler = (
    key: string,
    value: string | object,
    setEditMode: (value: boolean) => void,
    keyName: string
  ) => {
    return () => {
      if (!user || !user.api_keys) return;
      
      try {
        // Create updated API keys object
        const updatedApiKeys = {
          ...user.api_keys,
          [key]: value
        };
        
        // Update user data
        const updatedUser = {
          ...user,
          api_keys: updatedApiKeys
        };
        
        // Save to localStorage
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Show success message
        toast({
          title: `${keyName} Saved`,
          description: `Your ${keyName} has been saved successfully.`,
        });
        
        // Update state
        setUser(updatedUser);
        setEditMode(false);
      } catch (error) {
        console.error(`Error saving ${keyName}:`, error);
        toast({
          title: 'Save Failed',
          description: `Failed to save your ${keyName}. Please try again.`,
          variant: 'destructive'
        });
      }
    };
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-neutral-50">
        <p>Loading API keys...</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-neutral-50">
      <Header pageTitle="API Keys" />
      
      <div className="container mx-auto px-4 max-w-4xl py-8">
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
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="ai-services">AI Services</TabsTrigger>
            <TabsTrigger value="publishing">Publishing Services</TabsTrigger>
            <TabsTrigger value="task-management">Task Management</TabsTrigger>
            <TabsTrigger value="web-scraping">Web Scraping APIs</TabsTrigger>
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
                  <div className="flex justify-between items-center">
                    <Label htmlFor="openai-api-key" className="text-base font-semibold">
                      OpenAI API Key
                    </Label>
                    <div className="flex space-x-2">
                      {!openaiEditMode && openaiApiKey && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 px-2 text-xs"
                          onClick={() => setOpenaiEditMode(true)}
                        >
                          <Edit className="h-3.5 w-3.5 mr-1" />
                          Edit
                        </Button>
                      )}
                      {openaiEditMode && (
                        <Button 
                          variant="default" 
                          size="sm"
                          className="h-8 px-2 text-xs"
                          onClick={handleSaveOpenAI}
                        >
                          <Save className="h-3.5 w-3.5 mr-1" />
                          Save
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {openaiEditMode ? (
                    <Input
                      id="openai-api-key"
                      type="password"
                      placeholder="sk-..."
                      value={openaiApiKey}
                      onChange={(e) => setOpenaiApiKey(e.target.value)}
                    />
                  ) : (
                    <div className="flex items-center h-10 px-3 py-2 text-sm border rounded-md bg-muted">
                      {openaiApiKey ? (
                        <div className="flex items-center text-muted-foreground">
                          <Lock className="h-3.5 w-3.5 mr-2" />
                          {openaiApiKey.substring(0, 3)}...{openaiApiKey.substring(openaiApiKey.length - 4)}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">No API key set</span>
                      )}
                    </div>
                  )}
                  
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
              {/* DataForSEO API Credentials */}
              <Card>
                <CardHeader>
                  <CardTitle>DataForSEO API Credentials</CardTitle>
                  <CardDescription>
                    Add your DataForSEO credentials to track keyword rankings.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dataforseo-login" className="text-base font-semibold">
                        DataForSEO API Login
                      </Label>
                      <Input
                        id="dataforseo-login"
                        placeholder="your-email@example.com"
                        value={dataforseoLogin}
                        onChange={(e) => setDataforseoLogin(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="dataforseo-password" className="text-base font-semibold">
                        DataForSEO API Password
                      </Label>
                      <Input
                        id="dataforseo-password"
                        type="password"
                        placeholder="Your API password"
                        value={dataforseoPassword}
                        onChange={(e) => setDataforseoPassword(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    Used for keyword rank tracking and SEO data retrieval.
                    <a 
                      href="https://app.dataforseo.com/register" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary ml-1 hover:underline"
                    >
                      Get your DataForSEO API credentials
                    </a>
                  </p>
                </CardContent>
              </Card>
              
              {/* Google Drive API Keys */}
              <Card>
                <CardHeader>
                  <CardTitle>Google Drive API</CardTitle>
                  <CardDescription>
                    Add your Google Drive API credentials to enable cloud storage.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="google-drive-client-id" className="text-base font-semibold">
                        Client ID
                      </Label>
                      {!googleDriveEditMode && googleDriveClientId && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 px-2 text-xs"
                          onClick={() => setGoogleDriveEditMode(true)}
                        >
                          <Edit className="h-3.5 w-3.5 mr-1" />
                          Edit
                        </Button>
                      )}
                      {googleDriveEditMode && (
                        <Button 
                          variant="default" 
                          size="sm"
                          className="h-8 px-2 text-xs"
                          onClick={createSaveHandler(
                            'googledrive', 
                            {
                              clientId: googleDriveClientId,
                              clientSecret: googleDriveClientSecret,
                              refreshToken: googleDriveRefreshToken
                            },
                            setGoogleDriveEditMode,
                            'Google Drive API'
                          )}
                        >
                          <Save className="h-3.5 w-3.5 mr-1" />
                          Save
                        </Button>
                      )}
                    </div>
                    
                    {googleDriveEditMode ? (
                      <Input
                        id="google-drive-client-id"
                        placeholder="Client ID..."
                        value={googleDriveClientId}
                        onChange={(e) => setGoogleDriveClientId(e.target.value)}
                      />
                    ) : (
                      <div className="flex items-center h-10 px-3 py-2 text-sm border rounded-md bg-muted">
                        {googleDriveClientId ? (
                          <div className="flex items-center text-muted-foreground">
                            <Lock className="h-3.5 w-3.5 mr-2" />
                            {googleDriveClientId.substring(0, 3)}...{googleDriveClientId.substring(googleDriveClientId.length - 4)}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">No Client ID set</span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="google-drive-client-secret" className="text-base font-semibold">
                      Client Secret
                    </Label>
                    {googleDriveEditMode ? (
                      <Input
                        id="google-drive-client-secret"
                        type="password"
                        placeholder="Client Secret..."
                        value={googleDriveClientSecret}
                        onChange={(e) => setGoogleDriveClientSecret(e.target.value)}
                      />
                    ) : (
                      <div className="flex items-center h-10 px-3 py-2 text-sm border rounded-md bg-muted">
                        {googleDriveClientSecret ? (
                          <div className="flex items-center text-muted-foreground">
                            <Lock className="h-3.5 w-3.5 mr-2" />
                            {googleDriveClientSecret.substring(0, 3)}...{googleDriveClientSecret.substring(googleDriveClientSecret.length - 4)}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">No Client Secret set</span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="google-drive-refresh-token" className="text-base font-semibold">
                      Refresh Token
                    </Label>
                    {googleDriveEditMode ? (
                      <Input
                        id="google-drive-refresh-token"
                        type="password"
                        placeholder="Refresh Token..."
                        value={googleDriveRefreshToken}
                        onChange={(e) => setGoogleDriveRefreshToken(e.target.value)}
                      />
                    ) : (
                      <div className="flex items-center h-10 px-3 py-2 text-sm border rounded-md bg-muted">
                        {googleDriveRefreshToken ? (
                          <div className="flex items-center text-muted-foreground">
                            <Lock className="h-3.5 w-3.5 mr-2" />
                            {googleDriveRefreshToken.substring(0, 3)}...{googleDriveRefreshToken.substring(googleDriveRefreshToken.length - 4)}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">No Refresh Token set</span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    Used for storing generated images in your Google Drive account.
                    <a 
                      href="https://console.cloud.google.com/apis/credentials" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary ml-1 hover:underline"
                    >
                      Get your Google Drive API credentials
                    </a>
                  </p>
                </CardContent>
              </Card>
              
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
                    <div className="flex justify-between items-center">
                      <Label htmlFor="dropbox-api-key" className="text-base font-semibold">
                        Dropbox Access Token
                      </Label>
                      <div className="flex space-x-2">
                        {!dropboxEditMode && dropboxApiKey && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 px-2 text-xs"
                            onClick={() => setDropboxEditMode(true)}
                          >
                            <Edit className="h-3.5 w-3.5 mr-1" />
                            Edit
                          </Button>
                        )}
                        {dropboxEditMode && (
                          <Button 
                            variant="default" 
                            size="sm"
                            className="h-8 px-2 text-xs"
                            onClick={createSaveHandler('dropbox', dropboxApiKey, setDropboxEditMode, 'Dropbox API Key')}
                          >
                            <Save className="h-3.5 w-3.5 mr-1" />
                            Save
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {dropboxEditMode ? (
                      <Input
                        id="dropbox-api-key"
                        type="password"
                        placeholder="sl...."
                        value={dropboxApiKey}
                        onChange={(e) => setDropboxApiKey(e.target.value)}
                      />
                    ) : (
                      <div className="flex items-center h-10 px-3 py-2 text-sm border rounded-md bg-muted">
                        {dropboxApiKey ? (
                          <div className="flex items-center text-muted-foreground">
                            <Lock className="h-3.5 w-3.5 mr-2" />
                            {dropboxApiKey.substring(0, 3)}...{dropboxApiKey.substring(dropboxApiKey.length - 4)}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">No API key set</span>
                        )}
                      </div>
                    )}
                    
                    <p className="text-sm text-muted-foreground">
                      Used for storing generated images in your Dropbox account.
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              {/* Amazon S3 API Keys */}
              <Card>
                <CardHeader>
                  <CardTitle>Amazon S3</CardTitle>
                  <CardDescription>
                    Add your Amazon S3 credentials to enable cloud storage.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label className="text-base font-semibold">
                      Amazon S3 Credentials
                    </Label>
                    <div className="flex space-x-2">
                      {!amazonS3EditMode && amazonS3AccessKeyId && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 px-2 text-xs"
                          onClick={() => setAmazonS3EditMode(true)}
                        >
                          <Edit className="h-3.5 w-3.5 mr-1" />
                          Edit
                        </Button>
                      )}
                      {amazonS3EditMode && (
                        <Button 
                          variant="default" 
                          size="sm"
                          className="h-8 px-2 text-xs"
                          onClick={createSaveHandler(
                            'amazons3', 
                            {
                              accessKeyId: amazonS3AccessKeyId,
                              secretAccessKey: amazonS3SecretAccessKey,
                              region: amazonS3Region,
                              bucketName: amazonS3BucketName
                            },
                            setAmazonS3EditMode,
                            'Amazon S3 Credentials'
                          )}
                        >
                          <Save className="h-3.5 w-3.5 mr-1" />
                          Save
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="amazon-s3-access-key-id" className="text-base font-semibold">
                      Access Key ID
                    </Label>
                    {amazonS3EditMode ? (
                      <Input
                        id="amazon-s3-access-key-id"
                        placeholder="Access Key ID..."
                        value={amazonS3AccessKeyId}
                        onChange={(e) => setAmazonS3AccessKeyId(e.target.value)}
                      />
                    ) : (
                      <div className="flex items-center h-10 px-3 py-2 text-sm border rounded-md bg-muted">
                        {amazonS3AccessKeyId ? (
                          <div className="flex items-center text-muted-foreground">
                            <Lock className="h-3.5 w-3.5 mr-2" />
                            {amazonS3AccessKeyId.substring(0, 3)}...{amazonS3AccessKeyId.substring(amazonS3AccessKeyId.length - 4)}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">No Access Key ID set</span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="amazon-s3-secret-access-key" className="text-base font-semibold">
                      Secret Access Key
                    </Label>
                    {amazonS3EditMode ? (
                      <Input
                        id="amazon-s3-secret-access-key"
                        type="password"
                        placeholder="Secret Access Key..."
                        value={amazonS3SecretAccessKey}
                        onChange={(e) => setAmazonS3SecretAccessKey(e.target.value)}
                      />
                    ) : (
                      <div className="flex items-center h-10 px-3 py-2 text-sm border rounded-md bg-muted">
                        {amazonS3SecretAccessKey ? (
                          <div className="flex items-center text-muted-foreground">
                            <Lock className="h-3.5 w-3.5 mr-2" />
                            {amazonS3SecretAccessKey.substring(0, 3)}...{amazonS3SecretAccessKey.substring(amazonS3SecretAccessKey.length - 4)}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">No Secret Access Key set</span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="amazon-s3-region" className="text-base font-semibold">
                        Region
                      </Label>
                      {amazonS3EditMode ? (
                        <Input
                          id="amazon-s3-region"
                          placeholder="us-east-1"
                          value={amazonS3Region}
                          onChange={(e) => setAmazonS3Region(e.target.value)}
                        />
                      ) : (
                        <div className="flex items-center h-10 px-3 py-2 text-sm border rounded-md bg-muted">
                          {amazonS3Region ? (
                            <div className="flex items-center text-muted-foreground">
                              {amazonS3Region}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">No Region set</span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="amazon-s3-bucket-name" className="text-base font-semibold">
                        Bucket Name
                      </Label>
                      {amazonS3EditMode ? (
                        <Input
                          id="amazon-s3-bucket-name"
                          placeholder="my-bucket"
                          value={amazonS3BucketName}
                          onChange={(e) => setAmazonS3BucketName(e.target.value)}
                        />
                      ) : (
                        <div className="flex items-center h-10 px-3 py-2 text-sm border rounded-md bg-muted">
                          {amazonS3BucketName ? (
                            <div className="flex items-center text-muted-foreground">
                              {amazonS3BucketName}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">No Bucket Name set</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    Used for storing generated images in your Amazon S3 bucket.
                    <a 
                      href="https://aws.amazon.com/s3/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary ml-1 hover:underline"
                    >
                      Learn more about Amazon S3
                    </a>
                  </p>
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
                  <div className="flex justify-between items-center">
                    <Label className="text-base font-semibold">
                      WordPress Credentials
                    </Label>
                    <div className="flex space-x-2">
                      {!wordpressEditMode && wordpressUrl && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 px-2 text-xs"
                          onClick={() => setWordpressEditMode(true)}
                        >
                          <Edit className="h-3.5 w-3.5 mr-1" />
                          Edit
                        </Button>
                      )}
                      {wordpressEditMode && (
                        <Button 
                          variant="default" 
                          size="sm"
                          className="h-8 px-2 text-xs"
                          onClick={createSaveHandler(
                            'wordpress', 
                            {
                              url: wordpressUrl,
                              username: wordpressUsername,
                              password: wordpressPassword
                            },
                            setWordpressEditMode,
                            'WordPress Connection'
                          )}
                        >
                          <Save className="h-3.5 w-3.5 mr-1" />
                          Save
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="wordpress-url" className="text-base font-semibold">
                      WordPress Site URL
                    </Label>
                    {wordpressEditMode ? (
                      <Input
                        id="wordpress-url"
                        placeholder="https://your-site.com"
                        value={wordpressUrl}
                        onChange={(e) => setWordpressUrl(e.target.value)}
                      />
                    ) : (
                      <div className="flex items-center h-10 px-3 py-2 text-sm border rounded-md bg-muted">
                        {wordpressUrl ? (
                          <div className="flex items-center text-muted-foreground">
                            {wordpressUrl}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">No WordPress URL set</span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="wordpress-username" className="text-base font-semibold">
                        WordPress Username
                      </Label>
                      {wordpressEditMode ? (
                        <Input
                          id="wordpress-username"
                          placeholder="Your username"
                          value={wordpressUsername}
                          onChange={(e) => setWordpressUsername(e.target.value)}
                        />
                      ) : (
                        <div className="flex items-center h-10 px-3 py-2 text-sm border rounded-md bg-muted">
                          {wordpressUsername ? (
                            <div className="flex items-center text-muted-foreground">
                              {wordpressUsername}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">No Username set</span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="wordpress-password" className="text-base font-semibold">
                        Application Password
                      </Label>
                      {wordpressEditMode ? (
                        <Input
                          id="wordpress-password"
                          type="password"
                          placeholder="xxxx xxxx xxxx xxxx"
                          value={wordpressPassword}
                          onChange={(e) => setWordpressPassword(e.target.value)}
                        />
                      ) : (
                        <div className="flex items-center h-10 px-3 py-2 text-sm border rounded-md bg-muted">
                          {wordpressPassword ? (
                            <div className="flex items-center text-muted-foreground">
                              <Lock className="h-3.5 w-3.5 mr-2" />
                              {wordpressPassword.substring(0, 3)}...{wordpressPassword.substring(wordpressPassword.length - 4)}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">No Password set</span>
                          )}
                        </div>
                      )}
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
          
          <TabsContent value="task-management">
            <div className="grid grid-cols-1 gap-6">
              {/* Airtable API Credentials */}
              <Card>
                <CardHeader>
                  <CardTitle>Airtable Integration</CardTitle>
                  <CardDescription>
                    Connect your Airtable base to sync tasks and data with your database.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-medium">Airtable Configuration</h4>
                    <div className="flex gap-2">
                      {!airtableEditMode && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 px-2 text-xs"
                          onClick={() => setAirtableEditMode(true)}
                        >
                          <Edit className="h-3.5 w-3.5 mr-1" />
                          Edit
                        </Button>
                      )}
                      {airtableEditMode && (
                        <Button 
                          variant="default" 
                          size="sm"
                          className="h-8 px-2 text-xs"
                          onClick={() => {
                            // Save Airtable credentials
                            if (user) {
                              const updatedUser = {
                                ...user,
                                api_keys: {
                                  ...user.api_keys,
                                  airtable: {
                                    apiKey: airtableApiKey,
                                    baseId: airtableBaseId,
                                    tableId: airtableTableId
                                  }
                                }
                              };
                              setUser(updatedUser);
                              localStorage.setItem('user', JSON.stringify(updatedUser));
                              toast({
                                title: "Success",
                                description: "Airtable credentials saved successfully",
                              });
                              setAirtableEditMode(false);
                            }
                          }}
                        >
                          <Save className="h-3.5 w-3.5 mr-1" />
                          Save
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="airtable-api-key" className="text-base font-semibold">
                        API Key
                      </Label>
                      {airtableEditMode ? (
                        <Input
                          id="airtable-api-key"
                          type="password"
                          placeholder="patXXXXXXXXXXXXXX.XXXXXXXXXXXXXXX"
                          value={airtableApiKey}
                          onChange={(e) => setAirtableApiKey(e.target.value)}
                        />
                      ) : (
                        <div className="flex items-center h-10 px-3 py-2 text-sm border rounded-md bg-muted">
                          {airtableApiKey ? (
                            <div className="flex items-center text-muted-foreground">
                              <Lock className="h-3.5 w-3.5 mr-2" />
                              {airtableApiKey.substring(0, 6)}...{airtableApiKey.substring(airtableApiKey.length - 4)}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">No API Key set</span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="airtable-base-id" className="text-base font-semibold">
                        Base ID
                      </Label>
                      {airtableEditMode ? (
                        <Input
                          id="airtable-base-id"
                          placeholder="appXXXXXXXXXXXXXX"
                          value={airtableBaseId}
                          onChange={(e) => setAirtableBaseId(e.target.value)}
                        />
                      ) : (
                        <div className="flex items-center h-10 px-3 py-2 text-sm border rounded-md bg-muted">
                          {airtableBaseId ? (
                            <span className="text-muted-foreground">{airtableBaseId}</span>
                          ) : (
                            <span className="text-muted-foreground">No Base ID set</span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="airtable-table-id" className="text-base font-semibold">
                        Table ID
                      </Label>
                      {airtableEditMode ? (
                        <Input
                          id="airtable-table-id"
                          placeholder="tblXXXXXXXXXXXXXX"
                          value={airtableTableId}
                          onChange={(e) => setAirtableTableId(e.target.value)}
                        />
                      ) : (
                        <div className="flex items-center h-10 px-3 py-2 text-sm border rounded-md bg-muted">
                          {airtableTableId ? (
                            <span className="text-muted-foreground">{airtableTableId}</span>
                          ) : (
                            <span className="text-muted-foreground">No Table ID set</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>How to get your Airtable credentials</AlertTitle>
                    <AlertDescription>
                      1. Create a Personal Access Token at 
                      <a 
                        href="https://airtable.com/create/tokens" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary ml-1 hover:underline"
                      >
                        airtable.com/create/tokens
                      </a>
                      <br />
                      2. Find your Base ID in the URL: airtable.com/[BASE_ID]/...
                      <br />
                      3. Get your Table ID from the API documentation for your base
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
              
              {/* Notion Integration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Notion Integration
                  </CardTitle>
                  <CardDescription>
                    Connect your Notion workspace to sync and manage your notes.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">Notion API Credentials</h3>
                      <p className="text-sm text-muted-foreground">
                        Required for syncing notes from your Notion workspace
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      {!notionEditMode && notionIntegrationSecret && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 px-2 text-xs"
                          onClick={() => setNotionEditMode(true)}
                        >
                          <Edit className="h-3.5 w-3.5 mr-1" />
                          Edit
                        </Button>
                      )}
                      {notionEditMode && (
                        <Button 
                          variant="default" 
                          size="sm"
                          className="h-8 px-2 text-xs"
                          onClick={async () => {
                            if (notionIntegrationSecret && notionPageUrl) {
                              await updateUser({
                                ...user!,
                                api_keys: {
                                  ...user!.api_keys,
                                  notion: {
                                    integrationSecret: notionIntegrationSecret,
                                    pageUrl: notionPageUrl
                                  }
                                }
                              });
                              
                              toast({
                                title: "Success",
                                description: "Notion credentials saved successfully",
                              });
                              setNotionEditMode(false);
                            }
                          }}
                        >
                          <Save className="h-3.5 w-3.5 mr-1" />
                          Save
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="notion-integration-secret" className="text-base font-semibold">
                        Integration Secret
                      </Label>
                      {notionEditMode ? (
                        <Input
                          id="notion-integration-secret"
                          type="password"
                          placeholder="secret_..."
                          value={notionIntegrationSecret}
                          onChange={(e) => setNotionIntegrationSecret(e.target.value)}
                        />
                      ) : (
                        <div className="flex items-center h-10 px-3 py-2 text-sm border rounded-md bg-muted">
                          {notionIntegrationSecret ? (
                            <div className="flex items-center text-muted-foreground">
                              <Lock className="h-3.5 w-3.5 mr-2" />
                              secret_...{notionIntegrationSecret.substring(notionIntegrationSecret.length - 8)}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">No Integration Secret set</span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="notion-page-url" className="text-base font-semibold">
                        Page URL
                      </Label>
                      {notionEditMode ? (
                        <Input
                          id="notion-page-url"
                          type="url"
                          placeholder="https://www.notion.so/your-page-id"
                          value={notionPageUrl}
                          onChange={(e) => setNotionPageUrl(e.target.value)}
                        />
                      ) : (
                        <div className="flex items-center h-10 px-3 py-2 text-sm border rounded-md bg-muted">
                          {notionPageUrl ? (
                            <div className="flex items-center text-muted-foreground">
                              <Link className="h-3.5 w-3.5 mr-2" />
                              {notionPageUrl.length > 50 ? 
                                `${notionPageUrl.substring(0, 47)}...` : 
                                notionPageUrl
                              }
                            </div>
                          ) : (
                            <span className="text-muted-foreground">No Page URL set</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Alert>
                    <InfoIcon className="h-4 w-4" />
                    <AlertTitle>How to get your Notion credentials:</AlertTitle>
                    <AlertDescription className="text-sm space-y-1">
                      1. Go to{" "}
                      <a 
                        href="https://www.notion.so/my-integrations" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        notion.so/my-integrations
                      </a>
                      <br />
                      2. Create a new integration and copy the Integration Secret
                      <br />
                      3. Share your Notion page with the integration
                      <br />
                      4. Copy the page URL from your browser
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="web-scraping">
            <div className="grid grid-cols-1 gap-6">
              {/* ScraperAPI.com */}
              <Card>
                <CardHeader>
                  <CardTitle>ScraperAPI.com</CardTitle>
                  <CardDescription>
                    Add your ScraperAPI credentials for web scraping services.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="scraperapi-key" className="text-base font-semibold">
                        API Key
                      </Label>
                      <div className="flex space-x-2">
                        {!scraperapiEditMode && scraperapiKey && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 px-2 text-xs"
                            onClick={() => setScraperapiEditMode(true)}
                          >
                            <Edit className="h-3.5 w-3.5 mr-1" />
                            Edit
                          </Button>
                        )}
                        {scraperapiEditMode && (
                          <Button 
                            variant="default" 
                            size="sm"
                            className="h-8 px-2 text-xs"
                            onClick={createSaveHandler(
                              'webScraping', 
                              {
                                scraperapi: { apiKey: scraperapiKey },
                                oxylabs: { username: oxylabsUsername, password: oxylabsPassword },
                                brightdata: { username: brightdataUsername, password: brightdataPassword, endpoint: brightdataEndpoint }
                              },
                              setScraperapiEditMode,
                              'ScraperAPI Credentials'
                            )}
                          >
                            <Save className="h-3.5 w-3.5 mr-1" />
                            Save
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {scraperapiEditMode ? (
                      <Input
                        id="scraperapi-key"
                        type="password"
                        placeholder="Your ScraperAPI key"
                        value={scraperapiKey}
                        onChange={(e) => setScraperapiKey(e.target.value)}
                      />
                    ) : (
                      <div className="flex items-center h-10 px-3 py-2 text-sm border rounded-md bg-muted">
                        {scraperapiKey ? (
                          <div className="flex items-center text-muted-foreground">
                            <Lock className="h-3.5 w-3.5 mr-2" />
                            {scraperapiKey.substring(0, 3)}...{scraperapiKey.substring(scraperapiKey.length - 4)}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">No API key set</span>
                        )}
                      </div>
                    )}
                    
                    <p className="text-sm text-muted-foreground">
                      Used for web scraping with proxy rotation and CAPTCHA handling.
                      <a 
                        href="https://www.scraperapi.com/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary ml-1 hover:underline"
                      >
                        Get your ScraperAPI key
                      </a>
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              {/* Oxylabs Scraper API */}
              <Card>
                <CardHeader>
                  <CardTitle>Oxylabs Scraper API</CardTitle>
                  <CardDescription>
                    Add your Oxylabs credentials for premium web scraping.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label className="text-base font-semibold">
                      Oxylabs Credentials
                    </Label>
                    <div className="flex space-x-2">
                      {!oxylabsEditMode && oxylabsUsername && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 px-2 text-xs"
                          onClick={() => setOxylabsEditMode(true)}
                        >
                          <Edit className="h-3.5 w-3.5 mr-1" />
                          Edit
                        </Button>
                      )}
                      {oxylabsEditMode && (
                        <Button 
                          variant="default" 
                          size="sm"
                          className="h-8 px-2 text-xs"
                          onClick={createSaveHandler(
                            'webScraping', 
                            {
                              scraperapi: { apiKey: scraperapiKey },
                              oxylabs: { username: oxylabsUsername, password: oxylabsPassword },
                              brightdata: { username: brightdataUsername, password: brightdataPassword, endpoint: brightdataEndpoint }
                            },
                            setOxylabsEditMode,
                            'Oxylabs Credentials'
                          )}
                        >
                          <Save className="h-3.5 w-3.5 mr-1" />
                          Save
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="oxylabs-username" className="text-base font-semibold">
                        Username
                      </Label>
                      {oxylabsEditMode ? (
                        <Input
                          id="oxylabs-username"
                          placeholder="Your Oxylabs username"
                          value={oxylabsUsername}
                          onChange={(e) => setOxylabsUsername(e.target.value)}
                        />
                      ) : (
                        <div className="flex items-center h-10 px-3 py-2 text-sm border rounded-md bg-muted">
                          {oxylabsUsername ? (
                            <div className="flex items-center text-muted-foreground">
                              {oxylabsUsername}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">No username set</span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="oxylabs-password" className="text-base font-semibold">
                        Password
                      </Label>
                      {oxylabsEditMode ? (
                        <Input
                          id="oxylabs-password"
                          type="password"
                          placeholder="Your Oxylabs password"
                          value={oxylabsPassword}
                          onChange={(e) => setOxylabsPassword(e.target.value)}
                        />
                      ) : (
                        <div className="flex items-center h-10 px-3 py-2 text-sm border rounded-md bg-muted">
                          {oxylabsPassword ? (
                            <div className="flex items-center text-muted-foreground">
                              <Lock className="h-3.5 w-3.5 mr-2" />
                              {oxylabsPassword.substring(0, 3)}...{oxylabsPassword.substring(oxylabsPassword.length - 4)}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">No password set</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    Used for high-quality residential and datacenter proxies.
                    <a 
                      href="https://oxylabs.io/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary ml-1 hover:underline"
                    >
                      Get your Oxylabs credentials
                    </a>
                  </p>
                </CardContent>
              </Card>
              
              {/* Bright Data (formerly Luminati) API */}
              <Card>
                <CardHeader>
                  <CardTitle>Bright Data API</CardTitle>
                  <CardDescription>
                    Add your Bright Data (formerly Luminati) credentials for enterprise web scraping.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label className="text-base font-semibold">
                      Bright Data Credentials
                    </Label>
                    <div className="flex space-x-2">
                      {!brightdataEditMode && brightdataUsername && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 px-2 text-xs"
                          onClick={() => setBrightdataEditMode(true)}
                        >
                          <Edit className="h-3.5 w-3.5 mr-1" />
                          Edit
                        </Button>
                      )}
                      {brightdataEditMode && (
                        <Button 
                          variant="default" 
                          size="sm"
                          className="h-8 px-2 text-xs"
                          onClick={createSaveHandler(
                            'webScraping', 
                            {
                              scraperapi: { apiKey: scraperapiKey },
                              oxylabs: { username: oxylabsUsername, password: oxylabsPassword },
                              brightdata: { username: brightdataUsername, password: brightdataPassword, endpoint: brightdataEndpoint }
                            },
                            setBrightdataEditMode,
                            'Bright Data Credentials'
                          )}
                        >
                          <Save className="h-3.5 w-3.5 mr-1" />
                          Save
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="brightdata-username" className="text-base font-semibold">
                        Username
                      </Label>
                      {brightdataEditMode ? (
                        <Input
                          id="brightdata-username"
                          placeholder="Your Bright Data username"
                          value={brightdataUsername}
                          onChange={(e) => setBrightdataUsername(e.target.value)}
                        />
                      ) : (
                        <div className="flex items-center h-10 px-3 py-2 text-sm border rounded-md bg-muted">
                          {brightdataUsername ? (
                            <div className="flex items-center text-muted-foreground">
                              {brightdataUsername}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">No username set</span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="brightdata-password" className="text-base font-semibold">
                        Password
                      </Label>
                      {brightdataEditMode ? (
                        <Input
                          id="brightdata-password"
                          type="password"
                          placeholder="Your Bright Data password"
                          value={brightdataPassword}
                          onChange={(e) => setBrightdataPassword(e.target.value)}
                        />
                      ) : (
                        <div className="flex items-center h-10 px-3 py-2 text-sm border rounded-md bg-muted">
                          {brightdataPassword ? (
                            <div className="flex items-center text-muted-foreground">
                              <Lock className="h-3.5 w-3.5 mr-2" />
                              {brightdataPassword.substring(0, 3)}...{brightdataPassword.substring(brightdataPassword.length - 4)}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">No password set</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="brightdata-endpoint" className="text-base font-semibold">
                      Proxy Endpoint
                    </Label>
                    {brightdataEditMode ? (
                      <Input
                        id="brightdata-endpoint"
                        placeholder="zproxy.lum-superproxy.io:22225"
                        value={brightdataEndpoint}
                        onChange={(e) => setBrightdataEndpoint(e.target.value)}
                      />
                    ) : (
                      <div className="flex items-center h-10 px-3 py-2 text-sm border rounded-md bg-muted">
                        {brightdataEndpoint ? (
                          <div className="flex items-center text-muted-foreground">
                            {brightdataEndpoint}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">No endpoint set</span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    Used for enterprise-grade web scraping with residential IPs.
                    <a 
                      href="https://brightdata.com/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary ml-1 hover:underline"
                    >
                      Get your Bright Data credentials
                    </a>
                  </p>
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