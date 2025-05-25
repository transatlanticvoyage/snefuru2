import React, { useState } from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Search } from 'lucide-react';

// Define interface for affiliate program data
interface AffiliateProgram {
  id: number;
  company_name: string;
  domain: string;
  url_to_aff_program_signup: string;
  signed_up: 'yes' | 'not yet';
  niches_served: string[];
  country_based_in: string;
  actively_running_their_campaigns: 'yes' | 'no';
  commission_rate: string;
  min_payout: string;
  payment_methods: string[];
  cookie_duration: string;
  program_type: 'direct' | 'network';
  network?: string;
  two_tier_commission: 'yes' | 'no';
}

// Dummy data for the affiliate programs
const dummyAffiliateProgramsData: AffiliateProgram[] = [
  {
    id: 1,
    company_name: "Amazon Associates",
    domain: "amazon.com",
    url_to_aff_program_signup: "https://affiliate-program.amazon.com/",
    signed_up: "yes",
    niches_served: ["E-commerce", "Books", "Electronics", "Home Goods"],
    country_based_in: "USA",
    actively_running_their_campaigns: "yes",
    commission_rate: "1-10%",
    min_payout: "$10",
    payment_methods: ["Direct Deposit", "Amazon Gift Card", "Check"],
    cookie_duration: "24 hours",
    program_type: "direct",
    two_tier_commission: "no"
  },
  {
    id: 2,
    company_name: "ClickBank",
    domain: "clickbank.com",
    url_to_aff_program_signup: "https://www.clickbank.com/affiliate-network/",
    signed_up: "yes",
    niches_served: ["Digital Products", "Health", "Fitness", "Personal Development"],
    country_based_in: "USA",
    actively_running_their_campaigns: "yes",
    commission_rate: "50-75%",
    min_payout: "$10",
    payment_methods: ["Direct Deposit", "Check", "Wire Transfer"],
    cookie_duration: "60 days",
    program_type: "network",
    two_tier_commission: "no"
  },
  {
    id: 3,
    company_name: "ShareASale",
    domain: "shareasale.com",
    url_to_aff_program_signup: "https://www.shareasale.com/join-now.cfm",
    signed_up: "yes",
    niches_served: ["Fashion", "Home Decor", "Travel", "Business Services"],
    country_based_in: "USA",
    actively_running_their_campaigns: "yes",
    commission_rate: "5-50%",
    min_payout: "$50",
    payment_methods: ["Direct Deposit", "Check"],
    cookie_duration: "30 days",
    program_type: "network",
    two_tier_commission: "no"
  },
  {
    id: 4,
    company_name: "CJ Affiliate",
    domain: "cj.com",
    url_to_aff_program_signup: "https://www.cj.com/join-now",
    signed_up: "not yet",
    niches_served: ["Retail", "Travel", "Financial Services", "Telecom"],
    country_based_in: "USA",
    actively_running_their_campaigns: "no",
    commission_rate: "5-45%",
    min_payout: "$50",
    payment_methods: ["Direct Deposit", "Check"],
    cookie_duration: "30 days",
    program_type: "network",
    two_tier_commission: "no"
  },
  {
    id: 5,
    company_name: "Awin",
    domain: "awin.com",
    url_to_aff_program_signup: "https://www.awin.com/us/publishers",
    signed_up: "not yet",
    niches_served: ["Retail", "Travel", "Telecommunications", "Finance"],
    country_based_in: "UK",
    actively_running_their_campaigns: "no",
    commission_rate: "5-50%",
    min_payout: "£20",
    payment_methods: ["BACS", "Wire Transfer"],
    cookie_duration: "30 days",
    program_type: "network",
    two_tier_commission: "no"
  },
  {
    id: 6,
    company_name: "Bluehost",
    domain: "bluehost.com",
    url_to_aff_program_signup: "https://www.bluehost.com/affiliates",
    signed_up: "yes",
    niches_served: ["Web Hosting", "WordPress", "Domains"],
    country_based_in: "USA",
    actively_running_their_campaigns: "yes",
    commission_rate: "$65 per sale",
    min_payout: "$100",
    payment_methods: ["PayPal", "Direct Deposit"],
    cookie_duration: "90 days",
    program_type: "direct",
    two_tier_commission: "no"
  },
  {
    id: 7,
    company_name: "Fiverr",
    domain: "fiverr.com",
    url_to_aff_program_signup: "https://affiliates.fiverr.com/",
    signed_up: "not yet",
    niches_served: ["Freelance Services", "Digital Marketing", "Graphic Design"],
    country_based_in: "Israel",
    actively_running_their_campaigns: "no",
    commission_rate: "$15-150 CPA",
    min_payout: "$100",
    payment_methods: ["PayPal", "Payoneer"],
    cookie_duration: "30 days",
    program_type: "direct",
    two_tier_commission: "no"
  },
  {
    id: 8,
    company_name: "Hostinger",
    domain: "hostinger.com",
    url_to_aff_program_signup: "https://www.hostinger.com/affiliates",
    signed_up: "yes",
    niches_served: ["Web Hosting", "Domains", "VPS"],
    country_based_in: "Lithuania",
    actively_running_their_campaigns: "yes",
    commission_rate: "60%",
    min_payout: "$50",
    payment_methods: ["PayPal", "Bank Transfer"],
    cookie_duration: "30 days",
    program_type: "direct",
    two_tier_commission: "no"
  },
  {
    id: 9,
    company_name: "ConvertKit",
    domain: "convertkit.com",
    url_to_aff_program_signup: "https://convertkit.com/affiliate",
    signed_up: "not yet",
    niches_served: ["Email Marketing", "Content Creators", "Bloggers"],
    country_based_in: "USA",
    actively_running_their_campaigns: "no",
    commission_rate: "30% recurring",
    min_payout: "$50",
    payment_methods: ["PayPal"],
    cookie_duration: "60 days",
    program_type: "direct",
    two_tier_commission: "no"
  },
  {
    id: 10,
    company_name: "Shopify",
    domain: "shopify.com",
    url_to_aff_program_signup: "https://www.shopify.com/affiliates",
    signed_up: "yes",
    niches_served: ["E-commerce", "Dropshipping", "Online Retail"],
    country_based_in: "Canada",
    actively_running_their_campaigns: "yes",
    commission_rate: "200% of customer's first payment",
    min_payout: "$25",
    payment_methods: ["PayPal", "Direct Deposit"],
    cookie_duration: "30 days",
    program_type: "direct",
    two_tier_commission: "no"
  },
  {
    id: 11,
    company_name: "Teachable",
    domain: "teachable.com",
    url_to_aff_program_signup: "https://teachable.com/affiliates",
    signed_up: "not yet",
    niches_served: ["Online Courses", "Education", "Knowledge Commerce"],
    country_based_in: "USA",
    actively_running_their_campaigns: "no",
    commission_rate: "30% recurring",
    min_payout: "$50",
    payment_methods: ["PayPal"],
    cookie_duration: "90 days",
    program_type: "direct",
    two_tier_commission: "no"
  },
  {
    id: 12,
    company_name: "Impact",
    domain: "impact.com",
    url_to_aff_program_signup: "https://impact.com/partners/",
    signed_up: "yes",
    niches_served: ["SaaS", "D2C Brands", "Retail", "Travel"],
    country_based_in: "USA",
    actively_running_their_campaigns: "yes",
    commission_rate: "Varies by merchant",
    min_payout: "$100",
    payment_methods: ["PayPal", "Direct Deposit"],
    cookie_duration: "Varies by merchant",
    program_type: "network",
    two_tier_commission: "no"
  },
  {
    id: 13,
    company_name: "Semrush",
    domain: "semrush.com",
    url_to_aff_program_signup: "https://www.semrush.com/affiliates/",
    signed_up: "yes",
    niches_served: ["SEO", "Digital Marketing", "Content Marketing"],
    country_based_in: "USA",
    actively_running_their_campaigns: "yes",
    commission_rate: "40% recurring",
    min_payout: "$50",
    payment_methods: ["PayPal", "Wire Transfer"],
    cookie_duration: "120 days",
    program_type: "direct",
    two_tier_commission: "no"
  },
  {
    id: 14,
    company_name: "Elementor",
    domain: "elementor.com",
    url_to_aff_program_signup: "https://elementor.com/affiliates/",
    signed_up: "not yet",
    niches_served: ["WordPress", "Web Design", "Page Builders"],
    country_based_in: "Israel",
    actively_running_their_campaigns: "no",
    commission_rate: "50%",
    min_payout: "$200",
    payment_methods: ["PayPal"],
    cookie_duration: "45 days",
    program_type: "direct",
    two_tier_commission: "no"
  },
  {
    id: 15,
    company_name: "BigCommerce",
    domain: "bigcommerce.com",
    url_to_aff_program_signup: "https://www.bigcommerce.com/partners/affiliates/",
    signed_up: "not yet",
    niches_served: ["E-commerce", "Online Stores", "Retail"],
    country_based_in: "USA",
    actively_running_their_campaigns: "no",
    commission_rate: "200% of customer's first payment",
    min_payout: "$50",
    payment_methods: ["PayPal", "Direct Deposit"],
    cookie_duration: "90 days",
    program_type: "direct",
    two_tier_commission: "no"
  },
  {
    id: 16,
    company_name: "StudioPress",
    domain: "studiopress.com",
    url_to_aff_program_signup: "https://www.studiopress.com/affiliate-program/",
    signed_up: "yes",
    niches_served: ["WordPress", "Genesis Framework", "Themes"],
    country_based_in: "USA",
    actively_running_their_campaigns: "yes",
    commission_rate: "35%",
    min_payout: "$50",
    payment_methods: ["PayPal"],
    cookie_duration: "60 days",
    program_type: "direct",
    two_tier_commission: "no"
  },
  {
    id: 17,
    company_name: "GoDaddy",
    domain: "godaddy.com",
    url_to_aff_program_signup: "https://www.godaddy.com/affiliate-programs",
    signed_up: "not yet",
    niches_served: ["Domains", "Web Hosting", "Website Builder"],
    country_based_in: "USA",
    actively_running_their_campaigns: "no",
    commission_rate: "up to $100 per sale",
    min_payout: "$100",
    payment_methods: ["Check", "Direct Deposit"],
    cookie_duration: "45 days",
    program_type: "direct",
    two_tier_commission: "no"
  },
  {
    id: 18,
    company_name: "NameCheap",
    domain: "namecheap.com",
    url_to_aff_program_signup: "https://www.namecheap.com/affiliates/",
    signed_up: "yes",
    niches_served: ["Domains", "Web Hosting", "SSL Certificates"],
    country_based_in: "USA",
    actively_running_their_campaigns: "yes",
    commission_rate: "up to 50%",
    min_payout: "$50",
    payment_methods: ["PayPal", "Account Credit"],
    cookie_duration: "30 days",
    program_type: "direct",
    two_tier_commission: "yes"
  },
  {
    id: 19,
    company_name: "Thrivecart",
    domain: "thrivecart.com",
    url_to_aff_program_signup: "https://thrivecart.com/affiliates/",
    signed_up: "not yet",
    niches_served: ["Shopping Cart", "E-commerce", "Digital Products"],
    country_based_in: "UK",
    actively_running_their_campaigns: "no",
    commission_rate: "35%",
    min_payout: "$100",
    payment_methods: ["PayPal"],
    cookie_duration: "lifetime",
    program_type: "direct",
    two_tier_commission: "no"
  },
  {
    id: 20,
    company_name: "Grammarly",
    domain: "grammarly.com",
    url_to_aff_program_signup: "https://www.grammarly.com/affiliates",
    signed_up: "yes",
    niches_served: ["Writing Tools", "Proofreading", "Education"],
    country_based_in: "USA",
    actively_running_their_campaigns: "yes",
    commission_rate: "$20 per sign-up",
    min_payout: "$50",
    payment_methods: ["PayPal"],
    cookie_duration: "90 days",
    program_type: "direct",
    two_tier_commission: "no"
  },
  {
    id: 21,
    company_name: "Canva",
    domain: "canva.com",
    url_to_aff_program_signup: "https://www.canva.com/affiliates/",
    signed_up: "not yet",
    niches_served: ["Graphic Design", "Social Media", "Marketing Materials"],
    country_based_in: "Australia",
    actively_running_their_campaigns: "no",
    commission_rate: "$36 per new Pro sign-up",
    min_payout: "$50",
    payment_methods: ["PayPal"],
    cookie_duration: "30 days",
    program_type: "direct",
    two_tier_commission: "no"
  },
  {
    id: 22,
    company_name: "Ahrefs",
    domain: "ahrefs.com",
    url_to_aff_program_signup: "https://ahrefs.com/affiliates",
    signed_up: "yes",
    niches_served: ["SEO", "Backlink Analysis", "Keyword Research"],
    country_based_in: "Singapore",
    actively_running_their_campaigns: "yes",
    commission_rate: "10% recurring",
    min_payout: "$100",
    payment_methods: ["PayPal", "Wire Transfer"],
    cookie_duration: "90 days",
    program_type: "direct",
    two_tier_commission: "no"
  },
  {
    id: 23,
    company_name: "ActiveCampaign",
    domain: "activecampaign.com",
    url_to_aff_program_signup: "https://www.activecampaign.com/affiliate-program",
    signed_up: "not yet",
    niches_served: ["Email Marketing", "Marketing Automation", "CRM"],
    country_based_in: "USA",
    actively_running_their_campaigns: "no",
    commission_rate: "30% recurring",
    min_payout: "$100",
    payment_methods: ["PayPal"],
    cookie_duration: "90 days",
    program_type: "direct",
    two_tier_commission: "no"
  },
  {
    id: 24,
    company_name: "SiteGround",
    domain: "siteground.com",
    url_to_aff_program_signup: "https://www.siteground.com/affiliates",
    signed_up: "yes",
    niches_served: ["Web Hosting", "WordPress Hosting", "Cloud Hosting"],
    country_based_in: "Bulgaria",
    actively_running_their_campaigns: "yes",
    commission_rate: "$50-$100 per sale",
    min_payout: "$50",
    payment_methods: ["PayPal"],
    cookie_duration: "60 days",
    program_type: "direct",
    two_tier_commission: "no"
  },
  {
    id: 25,
    company_name: "GetResponse",
    domain: "getresponse.com",
    url_to_aff_program_signup: "https://www.getresponse.com/partners/affiliate-program",
    signed_up: "not yet",
    niches_served: ["Email Marketing", "Landing Pages", "Webinars"],
    country_based_in: "Poland",
    actively_running_their_campaigns: "no",
    commission_rate: "33% recurring",
    min_payout: "$50",
    payment_methods: ["PayPal"],
    cookie_duration: "120 days",
    program_type: "direct",
    two_tier_commission: "yes"
  },
];

// Main component
const AffiliatePrograms: React.FC = () => {
  // State for pagination and filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [campaignFilter, setCampaignFilter] = useState<string>('all');
  const rowsPerPage = 10;

  // Filter data based on search term and filters
  const filteredData = dummyAffiliateProgramsData.filter(program => {
    const matchesSearch = 
      program.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.niches_served.some(niche => 
        niche.toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    const matchesStatusFilter = 
      statusFilter === 'all' || 
      program.signed_up === statusFilter;
    
    const matchesCampaignFilter = 
      campaignFilter === 'all' || 
      program.actively_running_their_campaigns === campaignFilter;
    
    return matchesSearch && matchesStatusFilter && matchesCampaignFilter;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredData.slice(indexOfFirstRow, indexOfLastRow);

  // Handler for page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handler for search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header pageTitle="Affiliate Programs" />
      
      <div className="container mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Affiliate Programs Manager</h1>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                Add New Program
              </Button>
              <Button variant="outline">
                Export Data
              </Button>
            </div>
          </div>
          
          {/* Filters and search */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                type="text"
                placeholder="Search by company, domain or niche..."
                className="pl-10 pr-4 py-2 w-full"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Signup Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="yes">Signed Up</SelectItem>
                  <SelectItem value="not yet">Not Yet Signed Up</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={campaignFilter} onValueChange={setCampaignFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Campaign Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Campaigns</SelectItem>
                  <SelectItem value="yes">Active Campaigns</SelectItem>
                  <SelectItem value="no">Inactive Campaigns</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company Name</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Domain</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">URL to Signup</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Signed Up</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Niches Served</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Country</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active Campaigns</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentRows.length > 0 ? (
                  currentRows.map((program) => (
                    <tr key={program.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{program.id}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{program.company_name}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{program.domain}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-blue-500 hover:text-blue-700">
                        <a href={program.url_to_aff_program_signup} target="_blank" rel="noopener noreferrer">
                          Signup Link
                        </a>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          program.signed_up === 'yes' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {program.signed_up}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {program.niches_served.slice(0, 2).map((niche, index) => (
                            <span key={index} className="px-2 py-1 text-xs bg-gray-100 rounded">
                              {niche}
                            </span>
                          ))}
                          {program.niches_served.length > 2 && (
                            <span className="px-2 py-1 text-xs bg-gray-100 rounded">
                              +{program.niches_served.length - 2} more
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{program.country_based_in}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          program.actively_running_their_campaigns === 'yes' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {program.actively_running_their_campaigns}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-900 mr-2">
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-900">
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                      No affiliate programs found matching your criteria.
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
                    {Math.min(indexOfLastRow, filteredData.length)}
                  </span>{' '}
                  of <span className="font-medium">{filteredData.length}</span> results
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

export default AffiliatePrograms;