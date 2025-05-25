import { useState } from 'react';
import { useLocation } from 'wouter';
import MainNavigationMenu from '@/components/NavigationMenu';
import UserLoginStatus from '@/components/UserLoginStatus';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowUp, 
  ArrowDown, 
  Link as LinkIcon, 
  X, 
  ChevronRight,
} from 'lucide-react';

// Dummy data based on the screenshot
const dummyData = [
  { url: 'aucklandconcreteservice.co.nz', change: 0, high: 7, low: 7, keywords: 1, movement: 'neutral' },
  { url: 'aucklandplumbersgroup.co.nz', change: 0, high: 1, low: 1, keywords: 1, movement: 'neutral' },
  { url: 'augustaconcreteco.com', change: 0, high: 1, low: 1, keywords: 1, movement: 'neutral' },
  { url: 'augustamoldcontrol.com', change: 0, high: 2, low: 2, keywords: 1, movement: 'neutral' },
  { url: 'bentonvilleconcrete.com', change: 0, high: 1, low: 1, keywords: 1, movement: 'neutral' },
  { url: 'cleaningpro.co.nz', change: 0, high: 1, low: 1, keywords: 1, movement: 'neutral' },
  { url: 'columbiaroofingexperts.com', change: 2, high: 58, low: 58, keywords: 1, movement: 'up' },
  { url: 'concretedrivewayauckland.co.nz', change: -1, high: 2, low: 2, keywords: 1, movement: 'down' },
  { url: 'concretespecialistsdunedin.com', change: 0, high: 2, low: 2, keywords: 1, movement: 'neutral' },
  { url: 'deanconsultgroup.com', change: 0, high: 0, low: 0, keywords: 1, movement: 'neutral' },
  { url: 'deckbuildersgrandrapids.com', change: 0, high: 11, low: 11, keywords: 1, movement: 'neutral' },
  { url: 'drywallranklin.com', change: 0, high: 2, low: 2, keywords: 1, movement: 'neutral' },
  { url: 'drywallmurfreesboro.com', change: 0, high: 1, low: 1, keywords: 1, movement: 'neutral' },
  { url: 'electrician-islington.com', change: 0, high: 13, low: 13, keywords: 1, movement: 'neutral' },
  { url: 'electricianproslansing.com', change: 0, high: 13, low: 13, keywords: 1, movement: 'neutral' },
];

export default function RankTrackerScreen1() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState('url');
  const [timeFilter, setTimeFilter] = useState('last');
  
  return (
    <div className="font-sans bg-neutral-50 text-neutral-500 min-h-screen">
      {/* Full-width header - same as homepage but without Generate Images button */}
      <header className="w-full bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-semibold text-neutral-600 flex items-center">
              <span className="mr-2">Snefuru</span>
              <span className="text-base text-neutral-400 font-normal">Rank Tracker</span>
            </h1>
            
            <div className="flex items-center space-x-4">
              {/* Navigation Menu */}
              <MainNavigationMenu />
              
              {/* User Login Status */}
              <UserLoginStatus />
            </div>
          </div>
        </div>
      </header>

      {/* Page content - rank tracker interface */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Tab navigation */}
          <div className="border-b border-gray-200">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-auto bg-transparent border-b-0">
                <TabsTrigger 
                  value="url" 
                  className={`px-6 py-2 text-sm font-medium ${activeTab === 'url' ? 'border-b-2 border-green-500 text-green-500' : ''}`}
                >
                  By URL
                </TabsTrigger>
                <TabsTrigger 
                  value="group" 
                  className={`px-6 py-2 text-sm font-medium ${activeTab === 'group' ? 'border-b-2 border-green-500 text-green-500' : ''}`}
                >
                  By Group
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          {/* Action bar */}
          <div className="flex justify-between items-center mt-4 mb-6">
            <div className="flex-1">
              <Input 
                type="text" 
                placeholder="Type to filter URLs" 
                className="max-w-xs border rounded px-3 py-2 text-sm"
              />
            </div>
            <div className="flex items-center">
              <Button variant="outline" className={`px-4 py-1.5 text-sm rounded ${timeFilter === 'last' ? 'bg-gray-100' : ''}`} onClick={() => setTimeFilter('last')}>
                Last
              </Button>
              <Button variant="outline" className={`px-4 py-1.5 text-sm rounded ${timeFilter === 'week' ? 'bg-gray-100' : ''}`} onClick={() => setTimeFilter('week')}>
                Week
              </Button>
              <Button variant="outline" className={`px-4 py-1.5 text-sm rounded ${timeFilter === 'month' ? 'bg-gray-100' : ''}`} onClick={() => setTimeFilter('month')}>
                Month
              </Button>
              <Button className="ml-4 bg-green-500 hover:bg-green-600 text-white px-4 py-1.5 rounded text-sm">
                Add Keywords
              </Button>
            </div>
          </div>
          
          {/* Data table */}
          <div className="w-full overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left py-3 px-4 font-medium text-sm text-gray-600 border-b border-gray-200 w-1/4">URL</th>
                  <th className="text-center py-3 px-4 font-medium text-sm text-gray-600 border-b border-gray-200">Change</th>
                  <th className="text-center py-3 px-4 font-medium text-sm text-gray-600 border-b border-gray-200">High</th>
                  <th className="text-center py-3 px-4 font-medium text-sm text-gray-600 border-b border-gray-200">Low</th>
                  <th className="text-center py-3 px-4 font-medium text-sm text-gray-600 border-b border-gray-200">Keywords</th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-gray-600 border-b border-gray-200">Movement</th>
                  <th className="text-center py-3 px-4 font-medium text-sm text-gray-600 border-b border-gray-200 w-24">Actions</th>
                </tr>
              </thead>
              <tbody>
                {dummyData.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="py-3 px-4 border-b border-gray-200">
                      <span className="text-blue-600 hover:underline cursor-pointer">{row.url}</span>
                    </td>
                    <td className="text-center py-3 px-4 border-b border-gray-200">
                      {row.change > 0 ? (
                        <span className="text-green-500 flex items-center justify-center">
                          <ArrowUp size={16} className="mr-1" /> {row.change}
                        </span>
                      ) : row.change < 0 ? (
                        <span className="text-red-500 flex items-center justify-center">
                          <ArrowDown size={16} className="mr-1" /> {Math.abs(row.change)}
                        </span>
                      ) : (
                        row.change
                      )}
                    </td>
                    <td className="text-center py-3 px-4 border-b border-gray-200">{row.high}</td>
                    <td className="text-center py-3 px-4 border-b border-gray-200">{row.low}</td>
                    <td className="text-center py-3 px-4 border-b border-gray-200">{row.keywords}</td>
                    <td className="py-3 px-4 border-b border-gray-200">
                      {row.movement === 'up' ? (
                        <div className="h-2 rounded bg-green-500 w-3/4"></div>
                      ) : row.movement === 'down' ? (
                        <div className="h-2 rounded bg-red-500 w-3/4"></div>
                      ) : (
                        <div className="h-2 rounded bg-gray-200 w-3/4"></div>
                      )}
                    </td>
                    <td className="py-3 px-4 border-b border-gray-200">
                      <div className="flex items-center justify-center space-x-2">
                        <button className="text-blue-500 hover:text-blue-700">
                          <LinkIcon size={16} />
                        </button>
                        <button className="text-red-500 hover:text-red-700">
                          <X size={16} />
                        </button>
                        <button className="text-gray-500 hover:text-gray-700">
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}