import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
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
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Globe, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Eye,
  Edit,
  Copy,
  ExternalLink,
  MoreHorizontal
} from 'lucide-react';

interface Domain {
  id: string;
  domain: string;
  account_registrar: string;
  registrar: string;
  st_ip: string;
  ns: string;
  host_summary: string;
  hs_type: string;
  detected_host_panel: string;
  assigned_host_panel: string;
  seo_mass_host_plan: string;
  note: string;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  group: string;
  subnetworks: string;
}

// Sample domain data matching the design
const sampleDomains: Domain[] = [
  {
    id: '1',
    domain: 'charlestonduckscleaning.net',
    account_registrar: 'Dyn',
    registrar: 'porkbun.com',
    st_ip: '44.227.65.245',
    ns: 'curlina.ns.porkbun.com',
    host_summary: 'No Host Entry Found',
    hs_type: 'No NS Match Found',
    detected_host_panel: 'No Host Panel Assigned',
    assigned_host_panel: '',
    seo_mass_host_plan: 'No SEO Host Plan',
    note: '',
    status: 'active',
    group: 'porkbun',
    subnetworks: 'All'
  },
  {
    id: '2',
    domain: 'katrinascloversclub.net',
    account_registrar: 'Dyn',
    registrar: 'porkbun.com',
    st_ip: '44.227.65.245',
    ns: 'curlina.ns.porkbun.com',
    host_summary: 'No Host Entry Found',
    hs_type: 'No NS Match Found',
    detected_host_panel: 'No Host Panel Assigned',
    assigned_host_panel: '',
    seo_mass_host_plan: 'No SEO Host Plan',
    note: '',
    status: 'active',
    group: 'porkbun',
    subnetworks: 'All'
  },
  {
    id: '3',
    domain: 'druziercomputertechnology.net',
    account_registrar: 'Dyn',
    registrar: 'porkbun.com',
    st_ip: '44.227.65.245',
    ns: 'curlina.ns.porkbun.com',
    host_summary: 'No Host Entry Found',
    hs_type: 'No NS Match Found',
    detected_host_panel: 'No Host Panel Assigned',
    assigned_host_panel: '',
    seo_mass_host_plan: 'No SEO Host Plan',
    note: '',
    status: 'active',
    group: 'porkbun',
    subnetworks: 'All'
  },
  {
    id: '4',
    domain: 'moldremovalandrepairs.net',
    account_registrar: 'Dyn',
    registrar: 'porkbun.com',
    st_ip: '104.21.38.251',
    ns: 'nelly.ns.cloudflare.com',
    host_summary: 'No Host Entry Found',
    hs_type: 'No NS Match Found',
    detected_host_panel: 'No Host Panel Assigned',
    assigned_host_panel: '',
    seo_mass_host_plan: 'No SEO Host Plan',
    note: '',
    status: 'active',
    group: 'porkbun',
    subnetworks: 'All'
  },
  {
    id: '5',
    domain: 'concreteduradio.net.xz',
    account_registrar: 'Dyn',
    registrar: 'porkbun.com',
    st_ip: '3.139.199.151',
    ns: 'dylan.ns.cloudflare.com',
    host_summary: 'No Host Entry Found',
    hs_type: 'No NS Match Found',
    detected_host_panel: 'No Host Panel Assigned',
    assigned_host_panel: '',
    seo_mass_host_plan: 'No SEO Host Plan',
    note: '',
    status: 'active',
    group: 'porkbun',
    subnetworks: 'All'
  },
  {
    id: '6',
    domain: 'windsurftowngeros.com',
    account_registrar: 'Dyn',
    registrar: 'porkbun.com',
    st_ip: '104.0.62.91',
    ns: 'ns1.a2hosting.com',
    host_summary: 'No Host Entry Found',
    hs_type: 'No NS Match Found',
    detected_host_panel: 'No Host Panel Assigned',
    assigned_host_panel: '',
    seo_mass_host_plan: 'No SEO Host Plan',
    note: '',
    status: 'active',
    group: 'porkbun',
    subnetworks: 'All'
  },
  {
    id: '7',
    domain: 'loveinglalarnaco.com',
    account_registrar: 'Dyn',
    registrar: 'porkbun.com',
    st_ip: '104.0.62.91',
    ns: 'ns1.a2hosting.com',
    host_summary: 'No Host Entry Found',
    hs_type: 'No NS Match Found',
    detected_host_panel: 'No Host Panel Assigned',
    assigned_host_panel: '',
    seo_mass_host_plan: 'No SEO Host Plan',
    note: '',
    status: 'active',
    group: 'porkbun',
    subnetworks: 'All'
  },
  {
    id: '8',
    domain: 'getfreshbutman.com',
    account_registrar: 'Dyn',
    registrar: 'porkbun.com',
    st_ip: '104.0.62.91',
    ns: 'ns1.a2hosting.com',
    host_summary: 'No Host Entry Found',
    hs_type: 'No NS Match Found',
    detected_host_panel: 'No Host Panel Assigned',
    assigned_host_panel: '',
    seo_mass_host_plan: 'No SEO Host Plan',
    note: '',
    status: 'active',
    group: 'porkbun',
    subnetworks: 'All'
  },
  {
    id: '9',
    domain: 'angelasconcreteus.com',
    account_registrar: 'Dyn',
    registrar: 'porkbun.com',
    st_ip: '104.0.62.91',
    ns: 'ns1.a2hosting.com',
    host_summary: 'No Host Entry Found',
    hs_type: 'No NS Match Found',
    detected_host_panel: 'No Host Panel Assigned',
    assigned_host_panel: '',
    seo_mass_host_plan: 'No SEO Host Plan',
    note: '',
    status: 'active',
    group: 'porkbun',
    subnetworks: 'All'
  },
  {
    id: '10',
    domain: 'moonpharmacydrug-sales.xz',
    account_registrar: 'Dyn',
    registrar: 'porkbun.com',
    st_ip: '3.139.199.151',
    ns: 'ns1.a2hosting.com',
    host_summary: 'No Host Entry Found',
    hs_type: 'No NS Match Found',
    detected_host_panel: 'No Host Panel Assigned',
    assigned_host_panel: '',
    seo_mass_host_plan: 'No SEO Host Plan',
    note: '',
    status: 'active',
    group: 'porkbun',
    subnetworks: 'All'
  }
];

const DomainsPage: React.FC = () => {
  useDocumentTitle('Domains Main - Snefuru');
  // State management
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [sortField, setSortField] = useState<string>('domain');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Filter states
  const [domainFunction, setDomainFunction] = useState('All Users');
  const [groupFilter, setGroupFilter] = useState('All');
  const [tagsFilter, setTagsFilter] = useState('All');
  const [subnetworksFilter, setSubnetworksFilter] = useState('All');
  const [hostingFilter, setHostingFilter] = useState('All');
  const [linksFilter, setLinksFilter] = useState('All');
  const [wordpressFilter, setWordpressFilter] = useState('All');
  const [registrarFilter, setRegistrarFilter] = useState('All');
  const [notesFilter, setNotesFilter] = useState('All');
  const [quickAddFilter, setQuickAddFilter] = useState('All');

  // Pagination settings
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [showColumns, setShowColumns] = useState({
    domain: true,
    accountRegistrar: true,
    stIp: true,
    ns: true,
    hostSummary: true,
    hsType: true,
    detectedHostPanel: true,
    assignedHostPanel: true,
    seoMassHostPlan: true,
    note: true
  });

  // Use sample data for now
  const domains = sampleDomains;

  // Filter and search functionality
  const filteredData = domains.filter((domain) => {
    const matchesSearch = domain.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         domain.registrar.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         domain.st_ip.includes(searchTerm) ||
                         domain.ns.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesGroup = groupFilter === 'All' || domain.group === groupFilter;
    const matchesSubnetworks = subnetworksFilter === 'All' || domain.subnetworks === subnetworksFilter;

    return matchesSearch && matchesGroup && matchesSubnetworks;
  });

  // Sort functionality
  const sortedData = [...filteredData].sort((a, b) => {
    let aValue = a[sortField as keyof Domain];
    let bValue = b[sortField as keyof Domain];

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

  // Handle sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'suspended':
        return <Badge className="bg-red-100 text-red-800">Suspended</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header pageTitle="Domains Management" />

      <div className="container mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Globe className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Domains</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage your domain portfolio</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Globe className="h-4 w-4 mr-2" />
                Add Domain
              </Button>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search domains..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              GO
            </Button>
            <Button variant="outline" className="text-blue-600 border-blue-600">
              ⚙ Dom. Functions
            </Button>
          </div>

          {/* Advanced Filters Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 xl:grid-cols-10 gap-3 mb-4">
            <div className="text-sm">
              <Select value={domainFunction} onValueChange={setDomainFunction}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Users">All Users</SelectItem>
                  <SelectItem value="MS">MS</SelectItem>
                  <SelectItem value="PPX">PPX</SelectItem>
                  <SelectItem value="Soc">Soc</SelectItem>
                  <SelectItem value="Text">Text</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="Mine">Mine</SelectItem>
                  <SelectItem value="Client">Client</SelectItem>
                  <SelectItem value="Strangers">Strangers</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="text-sm">
              <label className="block text-xs text-gray-600 mb-1">Group</label>
              <Select value={groupFilter} onValueChange={setGroupFilter}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="porkbun">porkbun</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="text-sm">
              <label className="block text-xs text-gray-600 mb-1">Tags</label>
              <Select value={tagsFilter} onValueChange={setTagsFilter}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="text-sm">
              <label className="block text-xs text-gray-600 mb-1">Subnetworks</label>
              <Select value={subnetworksFilter} onValueChange={setSubnetworksFilter}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="text-sm">
              <label className="block text-xs text-gray-600 mb-1">Hosting</label>
              <Select value={hostingFilter} onValueChange={setHostingFilter}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="text-sm">
              <label className="block text-xs text-gray-600 mb-1">Links</label>
              <Select value={linksFilter} onValueChange={setLinksFilter}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="text-sm">
              <label className="block text-xs text-gray-600 mb-1">Wordpress</label>
              <Select value={wordpressFilter} onValueChange={setWordpressFilter}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="text-sm">
              <label className="block text-xs text-gray-600 mb-1">Registrar</label>
              <Select value={registrarFilter} onValueChange={setRegistrarFilter}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="porkbun.com">porkbun.com</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="text-sm">
              <label className="block text-xs text-gray-600 mb-1">Notes</label>
              <Select value={notesFilter} onValueChange={setNotesFilter}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="text-sm">
              <label className="block text-xs text-gray-600 mb-1">Quick Add</label>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" className="h-8 px-2 text-xs">Test1</Button>
                <Button variant="outline" size="sm" className="h-8 px-2 text-xs">Test2</Button>
              </div>
            </div>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Show:</span>
                <Select value={rowsPerPage.toString()} onValueChange={(value) => setRowsPerPage(parseInt(value))}>
                  <SelectTrigger className="w-16 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                    <SelectItem value="200">200</SelectItem>
                    <SelectItem value="all">All</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <span className="text-sm text-gray-600">
                0 sel. • 467 res.
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-8">
                Columns
              </Button>
            </div>
          </div>
        </div>

        {/* Domains Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-gray-700">
                <TableHead className="w-12">
                  <Checkbox 
                    checked={selectedDomains.length === paginatedData.length && paginatedData.length > 0}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedDomains(paginatedData.map(domain => domain.id));
                      } else {
                        setSelectedDomains([]);
                      }
                    }}
                  />
                </TableHead>
                <TableHead className="w-12"></TableHead>
                <TableHead className="w-12"></TableHead>
                <TableHead className="w-12"></TableHead>
                <TableHead className="w-12"></TableHead>
                <TableHead className="w-12"></TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => handleSort('domain')}
                >
                  Domains
                </TableHead>
                <TableHead>Account Registrar</TableHead>
                <TableHead>ST IP</TableHead>
                <TableHead>NS</TableHead>
                <TableHead>Host Summary</TableHead>
                <TableHead>HS Type</TableHead>
                <TableHead>Detected Host Panel</TableHead>
                <TableHead>Assigned Host Panel</TableHead>
                <TableHead>SEO Mass Host Plan</TableHead>
                <TableHead>Note 1</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((domain) => (
                <TableRow key={domain.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <TableCell>
                    <Checkbox 
                      checked={selectedDomains.includes(domain.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedDomains([...selectedDomains, domain.id]);
                        } else {
                          setSelectedDomains(selectedDomains.filter(id => id !== domain.id));
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                  </TableCell>
                  <TableCell>
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                  </TableCell>
                  <TableCell>
                    <Globe className="h-4 w-4 text-gray-400" />
                  </TableCell>
                  <TableCell>
                    <Copy className="h-4 w-4 text-gray-400" />
                  </TableCell>
                  <TableCell>
                    <MoreHorizontal className="h-4 w-4 text-gray-400" />
                  </TableCell>
                  <TableCell className="font-medium text-blue-600">
                    {domain.domain}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm">{domain.account_registrar}</div>
                      <div className="text-xs text-gray-500">{domain.registrar}</div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {domain.st_ip}
                  </TableCell>
                  <TableCell className="text-sm">
                    {domain.ns}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {domain.host_summary}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {domain.hs_type}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {domain.detected_host_panel}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {domain.assigned_host_panel}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {domain.seo_mass_host_plan}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Edit className="h-4 w-4 text-gray-400 cursor-pointer hover:text-blue-600" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Showing {startIndex + 1} to {Math.min(startIndex + rowsPerPage, sortedData.length)} of {sortedData.length} domains
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
        </div>
      </div>
    </div>
  );
};

export default DomainsPage;