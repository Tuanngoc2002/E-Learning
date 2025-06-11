/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import Image from 'next/image';
import { FaStar, FaUsers, FaClock } from 'react-icons/fa';
import { useCourses } from '@/hooks/useCourses';
import { useState } from 'react';

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
  console.log(courses);
  // const imgUrl = process.env.NEXT_PUBLIC_API_URL + courses[0].image.url;

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
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300 transform hover:-translate-y-1"
          >
            <div className="relative h-48">
              <img
                src={course.image && course.image[0] 
                  ? `${process.env.NEXT_PUBLIC_API_URL}${course.image[0].formats?.medium?.url || course.image[0].url}`
                  : '/images/course-placeholder.jpg'}
                alt={course.name}
                width={500}
                height={300}
                className="object-cover w-full h-full"
              />
              <div className="absolute top-4 right-4 bg-white px-2 py-1 rounded text-sm font-semibold">
                ${course.price}
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-indigo-600">{course.difficulty}</span>
                <div className="flex items-center">
                  <FaStar className="text-yellow-400 w-4 h-4 mr-1" />
                  <span className="text-sm text-gray-600">4.5</span>
                </div>
              </div>
              <h2 className="text-xl font-semibold mb-2">{course.name}</h2>
              <p className="text-gray-600 text-sm mb-4">by {course.instructor?.username || 'Unknown Instructor'}</p>
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center">
                  <FaUsers className="mr-2" />
                  {course.lessons?.length || 0} lessons
                </div>
                <div className="flex items-center">
                  <FaClock className="mr-2" />
                  {course.lessons?.reduce((acc, lesson) => acc + (lesson.duration || 0), 0) || 0} mins
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">
                  Level: {course.difficulty}
                </span>
                <span className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition duration-300">
                  Learn More
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-4 mb-16">
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={!hasPreviousPage}
          className={`px-4 py-2 rounded ${
            hasPreviousPage
              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Previous
        </button>
        <span className="text-gray-600">
          Page {pagination.page} of {pagination.pageCount}
        </span>
        <button
          onClick={() => setCurrentPage(prev => prev + 1)}
          disabled={!hasNextPage}
          className={`px-4 py-2 rounded ${
            hasNextPage
              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Next
        </button>
      </div>
    </>
  );
};

export default CourseList; 