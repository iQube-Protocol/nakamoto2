
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import CourseList, { Course } from './CourseList';
import CertificationsList, { Certification } from './CertificationsList';
import AchievementsList, { Achievement } from './AchievementsList';

interface ContentDisplayProps {
  activeTab: string | null;
  currentItemIndex: number;
  courses: Course[];
  certifications: Certification[];
  achievements: Achievement[];
  goToPrev: () => void;
  goToNext: () => void;
  onCollapse?: () => void;
}

const ContentDisplay = ({
  activeTab,
  currentItemIndex,
  courses,
  certifications,
  achievements,
  goToPrev,
  goToNext,
  onCollapse,
}: ContentDisplayProps) => {
  if (!activeTab) {
    return <LearningDashboard onCollapse={onCollapse} />;
  }

  const currentItems = 
    activeTab === 'courses' ? courses :
    activeTab === 'certifications' ? certifications :
    activeTab === 'achievements' ? achievements : [];

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-0">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">
            {activeTab === 'courses' && 'Course Details'}
            {activeTab === 'certifications' && 'Certification Details'}
            {activeTab === 'achievements' && 'Achievement Details'}
          </CardTitle>
          <div className="flex space-x-1 items-center">
            <Button variant="ghost" size="icon" onClick={goToPrev} disabled={currentItems.length <= 1}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-sm">
              {currentItemIndex + 1}/{currentItems.length}
            </Button>
            <Button variant="ghost" size="icon" onClick={goToNext} disabled={currentItems.length <= 1}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            {onCollapse && (
              <Button variant="ghost" size="icon" onClick={onCollapse} title="Collapse panel">
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        {activeTab === 'courses' ? (
          <CourseList courses={courses} currentIndex={currentItemIndex} />
        ) : activeTab === 'certifications' ? (
          <CertificationsList certifications={certifications} currentIndex={currentItemIndex} />
        ) : activeTab === 'achievements' ? (
          <AchievementsList achievements={achievements} currentIndex={currentItemIndex} />
        ) : null}
      </CardContent>
    </Card>
  );
};

// Import and update the LearningDashboard component
import LearningDashboard from './LearningDashboard';

export default ContentDisplay;
