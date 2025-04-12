
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
  onCollapse?: () => void;
  isPanelCollapsed?: boolean;
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
  goToNext,
  onCollapse,
  isPanelCollapsed
}: ContentDisplayProps) => {
  // When panel is collapsed, we don't want to hide content completely
  // Instead, we'll show the content for the selected tab when an icon is clicked
  if (isPanelCollapsed && selectedTab) {
    // For collapsed panel with a selected tab, render the corresponding content in fullscreen
    if (selectedTab === 'price') {
      return (
        <Card className="h-full fixed top-0 left-0 right-0 bottom-0 z-50 bg-background m-4 rounded-lg shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">MonDAI Price</CardTitle>
            <Button variant="ghost" size="icon" onClick={onCollapse}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="pt-4 pb-6">
            <ScrollArea className="h-[calc(100vh-200px)]">
              <TokenPriceChart 
                tokenMetrics={tokenMetrics}
                chartData={chartData}
                timeframe={timeframe}
                setTimeframe={setTimeframe}
              />
            </ScrollArea>
          </CardContent>
        </Card>
      );
    }

    // Get current items based on selected tab for collapsed view
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
    const currentItem = currentItems[currentItemIndex] || null;

    return (
      <Card className="h-full fixed top-0 left-0 right-0 bottom-0 z-50 bg-background m-4 rounded-lg shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">
            {selectedTab === 'stats' && 'Token Statistics'}
            {selectedTab === 'portfolio' && 'Your Portfolio'}
            {selectedTab === 'transactions' && 'Transaction History'}
          </CardTitle>
          <div className="flex space-x-1 items-center">
            <Button variant="ghost" size="icon" onClick={goToPrev} disabled={currentItems.length <= 1}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-sm">
              {currentItemIndex + 1}/{currentItems.length}
            </Button>
            <Button variant="ghost" size="icon" onClick={goToNext} disabled={currentItems.length <= 1}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onCollapse} className="ml-2">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-4 pb-6">
          <ScrollArea className="h-[calc(100vh-200px)]">
            {currentItem}
          </ScrollArea>
        </CardContent>
      </Card>
    );
  }

  if (!selectedTab) {
    return (
      <Card className="h-full">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center text-lg">
              <BarChart className="h-5 w-5 mr-2 text-iqube-accent" />
              Earning Dashboard
            </CardTitle>
            {onCollapse && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onCollapse}
                className="h-8 w-8"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
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
        <div className="flex justify-between items-center mb-2 px-2">
          <div></div> {/* Empty div for spacing */}
          {onCollapse && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onCollapse}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
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
          <div className="flex space-x-1 items-center">
            <Button variant="ghost" size="icon" onClick={goToPrev} disabled={currentItems.length <= 1}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-sm">
              {currentItemIndex + 1}/{currentItems.length}
            </Button>
            <Button variant="ghost" size="icon" onClick={goToNext} disabled={currentItems.length <= 1}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            {onCollapse && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onCollapse}
                className="h-8 w-8 ml-2"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
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
