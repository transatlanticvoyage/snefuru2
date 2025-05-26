import React, { useState } from 'react';
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
  Database,
  ExternalLink,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface AirtableRecord {
  id: string;
  fields: {
    Name?: string;
    Status?: string;
    'Due Date'?: string;
    Priority?: string;
    Description?: string;
    Assignee?: string;
    Tags?: string[];
    'Created Time'?: string;
    'Last Modified'?: string;
  };
  createdTime: string;
}

interface SyncedTask {
  id: number;
  airtable_id: string;
  name: string;
  status: string;
  due_date: string | null;
  priority: string | null;
  description: string | null;
  assignee: string | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
  last_synced: string;
}

export default function AirtableCalendarPage() {
  const queryClient = useQueryClient();
  
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Fetch Airtable records
  const { data: airtableRecords = [], isLoading: airtableLoading, error: airtableError } = useQuery<AirtableRecord[]>({
    queryKey: ['/api/airtable/records'],
    retry: false,
  });

  // Fetch synced tasks from database
  const { data: syncedTasks = [], isLoading: tasksLoading } = useQuery<SyncedTask[]>({
    queryKey: ['/api/airtable/synced-tasks'],
    retry: false,
  });

  // Sync with Airtable mutation
  const syncMutation = useMutation({
    mutationFn: async (recordIds?: string[]) => {
      const response = await fetch('/api/airtable/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ recordIds }),
      });

      if (!response.ok) {
        throw new Error('Failed to sync with Airtable');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Sync Complete",
        description: `Successfully synced ${data.synced_count} records from Airtable`,
      });
      setSelectedRecords([]);
      queryClient.invalidateQueries({ queryKey: ['/api/airtable/records'] });
      queryClient.invalidateQueries({ queryKey: ['/api/airtable/synced-tasks'] });
    },
    onError: (error: any) => {
      toast({
        title: "Sync Error",
        description: error.message || "Failed to sync with Airtable",
        variant: "destructive",
      });
    },
  });

  // Refresh Airtable data mutation
  const refreshMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/airtable/refresh', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to refresh Airtable data');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Refresh Complete",
        description: `Fetched ${data.records_count} records from Airtable`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/airtable/records'] });
    },
    onError: (error: any) => {
      toast({
        title: "Refresh Error",
        description: error.message || "Failed to refresh Airtable data",
        variant: "destructive",
      });
    },
  });

  // Handle sync selected records
  const handleSyncSelected = () => {
    if (selectedRecords.length === 0) {
      toast({
        title: "No Records Selected",
        description: "Please select records to sync with the database",
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

  // Filter and search functionality
  const filteredRecords = airtableRecords.filter((record: AirtableRecord) => {
    const matchesSearch = record.fields.Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.fields.Description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.fields.Assignee?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || record.fields.Status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || record.fields.Priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Pagination
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRecords = filteredRecords.slice(startIndex, startIndex + itemsPerPage);

  // Get unique values for filters
  const uniqueStatuses = Array.from(new Set(airtableRecords.map(r => r.fields.Status).filter(Boolean)));
  const uniquePriorities = Array.from(new Set(airtableRecords.map(r => r.fields.Priority).filter(Boolean)));

  // Check if record is synced
  const isRecordSynced = (airtableId: string) => {
    return syncedTasks.some(task => task.airtable_id === airtableId);
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  // Get priority badge color
  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'in progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'todo': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      case 'blocked': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header pageTitle="Airtable Integration" />

      <div className="container mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Database className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Airtable Task Management</h1>
                <p className="text-gray-600 dark:text-gray-400">Sync and manage tasks from your Airtable base</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => refreshMutation.mutate()}
                disabled={refreshMutation.isPending}
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
                {refreshMutation.isPending ? 'Refreshing...' : 'Refresh from Airtable'}
              </Button>
              {selectedRecords.length > 0 && (
                <Button
                  onClick={handleSyncSelected}
                  disabled={syncMutation.isPending}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <RotateCw className="h-4 w-4 mr-2" />
                  {syncMutation.isPending ? 'Syncing...' : `Sync Selected (${selectedRecords.length})`}
                </Button>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Total Records</h3>
              </div>
              <p className="text-2xl font-bold text-blue-600 mt-1">{airtableRecords.length}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Synced Tasks</h3>
              </div>
              <p className="text-2xl font-bold text-green-600 mt-1">{syncedTasks.length}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Pending Sync</h3>
              </div>
              <p className="text-2xl font-bold text-yellow-600 mt-1">
                {airtableRecords.length - syncedTasks.length}
              </p>
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
                placeholder="Search tasks..."
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
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                {uniquePriorities.map(priority => (
                  <SelectItem key={priority} value={priority}>{priority}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Error State */}
        {airtableError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <h3 className="font-semibold text-red-800 dark:text-red-200">Connection Error</h3>
            </div>
            <p className="text-red-700 dark:text-red-300 mt-1">
              Unable to connect to Airtable. Please check your API credentials in the API Keys section.
            </p>
          </div>
        )}

        {/* Loading State */}
        {(airtableLoading || tasksLoading) && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600 dark:text-gray-400">Loading Airtable data...</p>
          </div>
        )}

        {/* Data Table */}
        {!airtableLoading && !tasksLoading && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedRecords.length === paginatedRecords.length && paginatedRecords.length > 0}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedRecords(paginatedRecords.map(record => record.id));
                        } else {
                          setSelectedRecords([]);
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>Task Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Assignee</TableHead>
                  <TableHead>Sync Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedRecords.map((record: AirtableRecord) => (
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
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {record.fields.Name || 'Untitled Task'}
                        </div>
                        {record.fields.Description && (
                          <div className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-xs">
                            {record.fields.Description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {record.fields.Status && (
                        <Badge className={getStatusColor(record.fields.Status)}>
                          {record.fields.Status}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {record.fields.Priority && (
                        <Badge className={getPriorityColor(record.fields.Priority)}>
                          {record.fields.Priority}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {formatDate(record.fields['Due Date'] || '')}
                    </TableCell>
                    <TableCell>
                      {record.fields.Assignee || '-'}
                    </TableCell>
                    <TableCell>
                      {isRecordSynced(record.id) ? (
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
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`https://airtable.com/${record.id}`, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredRecords.length)} of {filteredRecords.length} results
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