
import React from 'react';
import { Award } from 'lucide-react';

export interface Achievement {
  id: number;
  title: string;
  status: string;
  unlocked: boolean;
}

interface AchievementsListProps {
  achievements: Achievement[];
  currentIndex: number;
}

const AchievementsList = ({ achievements, currentIndex }: AchievementsListProps) => {
  const current = achievements[currentIndex];
  
  return (
    <div className="h-full">
      <div className="p-6 h-full flex flex-col items-center justify-center text-center">
        <div className={`mx-auto rounded-full w-12 h-12 flex items-center justify-center mb-4 ${
          current.unlocked ? "bg-gradient-to-r from-iqube-primary to-iqube-accent" : "bg-gray-200"
        }`}>
          {current.unlocked ? (
            <Award className="h-6 w-6 text-white" />
          ) : (
            <Award className="h-6 w-6 text-gray-400" />
          )}
        </div>
        <h3 className="text-lg font-medium mb-2">{current.title}</h3>
        <p className="text-sm text-muted-foreground">{current.status}</p>
      </div>
    </div>
  );
};

// Default achievements data
export const defaultAchievements = [
  { id: 1, title: "First Steps", status: "Unlocked", unlocked: true },
  { id: 2, title: "Knowledge Seeker", status: "Unlocked", unlocked: true },
  { id: 3, title: "Quiz Master", status: "Unlocked", unlocked: true },
  { id: 4, title: "Web3 Explorer", status: "Locked", unlocked: false },
  { id: 5, title: "Token Sage", status: "Locked", unlocked: false },
  { id: 6, title: "Community Leader", status: "Locked", unlocked: false },
  { id: 7, title: "Developer", status: "Locked", unlocked: false },
  { id: 8, title: "iQube Master", status: "Locked", unlocked: false },
];

export default AchievementsList;
