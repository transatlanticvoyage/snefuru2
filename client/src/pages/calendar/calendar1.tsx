import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
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
import { Star, Flag, ChevronLeft, ChevronRight, Search, Filter, Calendar, Clock, MapPin, Users, ExternalLink, Sparkles } from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  start_date: string;
  start_time: string;
  end_date: string;
  end_time: string;
  location: string;
  attendees: string[];
  organizer: string;
  calendar_source: 'google' | 'outlook' | 'busycal' | 'apple' | 'other';
  event_type: 'meeting' | 'appointment' | 'reminder' | 'task' | 'other';
  status: 'confirmed' | 'tentative' | 'cancelled';
  priority: 'high' | 'medium' | 'low';
  is_all_day: boolean;
  is_recurring: boolean;
  recurrence_pattern?: string;
  reminder_minutes: number;
  created_at: string;
  updated_at: string;
  timezone: string;
  color: string;
  is_starred: boolean;
  is_flagged: boolean;
  is_important: boolean;
  notes: string;
  meeting_url?: string;
  attachments: string[];
}

const CalendarPage: React.FC = () => {
  const queryClient = useQueryClient();
  
  // Fetch real calendar events from database
  const { data: calendarEvents = [], isLoading, error } = useQuery({
    queryKey: ['/api/calendar/events'],
    retry: false,
  });

  // Fetch calendar connections
  const { data: connections = [] } = useQuery({
    queryKey: ['/api/calendar/connections'],
    retry: false,
  });

  // Sync calendar mutation
  const syncMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/calendar/sync', {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to sync calendar');
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: data.message || "Calendar synced successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/calendar/events'] });
      queryClient.invalidateQueries({ queryKey: ['/api/calendar/connections'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to sync calendar",
        variant: "destructive",
      });
    },
  });

  // Update event mutation (for star, flag, important)
  const updateEventMutation = useMutation({
    mutationFn: async ({ eventId, updates }: { eventId: number; updates: any }) => {
      const response = await fetch(`/api/calendar/events/${eventId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        throw new Error('Failed to update event');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/calendar/events'] });
    },
  });

  // State management
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<string>('start_date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const rowsPerPage = 10;

  // Use real calendar data from API
  const calendarData = calendarEvents || [];

  // Filter and search functionality
  const filteredData = calendarData.filter((event: any) => {
    const matchesSearch = event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSource = sourceFilter === 'all' || event.calendar_source === sourceFilter;
    const matchesType = typeFilter === 'all' || event.event_type === typeFilter;
    const matchesPriority = priorityFilter === 'all' || event.priority === priorityFilter;
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    
    return matchesSearch && matchesSource && matchesType && matchesPriority && matchesStatus;
  });

  // Sort functionality
  const sortedData = [...filteredData].sort((a: any, b: any) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    if (sortField === 'start_date' || sortField === 'end_date') {
      aValue = new Date(aValue + ' ' + (sortField === 'start_date' ? a.start_time : a.end_time));
      bValue = new Date(bValue + ' ' + (sortField === 'start_date' ? b.start_time : b.end_time));
    }
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + rowsPerPage);

  // Handle sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Handle event actions
  const toggleStar = (eventId: string) => {
    const event = calendarData.find((e: any) => e.id === eventId);
    if (event) {
      updateEventMutation.mutate({
        eventId: parseInt(eventId),
        updates: { is_starred: !event.is_starred }
      });
    }
  };

  const toggleFlag = (eventId: string) => {
    const event = calendarData.find((e: any) => e.id === eventId);
    if (event) {
      updateEventMutation.mutate({
        eventId: parseInt(eventId),
        updates: { is_flagged: !event.is_flagged }
      });
    }
  };

  const toggleImportant = (eventId: string) => {
    const event = calendarData.find((e: any) => e.id === eventId);
    if (event) {
      updateEventMutation.mutate({
        eventId: parseInt(eventId),
        updates: { is_important: !event.is_important }
      });
    }
  };

  // Handle Google Calendar connection
  const connectGoogleCalendar = async () => {
    try {
      const response = await fetch('/api/calendar/auth/google', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to get authentication URL');
      }
      
      const data = await response.json();
      
      if (data.success && data.authUrl) {
        // Redirect to Google's authentication page
        window.location.href = data.authUrl;
      } else {
        throw new Error('Invalid response from authentication service');
      }
    } catch (error: any) {
      toast({
        title: "Authentication Error",
        description: error.message || "Failed to connect to Google Calendar",
        variant: "destructive",
      });
    }
  };

  // Format date and time
  const formatDateTime = (date: string, time: string) => {
    const dateObj = new Date(`${date}T${time}`);
    return dateObj.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDuration = (startDate: string, startTime: string, endDate: string, endTime: string) => {
    const start = new Date(`${startDate}T${startTime}`);
    const end = new Date(`${endDate}T${endTime}`);
    const durationMs = end.getTime() - start.getTime();
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getSourceBadgeColor = (source: string) => {
    switch (source) {
      case 'google': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'outlook': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'apple': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      default: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'meeting': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'appointment': return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300';
      case 'reminder': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'task': return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300';
      default: return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300';
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'tentative': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header pageTitle="Calendar Management" />
      
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Calendar Management</h1>
              <p className="text-gray-600 dark:text-gray-400">Sync and manage your calendar events from multiple sources</p>
            </div>
            <div className="flex gap-3">
              {connections.length === 0 ? (
                <Button 
                  onClick={connectGoogleCalendar}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  Connect Google Calendar
                </Button>
              ) : (
                <Button 
                  onClick={() => syncMutation.mutate()}
                  disabled={syncMutation.isPending}
                  className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  {syncMutation.isPending ? 'Syncing...' : 'Sync Calendars'}
                </Button>
              )}
            </div>
          </div>
          
          {/* Connection Status */}
          {connections.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold mb-3">Connected Calendars</h3>
              <div className="flex flex-wrap gap-2">
                {connections.map((connection: any) => (
                  <Badge key={connection.id} className="bg-green-100 text-green-800">
                    <Calendar className="h-3 w-3 mr-1" />
                    {connection.calendar_name || 'Google Calendar'}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="google">Google</SelectItem>
                <SelectItem value="outlook">Outlook</SelectItem>
                <SelectItem value="apple">Apple</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="meeting">Meeting</SelectItem>
                <SelectItem value="appointment">Appointment</SelectItem>
                <SelectItem value="reminder">Reminder</SelectItem>
                <SelectItem value="task">Task</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="tentative">Tentative</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Events Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading calendar events...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <p className="text-red-600 dark:text-red-400">Error loading calendar events. Please try again.</p>
            </div>
          ) : calendarData.length === 0 ? (
            <div className="p-8 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No calendar events found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {connections.length === 0 
                  ? "Connect your Google Calendar to see your events here"
                  : "No events found. Try syncing your calendar or adjusting your filters."
                }
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox 
                        checked={selectedEvents.length === paginatedData.length && paginatedData.length > 0}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedEvents(paginatedData.map((event: any) => event.id));
                          } else {
                            setSelectedEvents([]);
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                      onClick={() => handleSort('title')}
                    >
                      Event Title
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                      onClick={() => handleSort('start_date')}
                    >
                      Date & Time
                    </TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((event: any) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        <Checkbox 
                          checked={selectedEvents.includes(event.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedEvents([...selectedEvents, event.id]);
                            } else {
                              setSelectedEvents(selectedEvents.filter(id => id !== event.id));
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {event.title || 'Untitled Event'}
                          </div>
                          {event.description && (
                            <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                              {event.description}
                            </div>
                          )}
                          {event.attendees && event.attendees.length > 0 && (
                            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                              <Users className="h-3 w-3" />
                              {event.attendees.length} attendee{event.attendees.length !== 1 ? 's' : ''}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm font-medium">
                            {formatDateTime(event.start_date, event.start_time)}
                          </div>
                          {event.is_all_day && (
                            <Badge variant="outline" className="text-xs">All Day</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Clock className="h-3 w-3 text-gray-400" />
                          {formatDuration(event.start_date, event.start_time, event.end_date, event.end_time)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {event.location && (
                          <div className="flex items-center gap-1 text-sm">
                            <MapPin className="h-3 w-3 text-gray-400" />
                            <span className="truncate max-w-32">{event.location}</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={getSourceBadgeColor(event.calendar_source)}>
                          {event.calendar_source}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getTypeBadgeColor(event.event_type)}>
                          {event.event_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityBadgeColor(event.priority)}>
                          {event.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeColor(event.status)}>
                          {event.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleStar(event.id)}
                            className={`h-8 w-8 p-0 ${event.is_starred ? 'text-yellow-500' : 'text-gray-400'}`}
                          >
                            <Star className="h-4 w-4" fill={event.is_starred ? 'currentColor' : 'none'} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleFlag(event.id)}
                            className={`h-8 w-8 p-0 ${event.is_flagged ? 'text-red-500' : 'text-gray-400'}`}
                          >
                            <Flag className="h-4 w-4" fill={event.is_flagged ? 'currentColor' : 'none'} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleImportant(event.id)}
                            className={`h-8 w-8 p-0 ${event.is_important ? 'text-orange-500' : 'text-gray-400'}`}
                          >
                            <Sparkles className="h-4 w-4" fill={event.is_important ? 'currentColor' : 'none'} />
                          </Button>
                          {event.meeting_url && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(event.meeting_url, '_blank')}
                              className="h-8 w-8 p-0 text-blue-500"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    Showing {startIndex + 1} to {Math.min(startIndex + rowsPerPage, sortedData.length)} of {sortedData.length} events
                  </div>
                  <div className="flex items-center gap-2">
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
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;