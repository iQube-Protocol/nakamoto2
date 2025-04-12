
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface TokenStatsCardProps {
  title: string;
  distributionData: Array<{ name: string; value: number }>;
}

const TokenStatsCard = ({ title, distributionData }: TokenStatsCardProps) => {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={distributionData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#6E56CF" 
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-4">
          {distributionData.map((item, i) => (
            <div key={i} className="flex items-center text-xs">
              <div className={`w-3 h-3 rounded-full mr-1 bg-iqube-primary opacity-${(i+5)*10}`}></div>
              <span>{item.name}: {item.value}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TokenStatsCard;
