import React, { useState, useMemo } from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { 
  Globe,
  Search,
  Filter,
  Trash2,
  Plus,
  Download,
  Upload,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Calendar,
  Database,
  Eye,
  Edit,
  MoreHorizontal,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface Domain {
  id: number;
  domain_base: string | null;
  rel_user_id: number | null;
  created_at: string | null;
}

interface DomainsResponse {
  domains: Domain[];
  total: number;
  success: boolean;
}

type SortField = 'domain_base' | 'created_at' | 'id';
type SortDirection = 'asc' | 'desc';

export default function DomainsManagementPage() {
  const queryClient = useQueryClient();
  
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomains, setSelectedDomains] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [domainsPerPage, setDomainsPerPage] = useState(25);

  // Fetch domains from the actual database
  const { data: domainsResponse, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/domains'],
    retry: false,
  });

  const domains: Domain[] = (domainsResponse as DomainsResponse)?.domains || [];

  // Delete domains mutation
  const deleteDomainsMutation = useMutation({
    mutationFn: async (domainIds: number[]) => {
      const response = await fetch('/api/domains/bulk-delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ domainIds }),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to delete domains';
        try {
          const error = await response.json();
          errorMessage = error.message || errorMessage;
        } catch {
          errorMessage = `Server error: ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      try {
        return await response.json();
      } catch (parseError) {
        throw new Error('Invalid response from server');
      }
    },
    onSuccess: (data) => {
      toast({
        title: "Success!",
        description: `Successfully deleted ${data.deleted} domains.`
      });
      setSelectedDomains([]);
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

  // Helper functions
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Sorting function
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter and search functionality
  const filteredDomains = useMemo(() => {
    return domains.filter((domain: Domain) => {
      const matchesSearch = !searchTerm || 
        (domain.domain_base && domain.domain_base.toLowerCase().includes(searchTerm.toLowerCase()));
      
      return matchesSearch;
    });
  }, [domains, searchTerm]);

  // Sorted domains
  const sortedDomains = useMemo(() => {
    return [...filteredDomains].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'domain_base':
          aValue = a.domain_base || '';
          bValue = b.domain_base || '';
          break;
        case 'created_at':
          aValue = new Date(a.created_at || 0);
          bValue = new Date(b.created_at || 0);
          break;
        case 'id':
          aValue = a.id;
          bValue = b.id;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredDomains, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(sortedDomains.length / domainsPerPage);
  const startIndex = (currentPage - 1) * domainsPerPage;
  const paginatedDomains = sortedDomains.slice(startIndex, startIndex + domainsPerPage);

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4 opacity-50" />;
    return sortDirection === 'asc' ? 
      <ArrowUpDown className="h-4 w-4 rotate-180" /> : 
      <ArrowUpDown className="h-4 w-4" />;
  };

  const handleSelectAll = () => {
    if (selectedDomains.length === paginatedDomains.length && paginatedDomains.length > 0) {
      setSelectedDomains([]);
    } else {
      setSelectedDomains(paginatedDomains.map(domain => domain.id));
    }
  };

  const handleSelectAllVisible = () => {
    if (selectedDomains.length === sortedDomains.length && sortedDomains.length > 0) {
      setSelectedDomains([]);
    } else {
      setSelectedDomains(sortedDomains.map(domain => domain.id));
    }
  };

  const handleSelectDomain = (domainId: number) => {
    if (selectedDomains.includes(domainId)) {
      setSelectedDomains(selectedDomains.filter(id => id !== domainId));
    } else {
      setSelectedDomains([...selectedDomains, domainId]);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedDomains.length === 0) {
      toast({
        title: "No domains selected",
        description: "Please select domains to delete.",
        variant: "destructive"
      });
      return;
    }

    // Show confirmation dialog
    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedDomains.length} selected domain(s)? This action cannot be undone.`
    );
    
    if (confirmed) {
      deleteDomainsMutation.mutate(selectedDomains);
    }
  };

  const handleDeleteSingle = (domainId: number) => {
    const domain = domains.find(d => d.id === domainId);
    const domainName = domain?.domain_base || 'this domain';
    
    const confirmed = window.confirm(
      `Are you sure you want to delete "${domainName}"? This action cannot be undone.`
    );
    
    if (confirmed) {
      deleteDomainsMutation.mutate([domainId]);
    }
  };

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Refreshed",
      description: "Domain list has been updated."
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header pageTitle="Domain Management" />

      <div className="container mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Globe className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Domain Management</h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Manage your domain portfolio with advanced filtering and bulk operations
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleRefresh}
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button
                onClick={() => window.location.href = '/image_handler/domains_add_new'}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Domains
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="flex items-center p-6">
                <Database className="h-8 w-8 text-blue-500 mr-3" />
                <div>
                  <p className="text-2xl font-bold">{domains.length}</p>
                  <p className="text-xs text-muted-foreground">Total Domains</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center p-6">
                <Filter className="h-8 w-8 text-green-500 mr-3" />
                <div>
                  <p className="text-2xl font-bold">{filteredDomains.length}</p>
                  <p className="text-xs text-muted-foreground">Filtered Results</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center p-6">
                <CheckCircle className="h-8 w-8 text-purple-500 mr-3" />
                <div>
                  <p className="text-2xl font-bold">{selectedDomains.length}</p>
                  <p className="text-xs text-muted-foreground">Selected</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center p-6">
                <Eye className="h-8 w-8 text-orange-500 mr-3" />
                <div>
                  <p className="text-2xl font-bold">{paginatedDomains.length}</p>
                  <p className="text-xs text-muted-foreground">Displayed</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Bar */}
          {selectedDomains.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-blue-800 dark:text-blue-200 font-medium">
                    {selectedDomains.length} domain(s) selected
                  </span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleSelectAllVisible}
                      className="border-blue-300 text-blue-700 hover:bg-blue-100"
                    >
                      {selectedDomains.length === sortedDomains.length ? 'Deselect All' : 'Select All Visible'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedDomains([])}
                      className="border-gray-300 text-gray-700 hover:bg-gray-100"
                    >
                      Clear Selection
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleDeleteSelected}
                    disabled={deleteDomainsMutation.isPending}
                  >
                    {deleteDomainsMutation.isPending ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Deleting...
                      </div>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete Selected ({selectedDomains.length})
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Filters and Search */}
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search domains..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={domainsPerPage.toString()} onValueChange={(value) => setDomainsPerPage(parseInt(value))}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Per page" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 per page</SelectItem>
                <SelectItem value="25">25 per page</SelectItem>
                <SelectItem value="50">50 per page</SelectItem>
                <SelectItem value="100">100 per page</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600 dark:text-gray-400">Loading your domains...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50 dark:bg-red-900/20">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 dark:text-red-200">
              Unable to load domains. Please try refreshing the page or check your connection.
            </AlertDescription>
          </Alert>
        )}

        {/* Empty State */}
        {!isLoading && !error && domains.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center">
            <Globe className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No domains found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You haven't added any domains yet. Start by adding some domains to your account.
            </p>
            <Button
              onClick={() => window.location.href = '/image_handler/domains_add_new'}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Domains
            </Button>
          </div>
        )}

        {/* Domains Table */}
        {!isLoading && !error && domains.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedDomains.length === paginatedDomains.length && paginatedDomains.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('id')}>
                    <div className="flex items-center gap-2">
                      ID
                      {getSortIcon('id')}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('domain_base')}>
                    <div className="flex items-center gap-2">
                      Domain
                      {getSortIcon('domain_base')}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('created_at')}>
                    <div className="flex items-center gap-2">
                      Added Date
                      {getSortIcon('created_at')}
                    </div>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedDomains.map((domain) => (
                  <TableRow 
                    key={domain.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedDomains.includes(domain.id)}
                        onCheckedChange={() => handleSelectDomain(domain.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        #{domain.id}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {domain.domain_base || 'N/A'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(domain.created_at)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                        Active
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                          title="View domain details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 hover:bg-orange-50 hover:text-orange-600"
                          title="Edit domain"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                          title="Delete domain"
                          onClick={() => handleDeleteSingle(domain.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {startIndex + 1} to {Math.min(startIndex + domainsPerPage, sortedDomains.length)} of {sortedDomains.length} domains
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}