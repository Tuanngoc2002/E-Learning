import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaStar, FaUsers } from 'react-icons/fa';
import { useAuth } from '@/hooks/useAuth';

interface Course {
  id: number;
  name: string;
  descriptions: string;
  price: number;
  thumbnail: {
    url: string;
  };
  instructor: {
    username: string;
  };
  category: {
    name: string;
  };
  user_courses: any[];
}

interface RecommendedCoursesProps {
  courseId: number;
}

const RecommendedCourses: React.FC<RecommendedCoursesProps> = ({ courseId }) => {
  const [recommendations, setRecommendations] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const { jwt } = useAuth();

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/courses/${courseId}/recommendations`,
          {
            headers: jwt ? {
              Authorization: `Bearer ${jwt}`
            } : {}
          }
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch recommendations');
        }

        const { data } = await response.json();
        // Get current course name
        const currentCourse = data.find((course: Course) => course.id === courseId);
        // Filter out the current course and courses with same name
        const filteredRecommendations = data.filter((course: Course) => 
          course.id !== courseId && 
          course.name.toLowerCase() !== currentCourse?.name?.toLowerCase()
        );
        setRecommendations(filteredRecommendations);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [courseId, jwt]);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="bg-gray-100 rounded-lg p-4">
              <div className="h-40 bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!recommendations.length) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {recommendations.map((course) => (
          <Link 
            key={course.id} 
            href={`/courses/${course.id}`}
            className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden"
          >
            <div className="relative h-48">
              <Image
                src={course.thumbnail?.url || '/images/course-placeholder.jpg'}
                alt={course.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {course.user_courses?.length > 0 && (
                <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  Enrolled
                </div>
              )}
            </div>
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
                  {course.category?.name}
                </span>
                <div className="flex items-center">
                  <FaStar className="text-yellow-400 w-4 h-4 mr-1" />
                  <span>4.5</span>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                {course.name}
              </h3>
              <p className="text-sm text-gray-500 line-clamp-2">
                {course.descriptions}
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div className="flex items-center text-sm text-gray-500">
                  <FaUsers className="w-4 h-4 mr-1" />
                  <span>500+ students</span>
                </div>
                <div className="font-semibold text-blue-600">
                  ${course.price}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RecommendedCourses;
