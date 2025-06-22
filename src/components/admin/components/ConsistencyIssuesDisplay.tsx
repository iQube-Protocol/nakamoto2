
import React from 'react';
import { Shield } from 'lucide-react';

interface ConsistencyIssuesDisplayProps {
  issues: string[];
}

const ConsistencyIssuesDisplay: React.FC<ConsistencyIssuesDisplayProps> = ({ issues }) => {
  if (issues.length === 0) return null;

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <div className="flex items-center mb-2">
        <Shield className="h-4 w-4 text-yellow-600 mr-2" />
        <span className="font-medium text-yellow-800">Data Consistency Issues Found</span>
      </div>
      <div className="space-y-1">
        {issues.map((issue, index) => (
          <p key={index} className="text-sm text-yellow-700">• {issue}</p>
        ))}
      </div>
    </div>
  );
};

export default ConsistencyIssuesDisplay;
