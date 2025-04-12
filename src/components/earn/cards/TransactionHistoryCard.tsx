
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TrendingDown, ArrowUpRight, CreditCard, Info } from 'lucide-react';

const TransactionHistoryCard = () => {
  return (
    <Card className="h-full">
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
  );
};

export default TransactionHistoryCard;
