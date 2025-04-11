
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BookOpen, FileText, Video, Award } from 'lucide-react';

interface CourseCardProps {
  course: {
    id: number;
    title: string;
    description: string;
    progress: number;
    lessons: number;
    completed: number;
    icon: React.ReactNode;
  };
}

const CourseCard = ({ course }: CourseCardProps) => {
  return (
    <Card className="h-full">
      <CardContent className="pt-6 h-full flex flex-col">
        <div className="mb-4">
          {course.icon}
        </div>
        <h3 className="text-lg font-semibold mb-1">{course.title}</h3>
        <p className="text-sm text-muted-foreground mb-4">{course.description}</p>
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Progress</span>
            <span>{course.progress}%</span>
          </div>
          <Progress value={course.progress} className="h-2" />
        </div>
        <div className="flex justify-between text-sm text-muted-foreground mt-auto">
          <span>{course.completed}/{course.lessons} lessons</span>
          <Button size="sm" className="h-8">
            Continue
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseCard;
