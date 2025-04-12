
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TokenMetrics } from '@/lib/types';
import { TrendingUp, TrendingDown, CreditCard, Users, Share2 } from 'lucide-react';

interface EarningSummaryCardProps {
  tokenMetrics: TokenMetrics;
}

const EarningSummaryCard = ({ tokenMetrics }: EarningSummaryCardProps) => {
  return (
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
};

export default EarningSummaryCard;
