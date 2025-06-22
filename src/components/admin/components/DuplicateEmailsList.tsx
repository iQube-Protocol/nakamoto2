
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DuplicateEmailRecord } from '@/services/data-reconciliation';

interface DuplicateEmailsListProps {
  duplicates: DuplicateEmailRecord[];
}

const DuplicateEmailsList: React.FC<DuplicateEmailsListProps> = ({ duplicates }) => {
  if (duplicates.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-red-600">Duplicate Email Records</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {duplicates.map((duplicate, index) => (
            <div key={index} className="flex items-center justify-between p-2 border border-red-200 rounded bg-red-50">
              <div>
                <span className="font-medium">{duplicate.email}</span>
                <Badge variant="destructive" className="ml-2">
                  {duplicate.count} records
                </Badge>
              </div>
              <div className="text-xs text-gray-500">
                IDs: {duplicate.ids.slice(0, 2).join(', ')}
                {duplicate.ids.length > 2 && ` +${duplicate.ids.length - 2} more`}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DuplicateEmailsList;
