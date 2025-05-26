import React, { useState, useRef } from 'react';
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
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { 
  Search, 
  Upload, 
  Download, 
  Filter,
  ChevronLeft, 
  ChevronRight, 
  TrendingUp,
  TrendingDown,
  Minus,
  ExternalLink,
  FileSpreadsheet,
  BarChart3,
  Globe
} from 'lucide-react';

// Import the custom hook
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

interface RedditOrganicPosition {
  id: number;
  user_id: number;
  keyword: string;
  url: string;
  domain: string;
  position: number | null;
  previous_position: number | null;
  position_change: number | null;
  search_volume: number | null;
  cpc: string | null;
  competition: string | null;
  traffic: number | null;
  traffic_cost: string | null;
  timestamp: string | null;
  location: string | null;
  device: string | null;
  search_engine: string;
  language: string;
  date_captured: string | null;
  serp_features: string | null;
  difficulty: string | null;
  visibility: string | null;
  estimated_clicks: number | null;
  click_through_rate: string | null;
  title: string | null;
  description: string | null;
  meta_description: string | null;
  h1_tag: string | null;
  word_count: number | null;
  page_authority: string | null;
  domain_authority: string | null;
  backlinks: number | null;
  referring_domains: number | null;
  social_shares: number | null;
  created_at: string;
  updated_at: string;
}

const RedditScraperScreen1: React.FC = () => {
  // Set the document title using the custom hook
  useDocumentTitle("Reddit Scraper - Screen 1 - Snefuru");

  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State management
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecords, setSelectedRecords] = useState<number[]>([]);
  const [sortField, setSortField] = useState<string>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // Filter states
  const [deviceFilter, setDeviceFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [competitionFilter, setCompetitionFilter] = useState('all');
  const [positionRangeMin, setPositionRangeMin] = useState('');
  const [positionRangeMax, setPositionRangeMax] = useState('');
  const [domainFilter, setDomainFilter] = useState('');

  // Fetch Reddit organic positions data
  const { data: organicPositions = [], isLoading, error } = useQuery<RedditOrganicPosition[]>({
    queryKey: ['/api/reddit/organic-positions'],
    retry: false,
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/reddit/upload-positions', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: `Successfully imported ${data.count} records from your spreadsheet`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/reddit/organic-positions'] });
    },
    onError: (error: any) => {
      toast({
        title: "Upload Error",
        description: error.message || "Failed to upload and process the file",
        variant: "destructive",
      });
    },
  });

  // Delete records mutation
  const deleteMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      const response = await fetch('/api/reddit/organic-positions/bulk-delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ ids }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete records');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Selected records deleted successfully",
      });
      setSelectedRecords([]);
      queryClient.invalidateQueries({ queryKey: ['/api/reddit/organic-positions'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete records",
        variant: "destructive",
      });
    },
  });

  // Filter and search functionality
  const filteredData = organicPositions.filter((record: RedditOrganicPosition) => {
    const matchesSearch = record.keyword?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.url?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.domain?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.title?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDevice = deviceFilter === 'all' || record.device === deviceFilter;
    const matchesLocation = locationFilter === 'all' || record.location === locationFilter;
    const matchesCompetition = competitionFilter === 'all' || record.competition === competitionFilter;
    const matchesDomain = !domainFilter || record.domain?.toLowerCase().includes(domainFilter.toLowerCase());

    let matchesPositionRange = true;
    if (positionRangeMin && record.position) {
      matchesPositionRange = matchesPositionRange && record.position >= parseInt(positionRangeMin);
    }
    if (positionRangeMax && record.position) {
      matchesPositionRange = matchesPositionRange && record.position <= parseInt(positionRangeMax);
    }

    return matchesSearch && matchesDevice && matchesLocation && matchesCompetition && matchesDomain && matchesPositionRange;
  });

  // Sort functionality
  const sortedData = [...filteredData].sort((a, b) => {
    let aValue = a[sortField as keyof RedditOrganicPosition];
    let bValue = b[sortField as keyof RedditOrganicPosition];

    // Handle null values
    if (aValue === null) aValue = '';
    if (bValue === null) bValue = '';

    if (typeof aValue === 'string') aValue = aValue.toLowerCase();
    if (typeof bValue === 'string') bValue = bValue.toLowerCase();

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + rowsPerPage);

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
          file.type === 'application/vnd.ms-excel' ||
          file.name.endsWith('.xlsx') || 
          file.name.endsWith('.xls')) {
        uploadMutation.mutate(file);
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please upload an Excel file (.xlsx or .xls)",
          variant: "destructive",
        });
      }
    }
  };

  // Handle sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Get position change indicator
  const getPositionChangeIndicator = (current: number | null, previous: number | null, change: number | null) => {
    if (!current || !previous || change === null) {
      return <Minus className="h-4 w-4 text-gray-400" />;
    }

    if (change > 0) {
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    } else if (change < 0) {
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    } else {
      return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const getPositionBadgeColor = (position: number | null) => {
    if (!position) return 'bg-gray-100 text-gray-800';
    if (position <= 3) return 'bg-green-100 text-green-800';
    if (position <= 10) return 'bg-yellow-100 text-yellow-800';
    if (position <= 20) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const getCompetitionBadgeColor = (competition: string | null) => {
    switch (competition?.toLowerCase()) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Pagination controls as a reusable variable
  const PaginationControls = (
    totalPages > 1 && (
      <div className="flex flex-col md:flex-row md:items-center justify-between px-6 py-4 border-t border-b border-gray-200 dark:border-gray-700 gap-2">
        <div className="text-sm text-gray-700 dark:text-gray-300 mb-2 md:mb-0">
          Showing {startIndex + 1} to {Math.min(startIndex + rowsPerPage, sortedData.length)} of {sortedData.length} records
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Results per page selector */}
          <Select value={rowsPerPage.toString()} onValueChange={val => { setRowsPerPage(Number(val)); setCurrentPage(1); }}>
            <SelectTrigger className="w-[90px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[25, 50, 100, 250, 500].map(opt => (
                <SelectItem key={opt} value={opt.toString()}>{opt} / page</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
          {/* Go to page input */}
          <form
            onSubmit={e => {
              e.preventDefault();
              const page = Number((e.target as any).elements.page.value);
              if (!isNaN(page) && page >= 1 && page <= totalPages) {
                setCurrentPage(page);
              }
            }}
            className="flex items-center gap-1"
          >
            <Input
              name="page"
              type="number"
              min={1}
              max={totalPages}
              defaultValue={currentPage}
              className="w-16 h-8 px-2 text-sm"
              style={{ minWidth: 0 }}
            />
            <Button type="submit" size="sm" variant="outline">Go</Button>
          </form>
        </div>
      </div>
    )
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header pageTitle="Reddit Scraper" />

      <div className="container mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-orange-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reddit Organic Positions</h1>
                <p className="text-gray-600 dark:text-gray-400">Track and analyze Reddit organic search positions</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploadMutation.isPending ? 'Uploading...' : 'Upload Excel'}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
              />
              {selectedRecords.length > 0 && (
                <Button
                  onClick={() => deleteMutation.mutate(selectedRecords)}
                  disabled={deleteMutation.isPending}
                  variant="destructive"
                >
                  Delete Selected ({selectedRecords.length})
                </Button>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Records</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{organicPositions.length}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Unique Domains</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {new Set(organicPositions.map((r: RedditOrganicPosition) => r.domain).filter(Boolean)).size}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-orange-600" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Top 10 Positions</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {organicPositions.filter((r: RedditOrganicPosition) => r.position && r.position <= 10).length}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
              <div className="flex items-center gap-2">
                <Search className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Filtered Results</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{filteredData.length}</p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search keywords, URLs, domains..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={deviceFilter} onValueChange={setDeviceFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Device" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Devices</SelectItem>
                <SelectItem value="desktop">Desktop</SelectItem>
                <SelectItem value="mobile">Mobile</SelectItem>
                <SelectItem value="tablet">Tablet</SelectItem>
              </SelectContent>
            </Select>

            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="us">United States</SelectItem>
                <SelectItem value="uk">United Kingdom</SelectItem>
                <SelectItem value="ca">Canada</SelectItem>
                <SelectItem value="au">Australia</SelectItem>
              </SelectContent>
            </Select>

            <Select value={competitionFilter} onValueChange={setCompetitionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Competition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Competition</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="Domain filter"
              value={domainFilter}
              onChange={(e) => setDomainFilter(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Position Range:</span>
              <Input
                placeholder="Min"
                value={positionRangeMin}
                onChange={(e) => setPositionRangeMin(e.target.value)}
                className="w-20"
                type="number"
              />
              <span className="text-gray-400">-</span>
              <Input
                placeholder="Max"
                value={positionRangeMax}
                onChange={(e) => setPositionRangeMax(e.target.value)}
                className="w-20"
                type="number"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Show:</span>
              <Select value={rowsPerPage.toString()} onValueChange={(value) => setRowsPerPage(parseInt(value))}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="250">250</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading Reddit organic positions...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <p className="text-red-600 dark:text-red-400">Error loading data. Please try again.</p>
            </div>
          ) : organicPositions.length === 0 ? (
            <div className="p-8 text-center">
              <FileSpreadsheet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No data found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Upload your Reddit organic positions Excel file to get started
              </p>
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Excel File
              </Button>
            </div>
          ) : (
            <>
              {/* Top Pagination Controls */}
              {PaginationControls}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox 
                          checked={selectedRecords.length === paginatedData.length && paginatedData.length > 0}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedRecords(paginatedData.map((record: RedditOrganicPosition) => record.id));
                            } else {
                              setSelectedRecords([]);
                            }
                          }}
                        />
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                        onClick={() => handleSort('keyword')}
                      >
                        Keyword
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                        onClick={() => handleSort('position')}
                      >
                        Position
                      </TableHead>
                      <TableHead>Change</TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                        onClick={() => handleSort('search_volume')}
                      >
                        Volume
                      </TableHead>
                      <TableHead>Competition</TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                        onClick={() => handleSort('cpc')}
                      >
                        CPC
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                        onClick={() => handleSort('url')}
                      >
                        URL
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                        onClick={() => handleSort('domain')}
                      >
                        Domain
                      </TableHead>
                      <TableHead>Traffic</TableHead>
                      <TableHead>Device</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedData.map((record: RedditOrganicPosition) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          <Checkbox 
                            checked={selectedRecords.includes(record.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedRecords([...selectedRecords, record.id]);
                              } else {
                                setSelectedRecords(selectedRecords.filter(id => id !== record.id));
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell className="font-medium max-w-xs">
                          <div className="truncate" title={record.keyword}>
                            {record.keyword}
                          </div>
                        </TableCell>
                        <TableCell>
                          {record.position && (
                            <Badge className={getPositionBadgeColor(record.position)}>
                              #{record.position}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {getPositionChangeIndicator(record.position, record.previous_position, record.position_change)}
                            {record.position_change && (
                              <span className={`text-sm ${record.position_change > 0 ? 'text-green-600' : record.position_change < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                                {record.position_change > 0 ? '+' : ''}{record.position_change}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {record.search_volume && (
                            <span className="text-sm font-medium">
                              {record.search_volume.toLocaleString()}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {record.competition && (
                            <Badge className={getCompetitionBadgeColor(record.competition)}>
                              {record.competition}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {record.cpc && (
                            <span className="text-sm font-mono">
                              {record.cpc}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="max-w-xs">
                          {record.url && (
                            <a 
                              href={record.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline flex items-center gap-1 truncate"
                              title={record.url}
                            >
                              <ExternalLink className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">{record.url}</span>
                            </a>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-medium">
                            {record.domain}
                          </span>
                        </TableCell>
                        <TableCell>
                          {record.traffic && (
                            <span className="text-sm">
                              {record.traffic.toLocaleString()}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600 capitalize">
                            {record.device}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600 uppercase">
                            {record.location}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {/* Bottom Pagination Controls */}
              {PaginationControls}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RedditScraperScreen1;