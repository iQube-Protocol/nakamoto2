
import React from 'react';

interface DotScoreProps {
  value: number;
  label: string;
  maxValue?: number;
}

const DotScore: React.FC<DotScoreProps> = ({ value, label, maxValue = 10 }) => {
  // Calculate the number of filled dots based on the score
  const filledDots = Math.round((value / maxValue) * 5);
  
  // Determine color based on score value
  const getColor = () => {
    const percentage = (value / maxValue) * 100;
    if (percentage >= 70) return 'bg-green-500';
    if (percentage >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  
  const color = getColor();
  
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex gap-1">
        {[...Array(5)].map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full ${
              index < filledDots ? color : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
};

export default DotScore;
