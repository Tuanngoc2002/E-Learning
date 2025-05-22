import React from 'react';
import CourseCard from '../organisms/CourseCard';
import { coursesData } from '../../data/data';
import { useRouter } from 'next/navigation';

interface CourseGridProps {
  title?: string;
  courses?: typeof coursesData;
}

const CourseGrid: React.FC<CourseGridProps> = ({
  title = 'Featured Courses',
  courses = coursesData
}) => {
  const router = useRouter();

  const handleCourseClick = (courseId: number) => {
    router.push(`/courses/${courseId}`);
  };

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">{title}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onClick={() => handleCourseClick(course.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CourseGrid; 