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
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { 
  Search, 
  Star, 
  Flag, 
  Edit3, 
  Trash2, 
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  ArrowUpDown,
  Filter
} from 'lucide-react';

// Define interface for calendar event data
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

// Dummy calendar data
const dummyCalendarData: CalendarEvent[] = [
  {
    id: 'cal_001',
    title: 'Project Planning Meeting',
    description: 'Quarterly planning session for Q2 2025',
    start_date: '2025-05-26',
    start_time: '09:00',
    end_date: '2025-05-26',
    end_time: '10:30',
    location: 'Conference Room A',
    attendees: ['john@company.com', 'sarah@company.com', 'mike@company.com'],
    organizer: 'project.manager@company.com',
    calendar_source: 'google',
    event_type: 'meeting',
    status: 'confirmed',
    priority: 'high',
    is_all_day: false,
    is_recurring: false,
    reminder_minutes: 15,
    created_at: '2025-05-20T14:30:00Z',
    updated_at: '2025-05-22T09:15:00Z',
    timezone: 'America/New_York',
    color: '#4285f4',
    is_starred: true,
    is_flagged: false,
    is_important: true,
    notes: 'Bring laptop and quarterly reports',
    meeting_url: 'https://meet.google.com/abc-defg-hij',
    attachments: ['Q2_Planning_Agenda.pdf']
  },
  {
    id: 'cal_002',
    title: 'Client Call - Acme Corp',
    description: 'Monthly check-in with Acme Corporation',
    start_date: '2025-05-26',
    start_time: '14:00',
    end_date: '2025-05-26',
    end_time: '15:00',
    location: 'Virtual',
    attendees: ['client@acme.com', 'account.manager@company.com'],
    organizer: 'sales@company.com',
    calendar_source: 'outlook',
    event_type: 'meeting',
    status: 'confirmed',
    priority: 'medium',
    is_all_day: false,
    is_recurring: true,
    recurrence_pattern: 'Monthly on the 26th',
    reminder_minutes: 30,
    created_at: '2025-05-15T10:00:00Z',
    updated_at: '2025-05-24T16:20:00Z',
    timezone: 'America/New_York',
    color: '#34a853',
    is_starred: false,
    is_flagged: true,
    is_important: false,
    notes: 'Review monthly metrics and discuss next steps',
    meeting_url: 'https://teams.microsoft.com/xyz123',
    attachments: ['Monthly_Report_April.xlsx']
  },
  {
    id: 'cal_003',
    title: 'Doctor Appointment',
    description: 'Annual checkup with Dr. Smith',
    start_date: '2025-05-27',
    start_time: '11:00',
    end_date: '2025-05-27',
    end_time: '12:00',
    location: 'Medical Center, 123 Health St',
    attendees: [],
    organizer: 'personal@email.com',
    calendar_source: 'apple',
    event_type: 'appointment',
    status: 'confirmed',
    priority: 'medium',
    is_all_day: false,
    is_recurring: false,
    reminder_minutes: 60,
    created_at: '2025-04-15T09:00:00Z',
    updated_at: '2025-04-15T09:00:00Z',
    timezone: 'America/New_York',
    color: '#ea4335',
    is_starred: false,
    is_flagged: false,
    is_important: true,
    notes: 'Bring insurance card and medication list',
    attachments: []
  },
  {
    id: 'cal_004',
    title: 'Team Standup',
    description: 'Daily development team standup',
    start_date: '2025-05-26',
    start_time: '09:30',
    end_date: '2025-05-26',
    end_time: '10:00',
    location: 'Dev Room',
    attendees: ['dev1@company.com', 'dev2@company.com', 'dev3@company.com'],
    organizer: 'scrum.master@company.com',
    calendar_source: 'google',
    event_type: 'meeting',
    status: 'confirmed',
    priority: 'low',
    is_all_day: false,
    is_recurring: true,
    recurrence_pattern: 'Daily (weekdays)',
    reminder_minutes: 5,
    created_at: '2025-01-01T08:00:00Z',
    updated_at: '2025-01-01T08:00:00Z',
    timezone: 'America/New_York',
    color: '#fbbc04',
    is_starred: false,
    is_flagged: false,
    is_important: false,
    notes: 'Share updates on current tasks',
    meeting_url: 'https://zoom.us/j/123456789',
    attachments: []
  },
  {
    id: 'cal_005',
    title: 'Marketing Campaign Review',
    description: 'Review Q2 marketing campaign performance',
    start_date: '2025-05-28',
    start_time: '15:30',
    end_date: '2025-05-28',
    end_time: '17:00',
    location: 'Marketing Office',
    attendees: ['marketing@company.com', 'creative@company.com', 'analytics@company.com'],
    organizer: 'marketing.director@company.com',
    calendar_source: 'busycal',
    event_type: 'meeting',
    status: 'tentative',
    priority: 'medium',
    is_all_day: false,
    is_recurring: false,
    reminder_minutes: 30,
    created_at: '2025-05-20T11:00:00Z',
    updated_at: '2025-05-25T14:30:00Z',
    timezone: 'America/New_York',
    color: '#9c27b0',
    is_starred: true,
    is_flagged: true,
    is_important: true,
    notes: 'Prepare campaign analytics and ROI data',
    attachments: ['Campaign_Analytics_Q2.pdf', 'ROI_Report.xlsx']
  },
  {
    id: 'cal_006',
    title: 'Lunch with Sarah',
    description: 'Catch up lunch meeting',
    start_date: '2025-05-29',
    start_time: '12:30',
    end_date: '2025-05-29',
    end_time: '13:30',
    location: 'Cafe Downtown, 456 Main St',
    attendees: ['sarah.friend@email.com'],
    organizer: 'personal@email.com',
    calendar_source: 'google',
    event_type: 'other',
    status: 'confirmed',
    priority: 'low',
    is_all_day: false,
    is_recurring: false,
    reminder_minutes: 30,
    created_at: '2025-05-23T16:00:00Z',
    updated_at: '2025-05-23T16:00:00Z',
    timezone: 'America/New_York',
    color: '#4285f4',
    is_starred: false,
    is_flagged: false,
    is_important: false,
    notes: 'Discuss weekend plans',
    attachments: []
  },
  {
    id: 'cal_007',
    title: 'Board Meeting',
    description: 'Monthly board of directors meeting',
    start_date: '2025-05-30',
    start_time: '10:00',
    end_date: '2025-05-30',
    end_time: '12:00',
    location: 'Boardroom, 15th Floor',
    attendees: ['board1@company.com', 'board2@company.com', 'ceo@company.com'],
    organizer: 'executive.assistant@company.com',
    calendar_source: 'outlook',
    event_type: 'meeting',
    status: 'confirmed',
    priority: 'high',
    is_all_day: false,
    is_recurring: true,
    recurrence_pattern: 'Monthly on the last Friday',
    reminder_minutes: 60,
    created_at: '2025-01-15T10:00:00Z',
    updated_at: '2025-05-25T09:00:00Z',
    timezone: 'America/New_York',
    color: '#ea4335',
    is_starred: true,
    is_flagged: true,
    is_important: true,
    notes: 'Board package to be sent 48 hours prior',
    attachments: ['Board_Package_May.pdf', 'Financial_Report_Q1.pdf']
  },
  {
    id: 'cal_008',
    title: 'Gym Workout',
    description: 'Evening workout session',
    start_date: '2025-05-26',
    start_time: '18:00',
    end_date: '2025-05-26',
    end_time: '19:30',
    location: 'FitLife Gym, 789 Fitness Ave',
    attendees: [],
    organizer: 'personal@email.com',
    calendar_source: 'apple',
    event_type: 'other',
    status: 'confirmed',
    priority: 'medium',
    is_all_day: false,
    is_recurring: true,
    recurrence_pattern: 'Monday, Wednesday, Friday',
    reminder_minutes: 30,
    created_at: '2025-01-01T12:00:00Z',
    updated_at: '2025-01-01T12:00:00Z',
    timezone: 'America/New_York',
    color: '#34a853',
    is_starred: false,
    is_flagged: false,
    is_important: false,
    notes: 'Leg day - bring protein shake',
    attachments: []
  }
];

const CalendarPage: React.FC = () => {
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
  const [calendarData, setCalendarData] = useState(dummyCalendarData);
  const rowsPerPage = 10;

  // Filter and sort data
  const filteredAndSortedData = calendarData
    .filter(event => {
      const matchesSearch = 
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.organizer.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesSource = sourceFilter === 'all' || event.calendar_source === sourceFilter;
      const matchesType = typeFilter === 'all' || event.event_type === typeFilter;
      const matchesPriority = priorityFilter === 'all' || event.priority === priorityFilter;
      const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
      
      return matchesSearch && matchesSource && matchesType && matchesPriority && matchesStatus;
    })
    .sort((a, b) => {
      let aValue = a[sortField as keyof CalendarEvent];
      let bValue = b[sortField as keyof CalendarEvent];
      
      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();
      
      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedData.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredAndSortedData.slice(indexOfFirstRow, indexOfLastRow);

  // Handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const toggleEventSelection = (eventId: string) => {
    if (selectedEvents.includes(eventId)) {
      setSelectedEvents(selectedEvents.filter(id => id !== eventId));
    } else {
      setSelectedEvents([...selectedEvents, eventId]);
    }
  };

  const toggleStar = (eventId: string) => {
    setCalendarData(prev => prev.map(event => 
      event.id === eventId ? { ...event, is_starred: !event.is_starred } : event
    ));
  };

  const toggleFlag = (eventId: string) => {
    setCalendarData(prev => prev.map(event => 
      event.id === eventId ? { ...event, is_flagged: !event.is_flagged } : event
    ));
  };

  const toggleImportant = (eventId: string) => {
    setCalendarData(prev => prev.map(event => 
      event.id === eventId ? { ...event, is_important: !event.is_important } : event
    ));
  };

  const formatDateTime = (date: string, time: string) => {
    return `${date} ${time}`;
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header pageTitle="Calendar Manager" />
      
      <div className="container mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Header section */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
              <CalendarIcon className="mr-2" size={24} />
              Calendar Events
            </h1>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <CalendarIcon className="mr-2" size={16} />
                Sync Calendars
              </Button>
              <Button variant="outline">
                <Edit3 className="mr-2" size={16} />
                New Event
              </Button>
            </div>
          </div>
          
          {/* Search and filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                type="text"
                placeholder="Search events, descriptions, locations..."
                className="pl-10 pr-4 py-2 w-full"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
            
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Calendar Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="google">Google Calendar</SelectItem>
                <SelectItem value="outlook">Outlook</SelectItem>
                <SelectItem value="apple">Apple Calendar</SelectItem>
                <SelectItem value="busycal">BusyCal</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Event Type" />
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
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="tentative">Tentative</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Bulk actions */}
          {selectedEvents.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-800">
                  {selectedEvents.length} event{selectedEvents.length !== 1 ? 's' : ''} selected
                </span>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Star className="mr-1" size={14} />
                    Star
                  </Button>
                  <Button size="sm" variant="outline">
                    <Flag className="mr-1" size={14} />
                    Flag
                  </Button>
                  <Button size="sm" variant="outline" className="text-green-600">
                    Mark Important
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-600">
                    <Trash2 className="mr-1" size={14} />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <Checkbox 
                      checked={selectedEvents.length === currentRows.length && currentRows.length > 0}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedEvents(currentRows.map(event => event.id));
                        } else {
                          setSelectedEvents([]);
                        }
                      }}
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('title')}
                  >
                    <div className="flex items-center">
                      Title <ArrowUpDown className="ml-1" size={14} />
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('start_date')}
                  >
                    <div className="flex items-center">
                      Start Date/Time <ArrowUpDown className="ml-1" size={14} />
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('end_date')}
                  >
                    <div className="flex items-center">
                      End Date/Time <ArrowUpDown className="ml-1" size={14} />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organizer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendees</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentRows.length > 0 ? (
                  currentRows.map((event) => (
                    <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <Checkbox 
                          checked={selectedEvents.includes(event.id)}
                          onCheckedChange={() => toggleEventSelection(event.id)}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex space-x-1">
                          <button
                            onClick={() => toggleStar(event.id)}
                            className={`p-1 rounded ${event.is_starred ? 'text-yellow-500' : 'text-gray-400'} hover:bg-gray-100`}
                          >
                            <Star size={16} fill={event.is_starred ? 'currentColor' : 'none'} />
                          </button>
                          <button
                            onClick={() => toggleFlag(event.id)}
                            className={`p-1 rounded ${event.is_flagged ? 'text-red-500' : 'text-gray-400'} hover:bg-gray-100`}
                          >
                            <Flag size={16} fill={event.is_flagged ? 'currentColor' : 'none'} />
                          </button>
                          <button
                            onClick={() => toggleImportant(event.id)}
                            className={`p-1 rounded ${event.is_important ? 'text-green-500' : 'text-gray-400'} hover:bg-gray-100`}
                          >
                            <div className={`w-4 h-4 rounded-full ${event.is_important ? 'bg-green-500' : 'bg-gray-300'}`} />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">{event.title}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">{event.description}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Clock className="mr-1" size={14} />
                          {formatDateTime(event.start_date, event.start_time)}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Clock className="mr-1" size={14} />
                          {formatDateTime(event.end_date, event.end_time)}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        <div className="flex items-center">
                          <MapPin className="mr-1" size={14} />
                          <span className="truncate max-w-xs">{event.location}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 truncate max-w-xs">{event.organizer}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          event.calendar_source === 'google' ? 'bg-blue-100 text-blue-800' :
                          event.calendar_source === 'outlook' ? 'bg-indigo-100 text-indigo-800' :
                          event.calendar_source === 'apple' ? 'bg-gray-100 text-gray-800' :
                          event.calendar_source === 'busycal' ? 'bg-purple-100 text-purple-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {event.calendar_source}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          event.event_type === 'meeting' ? 'bg-blue-100 text-blue-800' :
                          event.event_type === 'appointment' ? 'bg-green-100 text-green-800' :
                          event.event_type === 'reminder' ? 'bg-yellow-100 text-yellow-800' :
                          event.event_type === 'task' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {event.event_type}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          event.priority === 'high' ? 'bg-red-100 text-red-800' :
                          event.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {event.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          event.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          event.status === 'tentative' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {event.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Users className="mr-1" size={14} />
                          {event.attendees.length}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={12} className="px-4 py-8 text-center text-gray-500">
                      No calendar events found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <Button 
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                variant="outline"
              >
                Previous
              </Button>
              <Button 
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                variant="outline"
              >
                Next
              </Button>
            </div>
            
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{indexOfFirstRow + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(indexOfLastRow, filteredAndSortedData.length)}
                  </span>{' '}
                  of <span className="font-medium">{filteredAndSortedData.length}</span> results
                </p>
              </div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  
                  {/* First page */}
                  {currentPage > 2 && (
                    <PaginationItem>
                      <PaginationLink onClick={() => handlePageChange(1)}>1</PaginationLink>
                    </PaginationItem>
                  )}
                  
                  {/* Ellipsis if not showing first page */}
                  {currentPage > 3 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}
                  
                  {/* Previous page if not on first page */}
                  {currentPage > 1 && (
                    <PaginationItem>
                      <PaginationLink onClick={() => handlePageChange(currentPage - 1)}>
                        {currentPage - 1}
                      </PaginationLink>
                    </PaginationItem>
                  )}
                  
                  {/* Current page */}
                  <PaginationItem>
                    <PaginationLink isActive onClick={() => handlePageChange(currentPage)}>
                      {currentPage}
                    </PaginationLink>
                  </PaginationItem>
                  
                  {/* Next page if not on last page */}
                  {currentPage < totalPages && (
                    <PaginationItem>
                      <PaginationLink onClick={() => handlePageChange(currentPage + 1)}>
                        {currentPage + 1}
                      </PaginationLink>
                    </PaginationItem>
                  )}
                  
                  {/* Ellipsis if not showing last page */}
                  {currentPage < totalPages - 2 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}
                  
                  {/* Last page */}
                  {currentPage < totalPages - 1 && (
                    <PaginationItem>
                      <PaginationLink onClick={() => handlePageChange(totalPages)}>
                        {totalPages}
                      </PaginationLink>
                    </PaginationItem>
                  )}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;