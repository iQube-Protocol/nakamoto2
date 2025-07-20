import React from 'react';

interface ReliabilityIndicatorProps {
  // Props remain exactly the same for compatibility
}

const ReliabilityIndicatorMemo: React.FC<ReliabilityIndicatorProps> = React.memo(() => {
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
