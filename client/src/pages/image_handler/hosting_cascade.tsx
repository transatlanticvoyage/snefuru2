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
import { 
  Search, 
  Server, 
  Globe, 
  Plus,
  Settings,
  Eye,
  Copy,
  ExternalLink
} from 'lucide-react';
import { useLocation } from 'wouter';
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

interface HostingAccount {
  id: string;
  companyName: string;
  username: string;
  priceTerm: string;
  ip: string;
  type: string;
  url: string;
  user: string;
  password: string;
  nameserver: string;
  nameserver2: string;
  dom: string;
  note: string;
  status: 'active' | 'inactive' | 'suspended';
  accountType: 'endpoint' | 'company' | 'account' | 'plan' | 'panel';
}

// Sample hosting data matching the UI mockup
const sampleHostingData: HostingAccount[] = [
  {
    id: '1',
    companyName: 'maunsellmglobal.com',
    username: '',
    priceTerm: '$100 other',
    ip: '',
    type: '',
    url: 'https://cpanel3.hosting24.com.mg/',
    user: 'ybfimweb',
    password: '',
    nameserver: 'alpha1.main-hosting.eu',
    nameserver2: 'alpha2.main-hosting.eu',
    dom: '',
    note: '',
    status: 'active',
    accountType: 'endpoint'
  },
  {
    id: '2',
    companyName: 'godaddy.com',
    username: 'jason2616@gmail.com',
    priceTerm: '',
    ip: '',
    type: '',
    url: '',
    user: '',
    password: '',
    nameserver: '',
    nameserver2: '',
    dom: '',
    note: '',
    status: 'active',
    accountType: 'company'
  },
  {
    id: '3',
    companyName: 'dynadot.com',
    username: 'jeremydinnereporter@gmail.com',
    priceTerm: '',
    ip: '',
    type: '',
    url: '',
    user: '',
    password: '',
    nameserver: '',
    nameserver2: '',
    dom: '',
    note: '',
    status: 'active',
    accountType: 'company'
  },
  {
    id: '4',
    companyName: 'namecilo.com',
    username: 'greenery125@outlook.com',
    priceTerm: '',
    ip: '',
    type: '',
    url: '',
    user: '',
    password: '',
    nameserver: '',
    nameserver2: '',
    dom: '',
    note: '',
    status: 'active',
    accountType: 'company'
  },
  {
    id: '5',
    companyName: 'networksolutions.com',
    username: '',
    priceTerm: '',
    ip: '',
    type: '',
    url: '',
    user: '',
    password: '',
    nameserver: '',
    nameserver2: '',
    dom: '',
    note: '',
    status: 'active',
    accountType: 'company'
  },
  {
    id: '6',
    companyName: 'mylegiomain.com',
    username: '',
    priceTerm: '',
    ip: '',
    type: '',
    url: '',
    user: '',
    password: '',
    nameserver: '',
    nameserver2: '',
    dom: '',
    note: '',
    status: 'active',
    accountType: 'company'
  },
  {
    id: '7',
    companyName: 'registrar.com',
    username: 'kathryne6730@gmail.com',
    priceTerm: '',
    ip: '',
    type: '',
    url: '',
    user: '',
    password: '',
    nameserver: '',
    nameserver2: '',
    dom: '',
    note: '',
    status: 'active',
    accountType: 'company'
  },
  {
    id: '8',
    companyName: 'enomcentral.com',
    username: 'v.webdocdev100@gmail.com',
    priceTerm: '',
    ip: '',
    type: '',
    url: '',
    user: '',
    password: '',
    nameserver: '',
    nameserver2: '',
    dom: '',
    note: '',
    status: 'active',
    accountType: 'company'
  },
  {
    id: '9',
    companyName: 'digitalocean.com',
    username: 'jeremiahfor@gmail.com',
    priceTerm: '$6.00 1 month',
    ip: '104.248.19.171',
    type: '',
    url: '',
    user: 'root',
    password: '',
    nameserver: '',
    nameserver2: '',
    dom: '',
    note: '',
    status: 'active',
    accountType: 'account'
  },
  {
    id: '10',
    companyName: 'inmotionhosting.com',
    username: 'jeremiahfor@gmail.com',
    priceTerm: '$143.881 year',
    ip: '170.10.139.18',
    type: '',
    url: 'https://secure.inmotionhosting.com/',
    user: 'www.aw5',
    password: '',
    nameserver: 'ns1.inmotionhosting.com',
    nameserver2: 'ns2.inmotionhosting.com',
    dom: '',
    note: '',
    status: 'active',
    accountType: 'account'
  },
  {
    id: '11',
    companyName: 'cpnl.com',
    username: 'junithingspanel@gmail.com',
    priceTerm: '',
    ip: '',
    type: '',
    url: '',
    user: '',
    password: '',
    nameserver: '',
    nameserver2: '',
    dom: '',
    note: '',
    status: 'active',
    accountType: 'company'
  },
  {
    id: '12',
    companyName: 'importantservi.com',
    username: '',
    priceTerm: '$$$49168',
    ip: '',
    type: '',
    url: '',
    user: '',
    password: '',
    nameserver: '',
    nameserver2: '',
    dom: '',
    note: '',
    status: 'active',
    accountType: 'company'
  }
];

const HostingCascadePage: React.FC = () => {
  useDocumentTitle("Hosting Cascade - Snefuru");
  const [, navigate] = useLocation();
  // State management
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [sortField, setSortField] = useState<string>('companyName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Filter states
  const [endpointFilter, setEndpointFilter] = useState('All');
  const [columnTemplate, setColumnTemplate] = useState('All');
  const [accountsFilter, setAccountsFilter] = useState('Accounts 1');
  const [billingFilter, setBillingFilter] = useState('Billing 1');
  const [portsFilter, setPortsFilter] = useState('Ports 1');
  const [sitesFilter, setSitesFilter] = useState('Sites 1');
  const [showNetworks, setShowNetworks] = useState('All');
  const [maxNetSort, setMaxNetSort] = useState('All');
  const [slotWidth, setSlotWidth] = useState('1250px');

  // Active settings
  const [activeDomainEggAccounts, setActiveDomainEggAccounts] = useState(true);
  const [activeHostPlansOnly, setActiveHostPlansOnly] = useState(false);

  // Pagination settings
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // Use sample data
  const hostingAccounts = sampleHostingData;

  // Filter and search functionality
  const filteredData = hostingAccounts.filter((account) => {
    const matchesSearch = account.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.user.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesEndpoint = endpointFilter === 'All' || account.accountType === endpointFilter.toLowerCase();

    return matchesSearch && matchesEndpoint;
  });

  // Sort functionality
  const sortedData = [...filteredData].sort((a, b) => {
    let aValue = a[sortField as keyof HostingAccount];
    let bValue = b[sortField as keyof HostingAccount];

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

  const getAccountTypeIcon = (type: string) => {
    switch (type) {
      case 'endpoint':
        return <div className="w-4 h-4 bg-blue-500 rounded"></div>;
      case 'company':
        return <div className="w-4 h-4 bg-purple-500 rounded"></div>;
      case 'account':
        return <div className="w-4 h-4 bg-green-500 rounded"></div>;
      case 'plan':
        return <div className="w-4 h-4 bg-orange-500 rounded"></div>;
      case 'panel':
        return <div className="w-4 h-4 bg-red-500 rounded"></div>;
      default:
        return <div className="w-4 h-4 bg-gray-400 rounded"></div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header pageTitle="Hosting Cascade" />

      <div className="container mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Server className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Host Tree</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage hosting accounts and configurations</p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center gap-4 mb-4">
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

            <Button className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 h-8">
              Add new company
            </Button>

            <Button variant="outline" className="text-blue-600 border-blue-600 text-xs px-3 py-1 h-8">
              ⚙ Host Functions
            </Button>

            <Badge className="bg-red-600 text-white text-xs px-2 py-1">
              $3,423.9
            </Badge>

            <div className="flex items-center gap-2 ml-auto">
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="active-domain-egg"
                  checked={activeDomainEggAccounts}
                  onCheckedChange={setActiveDomainEggAccounts}
                />
                <label htmlFor="active-domain-egg" className="text-sm text-gray-600">
                  Active Dom Egg Accounts Only
                </label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="active-host-plans"
                  checked={activeHostPlansOnly}
                  onCheckedChange={setActiveHostPlansOnly}
                />
                <label htmlFor="active-host-plans" className="text-sm text-gray-600">
                  Active Host Plans Only
                </label>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <div className="text-sm">
              <span className="text-gray-600 mr-2">Endpoint Entry</span>
              <Select value={endpointFilter} onValueChange={setEndpointFilter}>
                <SelectTrigger className="w-24 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="Company">Company</SelectItem>
                  <SelectItem value="Account">Account</SelectItem>
                  <SelectItem value="Plan">Plan</SelectItem>
                  <SelectItem value="Panel">Panel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="text-sm">
              <span className="text-gray-600 mr-2">Subdomains</span>
              <Select value="All settings" onValueChange={() => {}}>
                <SelectTrigger className="w-24 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All settings">All settings</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="text-sm">
              <span className="text-gray-600 mr-2">Pg. Sites</span>
              <Select value="All entry" onValueChange={() => {}}>
                <SelectTrigger className="w-24 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All entry">All entry</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="text-sm">
              <span className="text-gray-600 mr-2">Show Networks</span>
              <Select value={showNetworks} onValueChange={setShowNetworks}>
                <SelectTrigger className="w-24 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="text-sm">
              <span className="text-gray-600 mr-2">Max Net Sort</span>
              <Select value={maxNetSort} onValueChange={setMaxNetSort}>
                <SelectTrigger className="w-24 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="text-sm">
              <span className="text-gray-600 mr-2">Slot width</span>
              <Select value={slotWidth} onValueChange={setSlotWidth}>
                <SelectTrigger className="w-24 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1250px">1250px</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Badge className="bg-blue-600 text-white text-xs px-2 py-1">
              H.Y.C
            </Badge>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by Company Name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-8"
              />
            </div>
            <Button className="bg-yellow-500 hover:bg-yellow-600 text-black text-xs px-3 py-1 h-8">
              GO
            </Button>

            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">Column Template</span>
              <Select value={columnTemplate} onValueChange={setColumnTemplate}>
                <SelectTrigger className="w-16 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">Accounts 1</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">Billing 1</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">Ports 1</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">Sites 1</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">Sites 2</span>
            </div>
          </div>
        </div>

        {/* Hosting Accounts Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-gray-700">
                <TableHead className="w-12">
                  <Checkbox 
                    checked={selectedAccounts.length === paginatedData.length && paginatedData.length > 0}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedAccounts(paginatedData.map(account => account.id));
                      } else {
                        setSelectedAccounts([]);
                      }
                    }}
                  />
                </TableHead>
                <TableHead className="w-12"></TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => handleSort('companyName')}
                >
                  Comp. Name
                </TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Price Term</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Password</TableHead>
                <TableHead>Nameserver</TableHead>
                <TableHead>Nameserver</TableHead>
                <TableHead># DOM</TableHead>
                <TableHead>Note</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((account) => (
                <TableRow key={account.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <TableCell>
                    <Checkbox 
                      checked={selectedAccounts.includes(account.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedAccounts([...selectedAccounts, account.id]);
                        } else {
                          setSelectedAccounts(selectedAccounts.filter(id => id !== account.id));
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    {getAccountTypeIcon(account.accountType)}
                  </TableCell>
                  <TableCell className="font-medium text-blue-600">
                    {account.companyName}
                  </TableCell>
                  <TableCell className="text-sm">
                    {account.username}
                  </TableCell>
                  <TableCell className="text-sm">
                    {account.priceTerm}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {account.ip}
                  </TableCell>
                  <TableCell className="text-sm">
                    {account.type}
                  </TableCell>
                  <TableCell className="text-sm">
                    {account.url && (
                      <a href={account.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                        <ExternalLink className="h-3 w-3" />
                        {account.url.length > 30 ? account.url.substring(0, 30) + '...' : account.url}
                      </a>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    {account.user}
                  </TableCell>
                  <TableCell className="text-sm">
                    {account.password && (
                      <div className="flex items-center gap-1">
                        <span>••••••••</span>
                        <Copy className="h-3 w-3 text-gray-400 cursor-pointer hover:text-blue-600" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    {account.nameserver}
                  </TableCell>
                  <TableCell className="text-sm">
                    {account.nameserver2}
                  </TableCell>
                  <TableCell className="text-sm">
                    {account.dom}
                  </TableCell>
                  <TableCell className="text-sm">
                    {account.note}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default HostingCascadePage;