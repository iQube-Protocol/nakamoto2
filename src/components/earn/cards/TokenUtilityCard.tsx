
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Wallet, Users, ArrowUpRight } from 'lucide-react';

const TokenUtilityCard = () => {
  return (
    <Card className="h-full">
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
  );
};

export default TokenUtilityCard;
