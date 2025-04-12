
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

const EarningStatsCard = () => {
  return (
    <Card className="h-full">
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
  );
};

export default EarningStatsCard;
