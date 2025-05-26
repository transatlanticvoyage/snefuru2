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
  Star,
  StarOff,
  Flag,
  FlagOff,
  Archive,
  Trash2,
  Mail,
  MailOpen,
  Paperclip,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Filter,
  RefreshCw,
  Inbox,
  Send,
  FileText,
  User,
  Clock,
  Download,
  Reply,
  ReplyAll,
  Forward,
  MoreHorizontal,
  Eye,
  EyeOff
} from 'lucide-react';

interface EmailItem {
  id: string;
  from: {
    email: string;
    name: string;
  };
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  bodyPreview: string;
  receivedDateTime: string;
  sentDateTime?: string;
  isRead: boolean;
  hasAttachments: boolean;
  importance: 'low' | 'normal' | 'high';
  flag: {
    flagStatus: 'notFlagged' | 'flagged' | 'complete';
  };
  categories: string[];
  conversationId: string;
  parentFolderId: string;
  webLink: string;
  isStarred?: boolean;
  size?: number;
}

type SortField = 'subject' | 'from' | 'receivedDateTime' | 'size' | 'importance';
type SortDirection = 'asc' | 'desc';

export default function EmailManagerPage() {
  const queryClient = useQueryClient();
  
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [folderFilter, setFolderFilter] = useState('all');
  const [readFilter, setReadFilter] = useState('all'); // 'all', 'read', 'unread'
  const [flagFilter, setFlagFilter] = useState('all'); // 'all', 'flagged', 'unflagged'
  const [starFilter, setStarFilter] = useState('all'); // 'all', 'starred', 'unstarred'
  const [importanceFilter, setImportanceFilter] = useState('all');
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('receivedDateTime');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [showPreview, setShowPreview] = useState(true);
  const [selectedEmail, setSelectedEmail] = useState<EmailItem | null>(null);
  const itemsPerPage = 50;

  // Mock email data - replace with actual email API integration
  const mockEmails: EmailItem[] = [
    {
      id: '1',
      from: { email: 'sarah.johnson@company.com', name: 'Sarah Johnson' },
      to: ['you@example.com'],
      subject: 'Q4 Financial Report - Review Required',
      body: 'Please review the attached Q4 financial report...',
      bodyPreview: 'Please review the attached Q4 financial report and provide feedback by end of week.',
      receivedDateTime: '2025-01-26T09:30:00Z',
      isRead: false,
      hasAttachments: true,
      importance: 'high',
      flag: { flagStatus: 'flagged' },
      categories: ['Work', 'Finance'],
      conversationId: 'conv1',
      parentFolderId: 'inbox',
      webLink: '#',
      isStarred: true,
      size: 2048000
    },
    {
      id: '2',
      from: { email: 'marketing@newsletter.com', name: 'Weekly Newsletter' },
      to: ['you@example.com'],
      subject: 'This Week in Tech: AI Breakthroughs',
      body: 'Welcome to this week\'s tech newsletter...',
      bodyPreview: 'Welcome to this week\'s tech newsletter featuring the latest AI breakthroughs.',
      receivedDateTime: '2025-01-26T08:15:00Z',
      isRead: true,
      hasAttachments: false,
      importance: 'normal',
      flag: { flagStatus: 'notFlagged' },
      categories: ['Newsletter'],
      conversationId: 'conv2',
      parentFolderId: 'inbox',
      webLink: '#',
      isStarred: false,
      size: 45000
    },
    {
      id: '3',
      from: { email: 'team@project.com', name: 'Project Team' },
      to: ['you@example.com'],
      cc: ['manager@company.com'],
      subject: 'Meeting Notes - Sprint Planning',
      body: 'Here are the notes from today\'s sprint planning meeting...',
      bodyPreview: 'Here are the notes from today\'s sprint planning meeting with action items.',
      receivedDateTime: '2025-01-25T16:45:00Z',
      isRead: false,
      hasAttachments: true,
      importance: 'normal',
      flag: { flagStatus: 'complete' },
      categories: ['Work', 'Meetings'],
      conversationId: 'conv3',
      parentFolderId: 'inbox',
      webLink: '#',
      isStarred: false,
      size: 128000
    },
    {
      id: '4',
      from: { email: 'support@service.com', name: 'Customer Support' },
      to: ['you@example.com'],
      subject: 'Your ticket has been resolved',
      body: 'We\'re happy to inform you that your support ticket...',
      bodyPreview: 'We\'re happy to inform you that your support ticket #12345 has been resolved.',
      receivedDateTime: '2025-01-25T14:20:00Z',
      isRead: true,
      hasAttachments: false,
      importance: 'low',
      flag: { flagStatus: 'notFlagged' },
      categories: ['Support'],
      conversationId: 'conv4',
      parentFolderId: 'inbox',
      webLink: '#',
      isStarred: false,
      size: 32000
    },
    {
      id: '5',
      from: { email: 'alerts@system.com', name: 'System Alerts' },
      to: ['you@example.com'],
      subject: 'Server Maintenance Scheduled',
      body: 'Scheduled maintenance will occur this weekend...',
      bodyPreview: 'Scheduled maintenance will occur this weekend from 2 AM to 6 AM EST.',
      receivedDateTime: '2025-01-25T11:30:00Z',
      isRead: false,
      hasAttachments: false,
      importance: 'high',
      flag: { flagStatus: 'flagged' },
      categories: ['System', 'Maintenance'],
      conversationId: 'conv5',
      parentFolderId: 'inbox',
      webLink: '#',
      isStarred: true,
      size: 18000
    }
  ];

  // Fetch emails (using mock data for now)
  const { data: emails = [], isLoading, error } = useQuery<EmailItem[]>({
    queryKey: ['/api/emails'],
    queryFn: () => Promise.resolve(mockEmails), // Replace with actual API call
    retry: false,
  });

  // Email action mutations
  const markAsReadMutation = useMutation({
    mutationFn: async (emailIds: string[]) => {
      // Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true };
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Emails marked as read" });
      queryClient.invalidateQueries({ queryKey: ['/api/emails'] });
    },
  });

  const toggleStarMutation = useMutation({
    mutationFn: async ({ emailIds, starred }: { emailIds: string[], starred: boolean }) => {
      // Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true };
    },
    onSuccess: (_, { starred }) => {
      toast({ 
        title: "Success", 
        description: starred ? "Emails starred" : "Emails unstarred" 
      });
      queryClient.invalidateQueries({ queryKey: ['/api/emails'] });
    },
  });

  const toggleFlagMutation = useMutation({
    mutationFn: async ({ emailIds, flagged }: { emailIds: string[], flagged: boolean }) => {
      // Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true };
    },
    onSuccess: (_, { flagged }) => {
      toast({ 
        title: "Success", 
        description: flagged ? "Emails flagged" : "Emails unflagged" 
      });
      queryClient.invalidateQueries({ queryKey: ['/api/emails'] });
    },
  });

  const archiveEmailsMutation = useMutation({
    mutationFn: async (emailIds: string[]) => {
      // Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true };
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Emails archived" });
      setSelectedEmails([]);
      queryClient.invalidateQueries({ queryKey: ['/api/emails'] });
    },
  });

  const deleteEmailsMutation = useMutation({
    mutationFn: async (emailIds: string[]) => {
      // Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true };
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Emails deleted" });
      setSelectedEmails([]);
      queryClient.invalidateQueries({ queryKey: ['/api/emails'] });
    },
  });

  // Helper functions
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays <= 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' KB';
    return Math.round(bytes / (1024 * 1024)) + ' MB';
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'low': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getFlagColor = (flagStatus: string) => {
    switch (flagStatus) {
      case 'flagged': return 'text-red-600';
      case 'complete': return 'text-green-600';
      default: return 'text-gray-400';
    }
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
  const filteredEmails = useMemo(() => {
    return emails.filter((email: EmailItem) => {
      const matchesSearch = email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           email.from.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           email.from.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           email.bodyPreview.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRead = readFilter === 'all' || 
                         (readFilter === 'read' && email.isRead) ||
                         (readFilter === 'unread' && !email.isRead);

      const matchesFlag = flagFilter === 'all' || 
                         (flagFilter === 'flagged' && email.flag.flagStatus === 'flagged') ||
                         (flagFilter === 'unflagged' && email.flag.flagStatus === 'notFlagged');

      const matchesStar = starFilter === 'all' || 
                         (starFilter === 'starred' && email.isStarred) ||
                         (starFilter === 'unstarred' && !email.isStarred);

      const matchesImportance = importanceFilter === 'all' || email.importance === importanceFilter;

      return matchesSearch && matchesRead && matchesFlag && matchesStar && matchesImportance;
    });
  }, [emails, searchTerm, readFilter, flagFilter, starFilter, importanceFilter]);

  // Sorted emails
  const sortedEmails = useMemo(() => {
    return [...filteredEmails].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'subject':
          aValue = a.subject;
          bValue = b.subject;
          break;
        case 'from':
          aValue = a.from.name;
          bValue = b.from.name;
          break;
        case 'receivedDateTime':
          aValue = new Date(a.receivedDateTime);
          bValue = new Date(b.receivedDateTime);
          break;
        case 'size':
          aValue = a.size || 0;
          bValue = b.size || 0;
          break;
        case 'importance':
          const importanceOrder = { high: 3, normal: 2, low: 1 };
          aValue = importanceOrder[a.importance];
          bValue = importanceOrder[b.importance];
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredEmails, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(sortedEmails.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEmails = sortedEmails.slice(startIndex, startIndex + itemsPerPage);

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4 opacity-50" />;
    return sortDirection === 'asc' ? 
      <ArrowUpDown className="h-4 w-4 rotate-180" /> : 
      <ArrowUpDown className="h-4 w-4" />;
  };

  const handleSelectAll = () => {
    if (selectedEmails.length === paginatedEmails.length) {
      setSelectedEmails([]);
    } else {
      setSelectedEmails(paginatedEmails.map(email => email.id));
    }
  };

  const handleSelectEmail = (emailId: string) => {
    if (selectedEmails.includes(emailId)) {
      setSelectedEmails(selectedEmails.filter(id => id !== emailId));
    } else {
      setSelectedEmails([...selectedEmails, emailId]);
    }
  };

  const unreadCount = emails.filter(email => !email.isRead).length;
  const flaggedCount = emails.filter(email => email.flag.flagStatus === 'flagged').length;
  const starredCount = emails.filter(email => email.isStarred).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header pageTitle="Email Manager" />

      <div className="container mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Mail className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Email Manager</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage and organize your emails efficiently</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/emails'] })}
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button
                onClick={() => setShowPreview(!showPreview)}
                variant="outline"
              >
                {showPreview ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border">
              <div className="flex items-center gap-2">
                <Inbox className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Total Emails</h3>
              </div>
              <p className="text-2xl font-bold text-blue-600 mt-1">{emails.length}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border">
              <div className="flex items-center gap-2">
                <MailOpen className="h-5 w-5 text-orange-600" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Unread</h3>
              </div>
              <p className="text-2xl font-bold text-orange-600 mt-1">{unreadCount}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border">
              <div className="flex items-center gap-2">
                <Flag className="h-5 w-5 text-red-600" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Flagged</h3>
              </div>
              <p className="text-2xl font-bold text-red-600 mt-1">{flaggedCount}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-600" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Starred</h3>
              </div>
              <p className="text-2xl font-bold text-yellow-600 mt-1">{starredCount}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-purple-600" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Filtered</h3>
              </div>
              <p className="text-2xl font-bold text-purple-600 mt-1">{filteredEmails.length}</p>
            </div>
          </div>

          {/* Action Bar */}
          {selectedEmails.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-blue-800 dark:text-blue-200 font-medium">
                  {selectedEmails.length} email(s) selected
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => markAsReadMutation.mutate(selectedEmails)}
                    disabled={markAsReadMutation.isPending}
                  >
                    <MailOpen className="h-4 w-4 mr-1" />
                    Mark Read
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleStarMutation.mutate({ emailIds: selectedEmails, starred: true })}
                    disabled={toggleStarMutation.isPending}
                  >
                    <Star className="h-4 w-4 mr-1" />
                    Star
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleFlagMutation.mutate({ emailIds: selectedEmails, flagged: true })}
                    disabled={toggleFlagMutation.isPending}
                  >
                    <Flag className="h-4 w-4 mr-1" />
                    Flag
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => archiveEmailsMutation.mutate(selectedEmails)}
                    disabled={archiveEmailsMutation.isPending}
                  >
                    <Archive className="h-4 w-4 mr-1" />
                    Archive
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteEmailsMutation.mutate(selectedEmails)}
                    disabled={deleteEmailsMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
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
                placeholder="Search emails..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={readFilter} onValueChange={setReadFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Read Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="read">Read</SelectItem>
              </SelectContent>
            </Select>
            <Select value={flagFilter} onValueChange={setFlagFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Flag Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="flagged">Flagged</SelectItem>
                <SelectItem value="unflagged">Unflagged</SelectItem>
              </SelectContent>
            </Select>
            <Select value={starFilter} onValueChange={setStarFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Star Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="starred">Starred</SelectItem>
                <SelectItem value="unstarred">Unstarred</SelectItem>
              </SelectContent>
            </Select>
            <Select value={importanceFilter} onValueChange={setImportanceFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Importance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600 dark:text-gray-400">Loading emails...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-800 dark:text-red-200">
              Unable to load emails. Please check your email connection settings.
            </p>
          </div>
        )}

        {/* Email Table */}
        {!isLoading && !error && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedEmails.length === paginatedEmails.length && paginatedEmails.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="w-12"></TableHead>
                  <TableHead className="w-12"></TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('from')}>
                    <div className="flex items-center gap-2">
                      From
                      {getSortIcon('from')}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('subject')}>
                    <div className="flex items-center gap-2">
                      Subject
                      {getSortIcon('subject')}
                    </div>
                  </TableHead>
                  <TableHead>Attachments</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('receivedDateTime')}>
                    <div className="flex items-center gap-2">
                      Date
                      {getSortIcon('receivedDateTime')}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('size')}>
                    <div className="flex items-center gap-2">
                      Size
                      {getSortIcon('size')}
                    </div>
                  </TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedEmails.map((email) => (
                  <TableRow 
                    key={email.id}
                    className={`${!email.isRead ? 'font-semibold bg-blue-50 dark:bg-blue-900/10' : ''} hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer`}
                    onClick={() => setSelectedEmail(email)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedEmails.includes(email.id)}
                        onCheckedChange={() => handleSelectEmail(email.id)}
                      />
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => toggleStarMutation.mutate({ 
                          emailIds: [email.id], 
                          starred: !email.isStarred 
                        })}
                      >
                        {email.isStarred ? 
                          <Star className="h-4 w-4 text-yellow-500 fill-current" /> : 
                          <StarOff className="h-4 w-4 text-gray-400" />
                        }
                      </Button>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => toggleFlagMutation.mutate({ 
                          emailIds: [email.id], 
                          flagged: email.flag.flagStatus !== 'flagged' 
                        })}
                      >
                        <Flag className={`h-4 w-4 ${getFlagColor(email.flag.flagStatus)}`} />
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {email.from.name}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {email.from.email}
                            </div>
                          </div>
                        </div>
                        {email.importance !== 'normal' && (
                          <Badge className={getImportanceColor(email.importance)}>
                            {email.importance}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {email.subject}
                        </div>
                        {showPreview && (
                          <div className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-md">
                            {email.bodyPreview}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {email.hasAttachments && (
                        <Paperclip className="h-4 w-4 text-gray-600" />
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(email.receivedDateTime)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {email.size && formatSize(email.size)}
                      </div>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <Reply className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <Archive className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <MoreHorizontal className="h-3 w-3" />
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
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, sortedEmails.length)} of {sortedEmails.length} emails
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