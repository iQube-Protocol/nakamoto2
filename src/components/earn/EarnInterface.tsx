
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, TrendingUp, User, ListOrdered, ChevronLeft } from 'lucide-react';
import { TokenMetrics } from '@/lib/types';
import AgentInterface from '@/components/shared/AgentInterface';
import ContentDisplay from './ContentDisplay';
import TokenStatsCard from './cards/TokenStatsCard';
import TokenMetricsCard from './cards/TokenMetricsCard';
import TokenUtilityCard from './cards/TokenUtilityCard';
import PortfolioBalanceCard from './cards/PortfolioBalanceCard';
import EarningStatsCard from './cards/EarningStatsCard';
import TransactionHistoryCard from './cards/TransactionHistoryCard';
import { generateChartData, generateDistributionData } from './utils/chartUtils';
import { Button } from '@/components/ui/button';

interface EarnInterfaceProps {
  tokenMetrics: TokenMetrics;
}

const EarnInterface = ({ tokenMetrics }: EarnInterfaceProps) => {
  const [chartData] = useState(generateChartData());
  const [distributionData] = useState(generateDistributionData());
  const [timeframe, setTimeframe] = useState('1M');
  const [selectedTab, setSelectedTab] = useState<string | null>(null);
  const [currentItemIndex, setCurrentItemIndex] = useState<number>(0);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState<boolean>(false);

  // Token Stats Cards array
  const tokenStatsCards = [
    <TokenStatsCard 
      key="distribution" 
      title="Token Distribution" 
      distributionData={distributionData} 
    />,
    <TokenMetricsCard key="metrics" tokenMetrics={tokenMetrics} />,
    <TokenUtilityCard key="utility" />
  ];

  // Portfolio Cards array
  const portfolioCards = [
    <PortfolioBalanceCard key="balance" />,
    <EarningStatsCard key="earning-stats" />
  ];

  // Transaction Cards array
  const transactionCards = [
    <TransactionHistoryCard key="recent-transactions" />
  ];
  
  const goToPrev = () => {
    setCurrentItemIndex((prevIndex) => {
      const currentItems = getCurrentItems();
      return prevIndex === 0 ? currentItems.length - 1 : prevIndex - 1;
    });
  };

  const goToNext = () => {
    setCurrentItemIndex((prevIndex) => {
      const currentItems = getCurrentItems();
      return prevIndex === currentItems.length - 1 ? 0 : prevIndex + 1;
    });
  };

  const handleTabChange = (value: string) => {
    setSelectedTab(value === selectedTab ? null : value);
    setCurrentItemIndex(0);
  };

  const togglePanelCollapse = () => {
    setIsPanelCollapsed(!isPanelCollapsed);
  };

  // Get current items based on selected tab - needed for the button handlers
  const getCurrentItems = () => {
    switch(selectedTab) {
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

  return (
    <div className="grid grid-cols-12 gap-6 h-full">
      {/* Agent Interface - Expanded when panel is collapsed */}
      <div className={isPanelCollapsed ? "col-span-11" : "col-span-8"}>
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

      {/* Dashboard Panel - Collapsed to small column when toggled */}
      <div className={isPanelCollapsed ? "col-span-1" : "col-span-4"}>
        {isPanelCollapsed ? (
          <div className="border-l h-full flex flex-col items-center justify-start p-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePanelCollapse}
              className="mt-4"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            
            <div className="mt-6 flex flex-col space-y-6">
              <Button
                variant={selectedTab === 'price' ? 'secondary' : 'ghost'}
                size="icon"
                className={`p-2 ${selectedTab === 'price' ? 'bg-iqube-primary/20' : ''}`}
                onClick={() => handleTabChange('price')}
                title="Price"
              >
                <DollarSign className="h-6 w-6" />
              </Button>
              
              <Button
                variant={selectedTab === 'stats' ? 'secondary' : 'ghost'}
                size="icon"
                className={`p-2 ${selectedTab === 'stats' ? 'bg-iqube-primary/20' : ''}`}
                onClick={() => handleTabChange('stats')}
                title="Statistics"
              >
                <TrendingUp className="h-6 w-6" />
              </Button>
              
              <Button
                variant={selectedTab === 'portfolio' ? 'secondary' : 'ghost'}
                size="icon"
                className={`p-2 ${selectedTab === 'portfolio' ? 'bg-iqube-primary/20' : ''}`}
                onClick={() => handleTabChange('portfolio')}
                title="Portfolio"
              >
                <User className="h-6 w-6" />
              </Button>
              
              <Button
                variant={selectedTab === 'transactions' ? 'secondary' : 'ghost'}
                size="icon"
                className={`p-2 ${selectedTab === 'transactions' ? 'bg-iqube-primary/20' : ''}`}
                onClick={() => handleTabChange('transactions')}
                title="Transactions"
              >
                <ListOrdered className="h-6 w-6" />
              </Button>
            </div>
          </div>
        ) : (
          <ContentDisplay
            selectedTab={selectedTab}
            currentItemIndex={currentItemIndex}
            tokenMetrics={tokenMetrics}
            chartData={chartData}
            timeframe={timeframe}
            setTimeframe={setTimeframe}
            distributionData={distributionData}
            tokenStatsCards={tokenStatsCards}
            portfolioCards={portfolioCards}
            transactionCards={transactionCards}
            goToPrev={goToPrev}
            goToNext={goToNext}
            onCollapse={togglePanelCollapse}
            isPanelCollapsed={isPanelCollapsed}
          />
        )}
      </div>

      {/* Bottom Tabs - Full width */}
      <div className="col-span-12">
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
