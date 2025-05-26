import React, { useState } from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { 
  Globe, 
  Plus, 
  Upload, 
  Check, 
  AlertCircle, 
  Trash2,
  FileText,
  Users,
  Database,
  Eye,
  EyeOff
} from 'lucide-react';

interface DomainValidationResult {
  valid: string[];
  invalid: string[];
  duplicates: string[];
  total: number;
}

export default function DomainsAddNewPage() {
  const queryClient = useQueryClient();
  
  // State management
  const [domainsText, setDomainsText] = useState('');
  const [validationResult, setValidationResult] = useState<DomainValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Domain validation function
  const validateDomains = (text: string): DomainValidationResult => {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const valid: string[] = [];
    const invalid: string[] = [];
    const seen = new Set<string>();
    const duplicates: string[] = [];

    // Simple domain validation regex
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    lines.forEach(line => {
      // Remove protocols and paths
      let domain = line.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].toLowerCase();
      
      if (domainRegex.test(domain) && domain.includes('.')) {
        if (seen.has(domain)) {
          duplicates.push(domain);
        } else {
          seen.add(domain);
          valid.push(domain);
        }
      } else {
        invalid.push(line);
      }
    });

    return {
      valid,
      invalid,
      duplicates,
      total: lines.length
    };
  };

  // Handle domain validation
  const handleValidate = () => {
    if (!domainsText.trim()) {
      toast({
        title: "No domains to validate",
        description: "Please enter some domains first.",
        variant: "destructive"
      });
      return;
    }

    setIsValidating(true);
    setTimeout(() => {
      const result = validateDomains(domainsText);
      setValidationResult(result);
      setIsValidating(false);
      
      toast({
        title: "Validation complete",
        description: `Found ${result.valid.length} valid domains out of ${result.total} entries.`
      });
    }, 500);
  };

  // Add domains mutation
  const addDomainsMutation = useMutation({
    mutationFn: async (domains: string[]) => {
      const response = await fetch('/api/domains/bulk-add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ domains }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add domains');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success!",
        description: `Successfully added ${data.added} domains to your account.`
      });
      setDomainsText('');
      setValidationResult(null);
      queryClient.invalidateQueries({ queryKey: ['/api/domains'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const handleAddDomains = () => {
    if (!validationResult || validationResult.valid.length === 0) {
      toast({
        title: "No valid domains",
        description: "Please validate your domains first and ensure there are valid entries.",
        variant: "destructive"
      });
      return;
    }

    addDomainsMutation.mutate(validationResult.valid);
  };

  const clearAll = () => {
    setDomainsText('');
    setValidationResult(null);
  };

  // Sample domains for demonstration
  const sampleDomains = `example.com
google.com
facebook.com
twitter.com
linkedin.com
github.com
stackoverflow.com
amazon.com
youtube.com
wikipedia.org`;

  const loadSample = () => {
    setDomainsText(sampleDomains);
    setValidationResult(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header pageTitle="Add New Domains" />

      <div className="container mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Globe className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Add New Domains</h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Add multiple domains to your account in bulk. Paste up to hundreds of domains at once.
                </p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="flex items-center p-6">
                <FileText className="h-8 w-8 text-blue-500 mr-3" />
                <div>
                  <p className="text-2xl font-bold">{domainsText.split('\n').filter(line => line.trim()).length}</p>
                  <p className="text-xs text-muted-foreground">Total Entries</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center p-6">
                <Check className="h-8 w-8 text-green-500 mr-3" />
                <div>
                  <p className="text-2xl font-bold">{validationResult?.valid.length || 0}</p>
                  <p className="text-xs text-muted-foreground">Valid Domains</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center p-6">
                <AlertCircle className="h-8 w-8 text-red-500 mr-3" />
                <div>
                  <p className="text-2xl font-bold">{validationResult?.invalid.length || 0}</p>
                  <p className="text-xs text-muted-foreground">Invalid Entries</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center p-6">
                <Users className="h-8 w-8 text-yellow-500 mr-3" />
                <div>
                  <p className="text-2xl font-bold">{validationResult?.duplicates.length || 0}</p>
                  <p className="text-xs text-muted-foreground">Duplicates</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Domain Input Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Domain Input
                </CardTitle>
                <CardDescription>
                  Paste your domains below, one per line. You can include URLs with protocols (http/https) - they will be cleaned automatically.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Paste your domains here, one per line:&#10;&#10;example.com&#10;https://www.google.com&#10;facebook.com/page&#10;subdomain.example.org"
                  value={domainsText}
                  onChange={(e) => setDomainsText(e.target.value)}
                  className="min-h-[300px] font-mono text-sm"
                />
                
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={handleValidate}
                    disabled={!domainsText.trim() || isValidating}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isValidating ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Validating...
                      </div>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Validate Domains
                      </>
                    )}
                  </Button>
                  
                  <Button variant="outline" onClick={loadSample}>
                    <FileText className="h-4 w-4 mr-2" />
                    Load Sample
                  </Button>
                  
                  <Button variant="outline" onClick={clearAll}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All
                  </Button>
                  
                  {validationResult && (
                    <Button
                      variant="outline"
                      onClick={() => setShowPreview(!showPreview)}
                    >
                      {showPreview ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                      {showPreview ? 'Hide Preview' : 'Show Preview'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Validation Results & Actions */}
          <div className="space-y-6">
            {/* Validation Summary */}
            {validationResult && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Validation Results
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Valid domains:</span>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {validationResult.valid.length}
                      </Badge>
                    </div>
                    
                    {validationResult.invalid.length > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Invalid entries:</span>
                        <Badge variant="destructive">
                          {validationResult.invalid.length}
                        </Badge>
                      </div>
                    )}
                    
                    {validationResult.duplicates.length > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Duplicates found:</span>
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          {validationResult.duplicates.length}
                        </Badge>
                      </div>
                    )}
                  </div>

                  {validationResult.valid.length > 0 && (
                    <Button
                      onClick={handleAddDomains}
                      disabled={addDomainsMutation.isPending}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      {addDomainsMutation.isPending ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Adding Domains...
                        </div>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Add {validationResult.valid.length} Domains to My Account
                        </>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>Instructions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                  <p><strong>1.</strong> Paste your domains in the text area, one per line</p>
                  <p><strong>2.</strong> Click "Validate Domains" to check for valid entries</p>
                  <p><strong>3.</strong> Review the validation results</p>
                  <p><strong>4.</strong> Click "Add Domains" to save them to your account</p>
                </div>
                
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    The system automatically removes protocols (http/https), www prefixes, and paths from URLs to extract clean domain names.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Preview Section */}
        {showPreview && validationResult && (
          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Domain Preview</CardTitle>
                <CardDescription>
                  Review the domains that will be added to your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {validationResult.valid.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-green-700 dark:text-green-400 mb-2">
                        Valid Domains ({validationResult.valid.length})
                      </h4>
                      <div className="max-h-60 overflow-y-auto space-y-1">
                        {validationResult.valid.map((domain, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded text-sm">
                            <Check className="h-3 w-3 text-green-600" />
                            {domain}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {validationResult.invalid.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-red-700 dark:text-red-400 mb-2">
                        Invalid Entries ({validationResult.invalid.length})
                      </h4>
                      <div className="max-h-60 overflow-y-auto space-y-1">
                        {validationResult.invalid.map((domain, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-sm">
                            <AlertCircle className="h-3 w-3 text-red-600" />
                            {domain}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {validationResult.duplicates.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-yellow-700 dark:text-yellow-400 mb-2">
                        Duplicates ({validationResult.duplicates.length})
                      </h4>
                      <div className="max-h-60 overflow-y-auto space-y-1">
                        {validationResult.duplicates.map((domain, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-sm">
                            <Users className="h-3 w-3 text-yellow-600" />
                            {domain}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}