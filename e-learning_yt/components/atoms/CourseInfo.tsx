import React from 'react';
import { FaStar, FaUsers, FaClock } from 'react-icons/fa';
import { Course } from '@/types/course';

interface CourseInfoProps {
  course: Course;
  className?: string;
}

export const CourseInfo = ({ course, className = '' }: CourseInfoProps) => {
  return (
    <div className={`flex items-center justify-between text-sm text-gray-500 ${className}`}>
      <div className="flex items-center">
        <FaStar className="text-yellow-400 mr-1" />
        <span>{course.rating}</span>
      </div>
      <div className="flex items-center">
        <FaUsers className="mr-1" />
        <span>{course.students} students</span>
      </div>
      <div className="flex items-center">
        <FaClock className="mr-1" />
        <span>{course.duration}</span>
      </div>
    </div>
  );
}; 