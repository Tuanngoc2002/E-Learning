import React from 'react';
import { FaFile, FaUserGroup } from 'react-icons/fa6';

interface CourseStatsProps {
  lessons: number;
  students: number;
  className?: string;
}

export const CourseStats = ({ lessons, students, className = '' }: CourseStatsProps) => {
  return (
    <div className={`flex mb-8 items-center justify-between ${className}`}>
      <div className="flex items-center space-x-2">
        <FaFile className="w-4 h-4 text-orange-600" />
        <p className="text-base font-semibold text-gray-800">
          {lessons} Lessons
        </p>
      </div>
      <div className="flex items-center space-x-2">
        <FaUserGroup className="w-4 h-4 text-orange-600" />
        <p className="text-base font-semibold text-gray-800">
          {students} Students
        </p>
      </div>
    </div>
  );
}; 