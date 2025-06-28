/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import Image from 'next/image';
import { FaStar, FaUsers, FaClock, FaTag } from 'react-icons/fa';
import { useCourses } from '@/hooks/useCourses';
import { useState } from 'react';
import { Pagination } from '@/components/ui/pagination';

interface ImageFormat {
  url: string;
  width: number;
  height: number;
  size: number;
}

interface CourseImage {
  id: number;
  url: string;
  formats?: {
    large?: ImageFormat;
    medium?: ImageFormat;
    small?: ImageFormat;
    thumbnail?: ImageFormat;
  };
}

interface Course {
  id: number;
  name: string;
  descriptions: string | null;
  difficulty: string;
  price: number;
  isPublished: boolean;
  studentCount: number;
  lessons: any[];
  image: CourseImage[] | null;
  instructor: {
    id: number;
    username: string;
    email: string;
  } | null;
}

interface CourseListProps {
  searchQuery: string;
  difficulty?: string;
  minPrice?: number;
  maxPrice?: number;
}

const CourseList = ({ searchQuery, difficulty, minPrice, maxPrice }: CourseListProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const { courses, loading, error, pagination, hasNextPage, hasPreviousPage } = useCourses({
    page: currentPage,
    pageSize: 9,
    publishedOnly: true,
    search: searchQuery,
    difficulty,
    minPrice,
    maxPrice
  });
  // coxnst imgUrl = process.env.NEXT_PUBLIC_API_URL + courses[0].image.url;

  // Function to get difficulty badge style
  const getDifficultyBadgeStyle = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-700 border-green-200 shadow-green-50';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200 shadow-yellow-50';
      case 'advanced':
        return 'bg-red-100 text-red-700 border-red-200 shadow-red-50';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200 shadow-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-red-600 text-center">
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Course Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        {courses.map((course) => (
          <Link
            key={course.id}
            href={`/courses/${course.id}`}
            className="group bg-white border border-gray-100 rounded-xl overflow-hidden transition-all duration-500 hover:border-indigo-200 hover:shadow-lg hover:-translate-y-2 relative transform"
          >
            <div className="relative h-48 overflow-hidden">
              <img
                src={course.image && course.image[0]
                  ? `${process.env.NEXT_PUBLIC_API_URL}${course.image[0].formats?.medium?.url || course.image[0].url}`
                  : '/images/course-placeholder.jpg'}
                alt={course.name}
                width={500}
                height={300}
                className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
              />
              {/* Enhanced Price Badge */}
              <div className="absolute top-4 right-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg backdrop-blur-sm border border-white/20 transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl">
                <div className="flex items-center space-x-1">
                  <FaTag className="w-3 h-3" />
                  <span>${course.price}</span>
                </div>
              </div>
              {/* Overlay effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h2 className="text-xl font-semibold mb-2 text-gray-800 group-hover:text-indigo-600 transition-colors duration-300">{course.name}</h2>
                <p className="text-gray-500 text-sm group-hover:text-gray-600 transition-colors duration-300">by {course.instructor?.username || 'Unknown Instructor'}</p>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-2 transition-colors duration-300 group-hover:text-indigo-600">
                  <FaUsers className="text-gray-400 group-hover:text-indigo-500 transition-colors duration-300" />
                  <span>{course.lessons?.length || 0} lessons</span>
                </div>
                <div className="flex items-center space-x-2 transition-colors duration-300 group-hover:text-indigo-600">
                  <FaClock className="text-gray-400 group-hover:text-indigo-500 transition-colors duration-300" />
                  <span>{course.lessons?.reduce((acc, lesson) => acc + (lesson.duration || 0), 0) || 0} mins</span>
                </div>
              </div>
              <div className="pt-4 relative">
                {/* Progress Border Container */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gray-100 overflow-hidden">
                  {/* Animated Progress Bar */}
                  <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-400 to-blue-600 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700 ease-out w-full shadow-sm"></div>
                </div>
                <div className="flex justify-between items-center">
                  {/* Enhanced Level Badge */}
                  <div className="flex items-center space-x-2">
                  <span className={`text-sm font-semibold px-4 py-2 rounded-full border shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:shadow-md ${getDifficultyBadgeStyle(course.difficulty)}`}>
                    Level: {course.difficulty}
                  </span>
                  <div className="flex items-center bg-gradient-to-r from-yellow-50 to-orange-50 px-4 py-2 rounded-full border border-yellow-200 shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:shadow-md">
                    <FaStar className="text-yellow-500 w-4 h-4 mr-1.5" />
                    <span className="text-sm text-yellow-700 font-semibold">4.5</span>
                  </div>
                  </div>
                  <span className="text-indigo-600 font-semibold text-sm group-hover:translate-x-2 transition-all duration-300 flex items-center space-x-1">
                    <span>Learn More</span>
                    <span className="duration-300">→</span>
                  </span>
                </div>
              </div>
            </div>
            {/* Animated border effect */}
            <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-indigo-200 transition-all duration-300 pointer-events-none"></div>
          </Link>
        ))}
      </div>

      {/* Enhanced Pagination */}
      <Pagination
        page={pagination.page}
        pageSize={pagination.pageSize || 9}
        total={pagination.total}
        onPageChange={setCurrentPage}
      />
    </>
  );
};

export default CourseList; 