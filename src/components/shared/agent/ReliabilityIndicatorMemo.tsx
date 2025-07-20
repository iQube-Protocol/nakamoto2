import React from 'react';

interface ReliabilityIndicatorProps {
  isProcessing?: boolean;
}

const ReliabilityIndicatorMemo: React.FC<ReliabilityIndicatorProps> = React.memo(({ isProcessing }) => {
  // Keep exact same logic and appearance
  const reliability = 'Medium'; // This matches the current display
  
  return (
    <div className="reliability-indicator">
      <span className="text-sm text-muted-foreground">
        {reliability} Reliability
      </span>
    </div>
  );
});

ReliabilityIndicatorMemo.displayName = 'ReliabilityIndicatorMemo';

export default ReliabilityIndicatorMemo;
