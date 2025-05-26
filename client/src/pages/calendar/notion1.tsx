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
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { 
  Search, 
  Download, 
  Upload,
  RotateCw,
  RefreshCw,
  FileText,
  ExternalLink,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Filter,
  Plus,
  Trash2,
  Eye,
  Edit3,
  BookOpen,
  Hash,
  Tag
} from 'lucide-react';

interface NotionPage {
  id: string;
  object: string;
  created_time: string;
  last_edited_time: string;
  created_by: {
    id: string;
  };
  last_edited_by: {
    id: string;
  };
  cover: any;
  icon: any;
  parent: {
    type: string;
    database_id?: string;
    page_id?: string;
  };
  archived: boolean;
  properties: {
    title?: {
      title: Array<{
        text: {
          content: string;
        };
      }>;
    };
    Name?: {
      title: Array<{
        text: {
          content: string;
        };
      }>;
    };
    Status?: {
      select?: {
        name: string;
        color: string;
      };
    };
    Tags?: {
      multi_select: Array<{
        name: string;
        color: string;
      }>;
    };
    Category?: {
      select?: {
        name: string;
        color: string;
      };
    };
    'Created Time'?: {
      created_time: string;
    };
    'Last Edited'?: {
      last_edited_time: string;
    };
  };
  url: string;
}

interface SyncedNote {
  id: number;
  notion_id: string;
  title: string;
  status: string | null;
  category: string | null;
  tags: string[] | null;
  content_preview: string | null;
  notion_url: string;
  created_time: string;
  last_edited_time: string;
  last_synced: string;
  created_at: string;
  updated_at: string;
}

type SortField = 'title' | 'status' | 'category' | 'created_time' | 'last_edited_time' | 'last_synced';
type SortDirection = 'asc' | 'desc';

export default function NotionNotesPage() {
  const queryClient = useQueryClient();
  
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState('all');
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('last_edited_time');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [showSynced, setShowSynced] = useState('all'); // 'all', 'synced', 'unsynced'
  const itemsPerPage = 25;

  // Fetch Notion pages
  const { data: notionPages = [], isLoading: notionLoading, error: notionError } = useQuery<NotionPage[]>({
    queryKey: ['/api/notion/pages'],
    retry: false,
  });

  // Fetch synced notes from database
  const { data: syncedNotes = [], isLoading: notesLoading } = useQuery<SyncedNote[]>({
    queryKey: ['/api/notion/synced-notes'],
    retry: false,
  });

  // Sync with Notion mutation
  const syncMutation = useMutation({
    mutationFn: async (pageIds?: string[]) => {
      const response = await fetch('/api/notion/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ pageIds }),
      });

      if (!response.ok) {
        throw new Error('Failed to sync with Notion');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Sync Complete",
        description: `Successfully synced ${data.synced_count} notes from Notion`,
      });
      setSelectedRecords([]);
      queryClient.invalidateQueries({ queryKey: ['/api/notion/pages'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notion/synced-notes'] });
    },
    onError: (error: any) => {
      toast({
        title: "Sync Error",
        description: error.message || "Failed to sync with Notion",
        variant: "destructive",
      });
    },
  });

  // Refresh Notion data mutation
  const refreshMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/notion/refresh', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to refresh Notion data');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Refresh Complete",
        description: `Fetched ${data.pages_count} pages from Notion`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/notion/pages'] });
    },
    onError: (error: any) => {
      toast({
        title: "Refresh Error",
        description: error.message || "Failed to refresh Notion data",
        variant: "destructive",
      });
    },
  });

  // Delete synced notes mutation
  const deleteMutation = useMutation({
    mutationFn: async (noteIds: number[]) => {
      const response = await fetch('/api/notion/delete-notes', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ noteIds }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete notes');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Delete Complete",
        description: `Deleted ${data.deleted_count} notes from database`,
      });
      setSelectedRecords([]);
      queryClient.invalidateQueries({ queryKey: ['/api/notion/synced-notes'] });
    },
    onError: (error: any) => {
      toast({
        title: "Delete Error",
        description: error.message || "Failed to delete notes",
        variant: "destructive",
      });
    },
  });

  // Helper functions
  const getPageTitle = (page: NotionPage): string => {
    const titleProp = page.properties?.title || page.properties?.Name;
    if (titleProp?.title && titleProp.title.length > 0) {
      return titleProp.title[0].text.content;
    }
    return 'Untitled';
  };

  const getPageStatus = (page: NotionPage): string | null => {
    return page.properties?.Status?.select?.name || null;
  };

  const getPageCategory = (page: NotionPage): string | null => {
    return page.properties?.Category?.select?.name || null;
  };

  const getPageTags = (page: NotionPage): string[] => {
    return page.properties?.Tags?.multi_select?.map(tag => tag.name) || [];
  };

  const isPageSynced = (notionId: string): boolean => {
    return syncedNotes.some(note => note.notion_id === notionId);
  };

  const getSyncedNote = (notionId: string): SyncedNote | undefined => {
    return syncedNotes.find(note => note.notion_id === notionId);
  };

  // Handle sync selected records
  const handleSyncSelected = () => {
    if (selectedRecords.length === 0) {
      toast({
        title: "No Pages Selected",
        description: "Please select pages to sync with the database",
        variant: "destructive",
      });
      return;
    }
    syncMutation.mutate(selectedRecords);
  };

  // Handle sync all visible records
  const handleSyncAll = () => {
    syncMutation.mutate();
  };

  // Handle delete selected synced notes
  const handleDeleteSelected = () => {
    const noteIds = selectedRecords.map(pageId => {
      const note = getSyncedNote(pageId);
      return note?.id;
    }).filter(Boolean) as number[];

    if (noteIds.length === 0) {
      toast({
        title: "No Synced Notes Selected",
        description: "Please select synced notes to delete from database",
        variant: "destructive",
      });
      return;
    }
    deleteMutation.mutate(noteIds);
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

  // Get unique values for filters
  const uniqueStatuses = useMemo(() => {
    return Array.from(new Set(notionPages.map(p => getPageStatus(p)).filter(Boolean)));
  }, [notionPages]);

  const uniqueCategories = useMemo(() => {
    return Array.from(new Set(notionPages.map(p => getPageCategory(p)).filter(Boolean)));
  }, [notionPages]);

  const uniqueTags = useMemo(() => {
    const allTags = notionPages.flatMap(p => getPageTags(p));
    return Array.from(new Set(allTags));
  }, [notionPages]);

  // Filter and search functionality
  const filteredPages = useMemo(() => {
    return notionPages.filter((page: NotionPage) => {
      const title = getPageTitle(page);
      const status = getPageStatus(page);
      const category = getPageCategory(page);
      const tags = getPageTags(page);
      const isSynced = isPageSynced(page.id);

      const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = statusFilter === 'all' || status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || category === categoryFilter;
      const matchesTag = tagFilter === 'all' || tags.includes(tagFilter);
      const matchesSyncStatus = showSynced === 'all' || 
                               (showSynced === 'synced' && isSynced) ||
                               (showSynced === 'unsynced' && !isSynced);

      return matchesSearch && matchesStatus && matchesCategory && matchesTag && matchesSyncStatus;
    });
  }, [notionPages, searchTerm, statusFilter, categoryFilter, tagFilter, showSynced, syncedNotes]);

  // Sorted pages
  const sortedPages = useMemo(() => {
    return [...filteredPages].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'title':
          aValue = getPageTitle(a);
          bValue = getPageTitle(b);
          break;
        case 'status':
          aValue = getPageStatus(a) || '';
          bValue = getPageStatus(b) || '';
          break;
        case 'category':
          aValue = getPageCategory(a) || '';
          bValue = getPageCategory(b) || '';
          break;
        case 'created_time':
          aValue = new Date(a.created_time);
          bValue = new Date(b.created_time);
          break;
        case 'last_edited_time':
          aValue = new Date(a.last_edited_time);
          bValue = new Date(b.last_edited_time);
          break;
        case 'last_synced':
          const syncedA = getSyncedNote(a.id);
          const syncedB = getSyncedNote(b.id);
          aValue = syncedA ? new Date(syncedA.last_synced) : new Date(0);
          bValue = syncedB ? new Date(syncedB.last_synced) : new Date(0);
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredPages, sortField, sortDirection, syncedNotes]);

  // Pagination
  const totalPages = Math.ceil(sortedPages.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPages = sortedPages.slice(startIndex, startIndex + itemsPerPage);

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge color
  const getStatusColor = (status: string | null) => {
    if (!status) return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    
    switch (status.toLowerCase()) {
      case 'published': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'draft': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'in progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'archived': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'review': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4 opacity-50" />;
    return sortDirection === 'asc' ? 
      <ArrowUpDown className="h-4 w-4 rotate-180" /> : 
      <ArrowUpDown className="h-4 w-4" />;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header pageTitle="Notion Notes" />

      <div className="container mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-purple-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notion Notes Management</h1>
                <p className="text-gray-600 dark:text-gray-400">Sync and manage your notes from Notion</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => refreshMutation.mutate()}
                disabled={refreshMutation.isPending}
                variant="outline"
                className="border-purple-600 text-purple-600 hover:bg-purple-50"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
                {refreshMutation.isPending ? 'Refreshing...' : 'Refresh from Notion'}
              </Button>
              {selectedRecords.length > 0 && (
                <>
                  <Button
                    onClick={handleSyncSelected}
                    disabled={syncMutation.isPending}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <RotateCw className="h-4 w-4 mr-2" />
                    {syncMutation.isPending ? 'Syncing...' : `Sync Selected (${selectedRecords.length})`}
                  </Button>
                  <Button
                    onClick={handleDeleteSelected}
                    disabled={deleteMutation.isPending}
                    variant="destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {deleteMutation.isPending ? 'Deleting...' : 'Delete Selected'}
                  </Button>
                </>
              )}
              <Button
                onClick={handleSyncAll}
                disabled={syncMutation.isPending}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Upload className="h-4 w-4 mr-2" />
                {syncMutation.isPending ? 'Syncing...' : 'Sync All'}
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-600" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Total Pages</h3>
              </div>
              <p className="text-2xl font-bold text-purple-600 mt-1">{notionPages.length}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Synced Notes</h3>
              </div>
              <p className="text-2xl font-bold text-green-600 mt-1">{syncedNotes.length}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Pending Sync</h3>
              </div>
              <p className="text-2xl font-bold text-yellow-600 mt-1">
                {notionPages.length - syncedNotes.length}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Filtered</h3>
              </div>
              <p className="text-2xl font-bold text-blue-600 mt-1">{filteredPages.length}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Selected</h3>
              </div>
              <p className="text-2xl font-bold text-orange-600 mt-1">{selectedRecords.length}</p>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {uniqueStatuses.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {uniqueCategories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={tagFilter} onValueChange={setTagFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Tags" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tags</SelectItem>
                {uniqueTags.map(tag => (
                  <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={showSynced} onValueChange={setShowSynced}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Sync Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Notes</SelectItem>
                <SelectItem value="synced">Synced Only</SelectItem>
                <SelectItem value="unsynced">Unsynced Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Error State */}
        {notionError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <h3 className="font-semibold text-red-800 dark:text-red-200">Connection Error</h3>
            </div>
            <p className="text-red-700 dark:text-red-300 mt-1">
              Unable to connect to Notion. Please check your integration credentials in the API Keys section.
            </p>
          </div>
        )}

        {/* Loading State */}
        {(notionLoading || notesLoading) && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
            <p className="text-gray-600 dark:text-gray-400">Loading Notion data...</p>
          </div>
        )}

        {/* Data Table */}
        {!notionLoading && !notesLoading && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedRecords.length === paginatedPages.length && paginatedPages.length > 0}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedRecords(paginatedPages.map(page => page.id));
                        } else {
                          setSelectedRecords([]);
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('title')}>
                    <div className="flex items-center gap-2">
                      Title
                      {getSortIcon('title')}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('status')}>
                    <div className="flex items-center gap-2">
                      Status
                      {getSortIcon('status')}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('category')}>
                    <div className="flex items-center gap-2">
                      Category
                      {getSortIcon('category')}
                    </div>
                  </TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('created_time')}>
                    <div className="flex items-center gap-2">
                      Created
                      {getSortIcon('created_time')}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('last_edited_time')}>
                    <div className="flex items-center gap-2">
                      Last Edited
                      {getSortIcon('last_edited_time')}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('last_synced')}>
                    <div className="flex items-center gap-2">
                      Sync Status
                      {getSortIcon('last_synced')}
                    </div>
                  </TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedPages.map((page: NotionPage) => {
                  const syncedNote = getSyncedNote(page.id);
                  const tags = getPageTags(page);
                  
                  return (
                    <TableRow key={page.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedRecords.includes(page.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedRecords([...selectedRecords, page.id]);
                            } else {
                              setSelectedRecords(selectedRecords.filter(id => id !== page.id));
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <div className="font-medium text-gray-900 dark:text-white truncate">
                            {getPageTitle(page)}
                          </div>
                          {syncedNote?.content_preview && (
                            <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                              {syncedNote.content_preview}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getPageStatus(page) && (
                          <Badge className={getStatusColor(getPageStatus(page))}>
                            {getPageStatus(page)}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {getPageCategory(page) && (
                          <Badge variant="outline">
                            {getPageCategory(page)}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              <Tag className="h-3 w-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                          {tags.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(page.created_time)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(page.last_edited_time)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {syncedNote ? (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Synced
                          </Badge>
                        ) : (
                          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                            <Clock className="h-3 w-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                        {syncedNote && (
                          <div className="text-xs text-gray-500 mt-1">
                            {formatDate(syncedNote.last_synced)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(page.url, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          {syncedNote && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                // Could implement a preview modal here
                                toast({
                                  title: "Note Preview",
                                  description: syncedNote.content_preview || "No preview available",
                                });
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, sortedPages.length)} of {sortedPages.length} results
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