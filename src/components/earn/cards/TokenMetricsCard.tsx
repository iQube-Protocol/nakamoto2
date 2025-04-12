
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { TokenMetrics } from '@/lib/types';

interface TokenMetricsCardProps {
  tokenMetrics: TokenMetrics;
}

const TokenMetricsCard = ({ tokenMetrics }: TokenMetricsCardProps) => {
  return (
    <Card className="h-full">
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
    </Card>
  );
};

export default TokenMetricsCard;
