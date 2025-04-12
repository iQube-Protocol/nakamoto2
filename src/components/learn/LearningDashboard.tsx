
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, BookOpen } from 'lucide-react';

const LearningDashboard = () => {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <BarChart className="h-5 w-5 mr-2 text-blue-400" />
          Learning Dashboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-sm mb-1">Your Progress</h3>
            <div className="flex justify-between text-sm mb-1">
              <span>Overall completion</span>
              <span>65%</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: '65%' }}></div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-sm mb-1">Recent Activity</h3>
            <ul className="space-y-2">
              <li className="text-sm flex items-start">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 mr-2"></div>
                <span>Completed Web3 Fundamentals Lesson 8</span>
              </li>
              <li className="text-sm flex items-start">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 mr-2"></div>
                <span>Earned "Knowledge Seeker" achievement</span>
              </li>
              <li className="text-sm flex items-start">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 mr-2"></div>
                <span>Started iQube Protocol course</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-sm mb-1">Recommended Next</h3>
            <Card className="p-2 hover:bg-muted/50 transition-colors cursor-pointer">
              <div className="flex items-center">
                <BookOpen className="h-6 w-6 mr-3 text-blue-400" />
                <div>
                  <p className="font-medium text-sm">Web3 Fundamentals</p>
                  <p className="text-xs text-muted-foreground">Continue Lesson 9: Smart Contracts</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LearningDashboard;
