
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, TrendingUp, TrendingDown } from 'lucide-react';
import { TokenMetrics } from '@/lib/types';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

interface TokenPriceChartProps {
  tokenMetrics: TokenMetrics;
  chartData: any[];
  timeframe: string;
  setTimeframe: (value: string) => void;
}

// Custom tooltip component
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

const TokenPriceChart = ({ tokenMetrics, chartData, timeframe, setTimeframe }: TokenPriceChartProps) => {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Activity className="mr-2 h-5 w-5 text-iqube-accent" />
            Aigent Token Price
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
};

export default TokenPriceChart;
