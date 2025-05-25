import { useState } from 'react';
import { useLocation } from 'wouter';
import MainNavigationMenu from '@/components/NavigationMenu';
import UserLoginStatus from '@/components/UserLoginStatus';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { 
  ArrowUp, 
  ArrowDown, 
  Link as LinkIcon, 
  X, 
  ChevronRight,
  ChevronDown,
  Star,
} from 'lucide-react';

// Historical ranking data for keywords
const rankingHistoryData = [
  { date: 'Apr 21, 2025', position: 5 },
  { date: 'Apr 24, 2025', position: 42 },
  { date: 'Apr 27, 2025', position: 4 },
  { date: 'Apr 30, 2025', position: 4 },
  { date: 'May 3, 2025', position: 4 },
  { date: 'May 6, 2025', position: 4 },
  { date: 'May 9, 2025', position: 4 },
  { date: 'May 12, 2025', position: 5 },
  { date: 'May 15, 2025', position: 8 },
  { date: 'May 18, 2025', position: 7 },
  { date: 'May 21, 2025', position: 7 },
  { date: 'May 24, 2025', position: 8 },
];

// Dummy data based on the screenshot
const dummyData = [
  { 
    url: 'aucklandconcreteservice.co.nz', 
    change: 0, 
    high: 8, 
    low: 5, 
    keywords: 5, 
    movement: 'neutral',
    expandedView: false,
    keywordData: [
      { 
        keyword: 'auckland concrete', 
        rank: 4, 
        change: 0, 
        volume: 210, 
        searchEngine: 'www.google.co.nz', 
        location: 'Auckland, Auckland, New Zealand', 
        platform: 'Desktop', 
        updated: 'May 25 8:13:16 PM',
        showHistory: false,
        history: rankingHistoryData
      },
      { 
        keyword: 'auckland concrete service', 
        rank: 1, 
        change: 0, 
        volume: 0, 
        searchEngine: 'www.google.co.nz', 
        location: 'Auckland, Auckland, New Zealand', 
        platform: 'Desktop', 
        updated: 'May 25 8:13:18 PM',
        showHistory: false,
        history: rankingHistoryData
      },
      { 
        keyword: 'auckland concrete services', 
        rank: 1, 
        change: 0, 
        volume: 30, 
        searchEngine: 'www.google.co.nz', 
        location: 'Auckland, Auckland, New Zealand', 
        platform: 'Desktop', 
        updated: 'May 25 8:13:21 PM',
        showHistory: false,
        history: rankingHistoryData
      },
      { 
        keyword: 'concrete auckland', 
        rank: 8, 
        change: 0, 
        volume: 0, 
        searchEngine: 'www.google.co.nz', 
        location: 'Auckland, Auckland, New Zealand', 
        platform: 'Desktop', 
        updated: 'May 25 8:13:24 PM',
        showHistory: false,
        history: rankingHistoryData
      },
      { 
        keyword: 'concrete contractors auckland', 
        rank: 7, 
        change: 0, 
        volume: 50, 
        searchEngine: 'www.google.co.nz', 
        location: 'Auckland, Auckland, New Zealand', 
        platform: 'Desktop', 
        updated: 'May 25 8:44:58 PM',
        showHistory: false,
        history: rankingHistoryData
      },
    ]
  },
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
  const [tableData, setTableData] = useState(dummyData);
  const [keywordFilter, setKeywordFilter] = useState('');
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  
  // Toggle expanded view for a row
  const toggleExpandedView = (index: number) => {
    const newData = [...tableData];
    newData[index] = {
      ...newData[index],
      expandedView: !newData[index].expandedView
    };
    setTableData(newData);
  };

  // Handle checkbox selection for keywords
  const toggleKeywordSelection = (keyword: string) => {
    if (selectedKeywords.includes(keyword)) {
      setSelectedKeywords(selectedKeywords.filter(k => k !== keyword));
    } else {
      setSelectedKeywords([...selectedKeywords, keyword]);
    }
  };
  
  // Toggle keyword history chart
  const toggleKeywordHistory = (urlIndex: number, keywordIndex: number) => {
    const newData = [...tableData];
    if (newData[urlIndex].keywordData) {
      // Reset all other keyword history views first
      newData[urlIndex].keywordData.forEach((kw, idx) => {
        if (kw.showHistory && idx !== keywordIndex) {
          kw.showHistory = false;
        }
      });
      
      // Toggle the selected keyword's history view
      newData[urlIndex].keywordData[keywordIndex].showHistory = 
        !newData[urlIndex].keywordData[keywordIndex].showHistory;
      
      setTableData(newData);
    }
  };
  
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
                {tableData.map((row, index) => (
                  <>
                    <tr 
                      key={index} 
                      className={`hover:bg-gray-50 cursor-pointer ${row.expandedView ? 'bg-gray-50' : ''}`}
                      onClick={() => toggleExpandedView(index)}
                    >
                      <td className="py-3 px-4 border-b border-gray-200">
                        <span className="text-blue-600 hover:underline">{row.url}</span>
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
                      <td className="py-3 px-4 border-b border-gray-200" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center space-x-2">
                          <button className="text-blue-500 hover:text-blue-700">
                            <LinkIcon size={16} />
                          </button>
                          <button className="text-red-500 hover:text-red-700">
                            <X size={16} />
                          </button>
                          <button 
                            className="text-gray-500 hover:text-gray-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpandedView(index);
                            }}
                          >
                            {row.expandedView ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                    
                    {/* Expanded keyword view */}
                    {row.expandedView && row.keywordData && (
                      <tr>
                        <td colSpan={7} className="p-0">
                          <div className="bg-gray-50 p-4">
                            {/* Filter and bulk action bar */}
                            <div className="flex justify-between mb-4">
                              <Input 
                                type="text" 
                                placeholder="Type to filter keywords" 
                                className="max-w-xs border rounded px-3 py-2 text-sm"
                                value={keywordFilter}
                                onChange={(e) => setKeywordFilter(e.target.value)}
                              />
                              <div className="flex items-center space-x-2">
                                <div className="text-sm text-gray-500">Bulk actions</div>
                                <ChevronDown className="h-4 w-4 text-gray-500" />
                                <Button 
                                  className="ml-2 bg-green-500 hover:bg-green-600 text-white px-4 py-1.5 rounded text-sm"
                                >
                                  Add Keywords
                                </Button>
                              </div>
                            </div>
                            
                            {/* Keywords table */}
                            <table className="min-w-full border-collapse">
                              <thead>
                                <tr className="bg-white">
                                  <th className="w-8 py-2 px-3 text-left">
                                    <Checkbox />
                                  </th>
                                  <th className="w-8 py-2 px-1 text-left"></th>
                                  <th className="py-2 px-3 text-left text-sm font-medium text-gray-600">Keyword</th>
                                  <th className="py-2 px-3 text-left text-sm font-medium text-gray-600">Rank</th>
                                  <th className="py-2 px-3 text-left text-sm font-medium text-gray-600">Change</th>
                                  <th className="py-2 px-3 text-left text-sm font-medium text-gray-600">Volume</th>
                                  <th className="py-2 px-3 text-left text-sm font-medium text-gray-600">Search Engine</th>
                                  <th className="py-2 px-3 text-left text-sm font-medium text-gray-600">Location</th>
                                  <th className="py-2 px-3 text-left text-sm font-medium text-gray-600">Platform</th>
                                  <th className="py-2 px-3 text-left text-sm font-medium text-gray-600">Updated</th>
                                </tr>
                              </thead>
                              <tbody>
                                {row.keywordData.filter(k => 
                                  k.keyword.toLowerCase().includes(keywordFilter.toLowerCase())
                                ).map((keyword, kIndex) => (
                                  <>
                                    <tr 
                                      key={kIndex} 
                                      className="hover:bg-gray-100 cursor-pointer"
                                      onClick={() => toggleKeywordHistory(index, kIndex)}
                                    >
                                      <td className="py-2 px-3" onClick={(e) => e.stopPropagation()}>
                                        <Checkbox 
                                          checked={selectedKeywords.includes(keyword.keyword)}
                                          onCheckedChange={() => toggleKeywordSelection(keyword.keyword)}
                                        />
                                      </td>
                                      <td className="py-2 px-1">
                                        <Star className="h-4 w-4 text-gray-300" />
                                      </td>
                                      <td className="py-2 px-3 text-sm text-blue-600">{keyword.keyword}</td>
                                      <td className="py-2 px-3 text-sm font-medium text-blue-600">{keyword.rank}</td>
                                      <td className="py-2 px-3 text-sm">-</td>
                                      <td className="py-2 px-3 text-sm">{keyword.volume || '-'}</td>
                                      <td className="py-2 px-3 text-sm">{keyword.searchEngine}</td>
                                      <td className="py-2 px-3 text-sm">{keyword.location}</td>
                                      <td className="py-2 px-3 text-sm">{keyword.platform}</td>
                                      <td className="py-2 px-3 text-sm">{keyword.updated}</td>
                                    </tr>
                                    
                                    {/* Keyword ranking history chart */}
                                    {keyword.showHistory && (
                                      <tr>
                                        <td colSpan={10} className="p-0 border-b">
                                          <div className="bg-white p-4">
                                            <div className="h-64 w-full">
                                              <ResponsiveContainer width="100%" height="100%">
                                                <LineChart
                                                  data={keyword.history}
                                                  margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                                                >
                                                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                  <XAxis 
                                                    dataKey="date" 
                                                    tick={{ fontSize: 12 }}
                                                    tickMargin={10}
                                                  />
                                                  <YAxis 
                                                    domain={[0, 50]} 
                                                    reversed
                                                    ticks={[0, 5, 10, 15, 20, 25, 30, 35, 40, 45]}
                                                    tick={{ fontSize: 12 }}
                                                    tickMargin={10}
                                                    label={{ 
                                                      value: '', 
                                                      position: 'insideLeft',
                                                      angle: -90,
                                                      style: { textAnchor: 'middle' }
                                                    }}
                                                  />
                                                  <Tooltip />
                                                  <Line 
                                                    type="monotone" 
                                                    dataKey="position" 
                                                    stroke="#FF6B00" 
                                                    strokeWidth={2}
                                                    dot={{ r: 4, fill: "#FF6B00" }}
                                                    activeDot={{ r: 6 }}
                                                    connectNulls
                                                  />
                                                </LineChart>
                                              </ResponsiveContainer>
                                            </div>
                                          </div>
                                        </td>
                                      </tr>
                                    )}
                                  </>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}