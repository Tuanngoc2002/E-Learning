import React from 'react';
import CourseList from '../organisms/CourseList';
import { useRouter } from 'next/navigation';

interface CourseGridProps {
  title?: string;
  searchQuery?: string;
  difficulty?: string;
  minPrice?: number;
  maxPrice?: number;
}

const CourseGrid: React.FC<CourseGridProps> = ({
  title = 'Khóa học mới nhất',
  searchQuery = '',
  difficulty,
  minPrice,
  maxPrice
}) => {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">{title}</h2>
        <CourseList 
          searchQuery={searchQuery}
          difficulty={difficulty}
          minPrice={minPrice}
          maxPrice={maxPrice}
        />
      </div>
    </section>
  );
};

export default CourseGrid; 