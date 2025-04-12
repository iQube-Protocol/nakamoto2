
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BarChart, ChevronLeft, ChevronRight } from 'lucide-react';
import TokenPriceChart from './charts/TokenPriceChart';
import TokenStatsCard from './cards/TokenStatsCard';
import TokenMetricsCard from './cards/TokenMetricsCard';
import TokenUtilityCard from './cards/TokenUtilityCard';
import PortfolioBalanceCard from './cards/PortfolioBalanceCard';
import EarningStatsCard from './cards/EarningStatsCard';
import TransactionHistoryCard from './cards/TransactionHistoryCard';
import EarningSummaryCard from './cards/EarningSummaryCard';
import { TokenMetrics } from '@/lib/types';

interface ContentDisplayProps {
  selectedTab: string | null;
  currentItemIndex: number;
  tokenMetrics: TokenMetrics;
  chartData: any[];
  timeframe: string;
  setTimeframe: (value: string) => void;
  distributionData: Array<{ name: string; value: number }>;
  tokenStatsCards: React.ReactNode[];
  portfolioCards: React.ReactNode[];
  transactionCards: React.ReactNode[];
  goToPrev: () => void;
  goToNext: () => void;
}

const ContentDisplay = ({
  selectedTab,
  currentItemIndex,
  tokenMetrics,
  chartData,
  timeframe,
  setTimeframe,
  distributionData,
  tokenStatsCards,
  portfolioCards,
  transactionCards,
  goToPrev,
  goToNext
}: ContentDisplayProps) => {
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
            <EarningSummaryCard tokenMetrics={tokenMetrics} />
          </ScrollArea>
        </CardContent>
      </Card>
    );
  }

  if (selectedTab === 'price') {
    return (
      <ScrollArea className="h-full">
        <TokenPriceChart 
          tokenMetrics={tokenMetrics}
          chartData={chartData}
          timeframe={timeframe}
          setTimeframe={setTimeframe}
        />
      </ScrollArea>
    );
  }

  // Get current items based on selected tab
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

  const currentItems = getCurrentItems();

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

export default ContentDisplay;
