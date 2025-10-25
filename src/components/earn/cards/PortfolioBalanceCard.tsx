
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const PortfolioBalanceCard = () => {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base">Your Aigent Balance</CardTitle>
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
    </Card>
  );
};

export default PortfolioBalanceCard;
