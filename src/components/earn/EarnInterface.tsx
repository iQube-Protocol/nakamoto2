
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Info,
  CreditCard,
  Users,
  Lock,
  ArrowUpRight,
  Wallet,
  Share2,
  DollarSign,
  User,
  ListOrdered,
  ChevronLeft,
  ChevronRight,
  BarChart
} from 'lucide-react';
import AgentInterface from '@/components/shared/AgentInterface';
import MetaQubeDisplay from '@/components/shared/MetaQubeDisplay';
import { MetaQube, TokenMetrics } from '@/lib/types';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

interface EarnInterfaceProps {
  metaQube: MetaQube;
  tokenMetrics: TokenMetrics;
}

// Generate mock data for token price chart
const generateChartData = () => {
  const today = new Date();
  const data = [];
  for (let i = 30; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    
    // Base price with some volatility
    const basePrice = 0.5 + Math.sin(i / 5) * 0.1;
    // Add some random noise
    const price = basePrice + (Math.random() * 0.1 - 0.05);
    // Add some random volume
    const volume = Math.random() * 50000 + 10000;
    
    data.push({
      date: date.toISOString().split('T')[0],
      price: price.toFixed(4),
      volume
    });
  }
  return data;
};

// Generate mock data for token distribution
const generateDistributionData = () => [
  { name: 'Community', value: 40 },
  { name: 'Team', value: 20 },
  { name: 'Treasury', value: 15 },
  { name: 'Partners', value: 10 },
  { name: 'Ecosystem', value: 15 }
];

const EarnInterface = ({ metaQube, tokenMetrics }: EarnInterfaceProps) => {
  const [chartData] = useState(generateChartData());
  const [distributionData] = useState(generateDistributionData());
  const [timeframe, setTimeframe] = useState('1M');
  const [selectedTab, setSelectedTab] = useState<string | null>(null);
  const [currentItemIndex, setCurrentItemIndex] = useState<number>(0);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Card className="p-2 text-xs border bg-background">
          <p className="font-semibold">{label}</p>
          <p className="text-iqube-primary">Price: ${payload[0].value}</p>
          <p className="text-muted-foreground">
            Volume: {Number(payload[0].payload.volume).toLocaleString()}
          </p>
        </Card>
      );
    }
    return null;
  };

  // Token Stats Cards defined before they are used in getCurrentItems
  const tokenStatsCards = [
    <Card key="distribution" className="h-full">
      <CardHeader>
        <CardTitle className="text-base">Token Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={distributionData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#6E56CF" 
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-4">
          {distributionData.map((item, i) => (
            <div key={i} className="flex items-center text-xs">
              <div className={`w-3 h-3 rounded-full mr-1 bg-iqube-primary opacity-${(i+5)*10}`}></div>
              <span>{item.name}: {item.value}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>,
    
    <Card key="metrics" className="h-full">
      <CardHeader>
        <CardTitle className="text-base">Key Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Price (USD)</span>
            <span className="font-medium">${tokenMetrics.price}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Market Cap</span>
            <span className="font-medium">${tokenMetrics.marketCap.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">24h Volume</span>
            <span className="font-medium">${tokenMetrics.volume24h.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Circulating Supply</span>
            <span className="font-medium">{tokenMetrics.circulatingSupply.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Total Supply</span>
            <span className="font-medium">{tokenMetrics.totalSupply.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">All Time High</span>
            <span className="font-medium">${tokenMetrics.allTimeHigh}</span>
          </div>
        </div>
      </CardContent>
    </Card>,
    
    <Card key="utility" className="h-full">
      <CardHeader>
        <CardTitle className="text-base">Utility & Benefits</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex">
            <div className="bg-iqube-primary/20 p-2 rounded mr-3">
              <Lock className="h-5 w-5 text-iqube-primary" />
            </div>
            <div>
              <h4 className="text-sm font-medium">Access Control</h4>
              <p className="text-xs text-muted-foreground mt-1">Unlock premium features and content</p>
            </div>
          </div>
          
          <div className="flex">
            <div className="bg-iqube-primary/20 p-2 rounded mr-3">
              <Wallet className="h-5 w-5 text-iqube-primary" />
            </div>
            <div>
              <h4 className="text-sm font-medium">Staking Rewards</h4>
              <p className="text-xs text-muted-foreground mt-1">Earn passive income by staking your tokens</p>
            </div>
          </div>
          
          <div className="flex">
            <div className="bg-iqube-primary/20 p-2 rounded mr-3">
              <Users className="h-5 w-5 text-iqube-primary" />
            </div>
            <div>
              <h4 className="text-sm font-medium">Governance</h4>
              <p className="text-xs text-muted-foreground mt-1">Vote on protocol decisions and proposals</p>
            </div>
          </div>
          
          <Button className="w-full mt-2 bg-iqube-primary hover:bg-iqube-primary/90">
            <ArrowUpRight className="mr-2 h-4 w-4" />
            View Tokenomics
          </Button>
        </div>
      </CardContent>
    </Card>
  ];

  // Portfolio Cards defined before they are used in getCurrentItems
  const portfolioCards = [
    <Card key="balance" className="h-full">
      <CardHeader>
        <CardTitle className="text-base">Your MonDAI Balance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold mb-1">2,500 MDAI</div>
        <div className="text-sm text-muted-foreground mb-4">≈ $1,250.00 USD</div>
        
        <div className="grid grid-cols-2 gap-3">
          <Button className="w-full bg-iqube-primary hover:bg-iqube-primary/90">
            Send
          </Button>
          <Button className="w-full" variant="outline">
            Receive
          </Button>
        </div>
        
        <div className="mt-6">
          <h4 className="text-sm font-medium mb-2">Token Distribution</h4>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Wallet</span>
                <span>1,500 MDAI</span>
              </div>
              <div className="bg-muted h-2 rounded-full">
                <div className="bg-iqube-primary h-2 rounded-full" style={{width: '60%'}}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Staked</span>
                <span>1,000 MDAI</span>
              </div>
              <div className="bg-muted h-2 rounded-full">
                <div className="bg-iqube-accent h-2 rounded-full" style={{width: '40%'}}></div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>,
    
    <Card key="earning-stats" className="h-full">
      <CardHeader>
        <CardTitle className="text-base">Earning Stats</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm">Monthly Earnings</span>
              <div className="flex items-center text-green-500">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span className="text-sm">+25.4 MDAI</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">From staking rewards and participation</p>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-3">
              <div className="text-xl font-bold">8.5%</div>
              <div className="text-xs text-muted-foreground">Current APY</div>
            </Card>
            <Card className="p-3">
              <div className="text-xl font-bold">45 days</div>
              <div className="text-xs text-muted-foreground">Avg. Lock Period</div>
            </Card>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2">Earning History</h4>
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex justify-between items-center p-2 border rounded-md">
                  <div>
                    <div className="text-sm font-medium">
                      {i === 0 ? 'Staking Reward' : i === 1 ? 'Participation Bonus' : 'Referral Reward'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(Date.now() - i * 86400000 * 7).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-sm text-green-500">
                    +{(10 - i * 2.5).toFixed(1)} MDAI
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  ];

  // Transaction Cards defined before they are used in getCurrentItems
  const transactionCards = [
    <Card key="recent-transactions" className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Recent Transactions</CardTitle>
          <Info className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[280px]">
          <div className="space-y-4 pr-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex justify-between items-center p-3 border rounded-md">
                <div className="flex items-center">
                  <div className={`p-2 rounded-full mr-3 ${
                    i % 3 === 0 ? 'bg-green-500/20' : 
                    i % 3 === 1 ? 'bg-iqube-primary/20' : 
                    'bg-amber-500/20'
                  }`}>
                    {i % 3 === 0 ? (
                      <TrendingDown className={`h-4 w-4 ${i % 3 === 0 ? 'text-green-500' : ''}`} />
                    ) : i % 3 === 1 ? (
                      <ArrowUpRight className="h-4 w-4 text-iqube-primary" />
                    ) : (
                      <CreditCard className="h-4 w-4 text-amber-500" />
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-medium">
                      {i % 3 === 0 ? 'Received MonDAI' : 
                       i % 3 === 1 ? 'Sent MonDAI' : 
                       'Staking Deposit'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(Date.now() - i * 86400000).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div>
                  <div className={`text-sm font-medium ${
                    i % 3 === 0 ? 'text-green-500' : 
                    i % 3 === 1 ? 'text-red-500' : 
                    'text-amber-500'
                  }`}>
                    {i % 3 === 0 ? '+' : i % 3 === 1 ? '-' : ''}{(50 / (i + 1)).toFixed(2)} MDAI
                  </div>
                  <div className="text-xs text-right text-muted-foreground">
                    ${((50 / (i + 1)) * 0.5).toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full">
              View All Transactions
            </Button>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  ];

  const handleTabChange = (value: string) => {
    setSelectedTab(value === selectedTab ? null : value);
    setCurrentItemIndex(0);
  };

  const getCurrentItems = () => {
    switch(selectedTab) {
      case 'price':
        return [renderPricePanel()];
      case 'stats':
        return tokenStatsCards;
      case 'portfolio':
        return portfolioCards;
      case 'transactions':
        return transactionCards;
      default:
        return [];
    }
  };

  const currentItems = getCurrentItems();
  
  const goToPrev = () => {
    setCurrentItemIndex((prevIndex) => 
      prevIndex === 0 ? currentItems.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentItemIndex((prevIndex) => 
      prevIndex === currentItems.length - 1 ? 0 : prevIndex + 1
    );
  };

  const renderPricePanel = () => (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Activity className="mr-2 h-5 w-5 text-iqube-accent" />
            MonDAI Token Price
          </CardTitle>
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTimeframe('1W')}
              className={timeframe === '1W' ? "bg-muted" : ""}
            >
              1W
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTimeframe('1M')}
              className={timeframe === '1M' ? "bg-muted" : ""}
            >
              1M
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTimeframe('3M')}
              className={timeframe === '3M' ? "bg-muted" : ""}
            >
              3M
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTimeframe('1Y')}
              className={timeframe === '1Y' ? "bg-muted" : ""}
            >
              1Y
            </Button>
          </div>
        </div>
        <div className="flex items-center space-x-4 mt-2">
          <div className="text-2xl font-bold">${tokenMetrics.price.toFixed(4)}</div>
          <div className={`flex items-center text-sm ${
            tokenMetrics.priceChange24h >= 0 ? 'text-green-500' : 'text-red-500'
          }`}>
            {tokenMetrics.priceChange24h >= 0 ? (
              <TrendingUp className="h-4 w-4 mr-1" />
            ) : (
              <TrendingDown className="h-4 w-4 mr-1" />
            )}
            {tokenMetrics.priceChange24h >= 0 ? '+' : ''}{tokenMetrics.priceChange24h}%
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6E56CF" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#6E56CF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }} 
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getDate()}/${date.getMonth() + 1}`;
                }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                domain={['dataMin - 0.05', 'dataMax + 0.05']}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="price" 
                stroke="#6E56CF" 
                fillOpacity={1}
                fill="url(#colorPrice)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );

  const renderEarningsSummary = () => (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base">Earning Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-3">
              <div className="text-lg font-bold">{tokenMetrics.holders.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Total Holders</div>
            </Card>
            <Card className="p-3">
              <div className="text-lg font-bold">${tokenMetrics.marketCap.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Market Cap</div>
            </Card>
            <Card className="p-3 flex items-center">
              <div className="mr-2">
                {tokenMetrics.priceChange24h >= 0 ? (
                  <TrendingUp className="h-5 w-5 text-green-500" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-500" />
                )}
              </div>
              <div>
                <div className={`text-sm font-bold ${
                  tokenMetrics.priceChange24h >= 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {tokenMetrics.priceChange24h >= 0 ? '+' : ''}{tokenMetrics.priceChange24h}%
                </div>
                <div className="text-xs text-muted-foreground">24h Change</div>
              </div>
            </Card>
            <Card className="p-3">
              <div className="text-lg font-bold">${tokenMetrics.volume24h.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">24h Volume</div>
            </Card>
          </div>

          <div className="pt-2">
            <h3 className="font-medium mb-3">Earning Opportunities</h3>
            <div className="space-y-3">
              <div className="flex items-center p-2 border rounded-md bg-iqube-primary/5 border-iqube-primary/20">
                <CreditCard className="h-5 w-5 text-iqube-primary mr-3" />
                <div className="flex-1">
                  <div className="text-sm font-medium">Staking Pool</div>
                  <div className="text-xs text-muted-foreground">8.5% APY</div>
                </div>
                <Button size="sm" className="h-8">Stake</Button>
              </div>
              <div className="flex items-center p-2 border rounded-md">
                <Users className="h-5 w-5 text-amber-500 mr-3" />
                <div className="flex-1">
                  <div className="text-sm font-medium">Referral Program</div>
                  <div className="text-xs text-muted-foreground">Earn 5% commission</div>
                </div>
                <Button size="sm" variant="ghost" className="h-8">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderRightPanel = () => {
    if (!selectedTab) {
      return (
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <BarChart className="h-5 w-5 mr-2 text-iqube-accent" />
              Earning Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[340px]">
              {renderEarningsSummary()}
            </ScrollArea>
          </CardContent>
        </Card>
      );
    }

    if (selectedTab === 'price') {
      return (
        <ScrollArea className="h-full">
          {renderPricePanel()}
        </ScrollArea>
      );
    }

    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-0">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">
              {selectedTab === 'stats' && 'Token Statistics'}
              {selectedTab === 'portfolio' && 'Your Portfolio'}
              {selectedTab === 'transactions' && 'Transaction History'}
            </CardTitle>
            <div className="flex space-x-1">
              <Button variant="ghost" size="icon" onClick={goToPrev} disabled={currentItems.length <= 1}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="text-sm">
                {currentItemIndex + 1}/{currentItems.length}
              </Button>
              <Button variant="ghost" size="icon" onClick={goToNext} disabled={currentItems.length <= 1}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-grow pt-4 pb-6">
          <ScrollArea className="h-full">
            {currentItems[currentItemIndex]}
          </ScrollArea>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      <div className="lg:col-span-2 flex flex-col">
        <AgentInterface
          title="Earning Assistant"
          description="MonDAI token insights and earning opportunities"
          agentType="earn"
          initialMessages={[
            {
              id: "1",
              sender: "agent",
              message: "Welcome to your Earn dashboard. I see MonDAI token has grown by 3.5% this week! Based on your iQube data, I can suggest personalized earning strategies. Would you like to explore staking options or learn about upcoming airdrops?",
              timestamp: new Date().toISOString(),
            }
          ]}
        />
      </div>

      <div className="space-y-6 flex flex-col">
        <Card>
          <CardHeader className="pb-0">
            <CardTitle className="text-lg">MetaQube</CardTitle>
          </CardHeader>
          <CardContent>
            <MetaQubeDisplay metaQube={metaQube} compact={true} />
          </CardContent>
        </Card>

        <div className="flex-grow">
          {renderRightPanel()}
        </div>
      </div>

      <div className="lg:col-span-3">
        <Tabs value={selectedTab || ''}>
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger 
              value="price" 
              onClick={() => handleTabChange('price')}
              data-state={selectedTab === 'price' ? 'active' : ''}
              className="flex items-center"
            >
              <DollarSign className="h-4 w-4 mr-1" />
              MonDAI Price
            </TabsTrigger>
            <TabsTrigger 
              value="stats" 
              onClick={() => handleTabChange('stats')}
              data-state={selectedTab === 'stats' ? 'active' : ''}
              className="flex items-center"
            >
              <TrendingUp className="h-4 w-4 mr-1" />
              Token Stats
            </TabsTrigger>
            <TabsTrigger 
              value="portfolio" 
              onClick={() => handleTabChange('portfolio')}
              data-state={selectedTab === 'portfolio' ? 'active' : ''}
              className="flex items-center"
            >
              <User className="h-4 w-4 mr-1" />
              Your Portfolio
            </TabsTrigger>
            <TabsTrigger 
              value="transactions" 
              onClick={() => handleTabChange('transactions')}
              data-state={selectedTab === 'transactions' ? 'active' : ''}
              className="flex items-center"
            >
              <ListOrdered className="h-4 w-4 mr-1" />
              Transactions
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
};

export default EarnInterface;
