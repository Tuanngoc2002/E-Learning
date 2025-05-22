import React from 'react';
import { FaStar } from 'react-icons/fa';

interface CourseRatingProps {
  rating: number;
  className?: string;
}

export const CourseRating = ({ rating, className = '' }: CourseRatingProps) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="flex items-center">
        {[...Array(5)].map((_, index) => (
          <FaStar key={index} className="w-4 h-4 text-yellow-600" />
        ))}
      </div>
      <span className="text-base text-orange-800 font-semibold">
        ({rating} Reviews)
      </span>
    </div>
  );
}; 