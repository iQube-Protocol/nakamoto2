
import React from 'react';
import { BookOpen, FileText, Video } from 'lucide-react';
import CourseCard from './CourseCard';

export interface Course {
  id: number;
  title: string;
  description: string;
  progress: number;
  lessons: number;
  completed: number;
  icon: React.ReactNode;
}

interface CourseListProps {
  courses: Course[];
  currentIndex: number;
}

const CourseList = ({ courses, currentIndex }: CourseListProps) => {
  const currentCourse = courses[currentIndex];
  
  return (
    <CourseCard course={currentCourse} />
  );
};

// Default courses data
export const defaultCourses = [
  {
    id: 1,
    title: "Web3 Fundamentals",
    description: "Learn the basics of blockchain, smart contracts, and web3 applications.",
    progress: 65,
    lessons: 12,
    completed: 8,
    icon: <BookOpen className="h-10 w-10 text-blue-400" />,
  },
  {
    id: 2,
    title: "iQube Protocol",
    description: "Understand the iQube protocol architecture and its layers.",
    progress: 30,
    lessons: 8,
    completed: 2,
    icon: <FileText className="h-10 w-10 text-purple-400" />,
  },
  {
    id: 3,
    title: "Decentralized Applications",
    description: "Build and deploy your own dApps using modern frameworks.",
    progress: 10,
    lessons: 15,
    completed: 1,
    icon: <Video className="h-10 w-10 text-green-400" />,
  },
];

export default CourseList;
