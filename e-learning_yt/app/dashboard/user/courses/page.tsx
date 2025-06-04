"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiBook, FiClock, FiPlay, FiPlus, FiSearch } from 'react-icons/fi';
import { useAuth } from '@/hooks/useAuth';
import Image from 'next/image';

interface Course {
  id: number;
  name: string;
  descriptions: string;
  difficulty: string;
  price: number | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

interface EnrolledCourse extends Course {
  progress?: number;
  lastAccessed?: string;
  user_courses?: any[];
}

const UserCoursesPage = () => {
  const { jwt, user } = useAuth();
  const router = useRouter();
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'enrolled' | 'available'>('enrolled');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        let enrolledData: any = { data: [] }; // Initialize with default value

        // Fetch enrolled courses
        const enrolledResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/user-courses?populate=course&filters[user][id][$eq]=${user?.id}`,
          {
            headers: {
              'Authorization': `Bearer ${jwt}`,
            },
          }
        );

        if (enrolledResponse.ok) {
          enrolledData = await enrolledResponse.json();
          const courses = enrolledData.data.map((enrollment: any) => ({
            ...enrollment.course,
            progress: enrollment.progress || 0,
            lastAccessed: enrollment.lastAccessed,
            user_courses: [enrollment]
          }));
          setEnrolledCourses(courses);
        }

        // Fetch all available published courses
        const availableResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/courses?filters[isPublished][$eq]=true&populate=user_courses`,
          {
            headers: {
              'Authorization': `Bearer ${jwt}`,
            },
          }
        );

        if (availableResponse.ok) {
          const availableData = await availableResponse.json();
          // Filter out courses the user is already enrolled in
          const enrolledCourseIds = new Set(enrolledData.data?.map((e: any) => e.course.id) || []);
          const notEnrolledCourses = availableData.data.filter((course: Course) => 
            !enrolledCourseIds.has(course.id)
          );
          setAvailableCourses(notEnrolledCourses);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch courses');
        console.error('Error fetching courses:', err);
      } finally {
        setLoading(false);
      }
    };

    if (jwt && user?.id) {
      fetchCourses();
    }
  }, [jwt, user?.id]);

  const handleCourseClick = (courseId: number) => {
    router.push(`/courses/${courseId}`);
  };

  const handleContinueLearning = (courseId: number) => {
    router.push(`/courses/${courseId}`);
  };

  const filteredAvailableCourses = availableCourses.filter(course =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.descriptions.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEnrolledCourses = enrolledCourses.filter(course =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.descriptions.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
          <button
            onClick={() => router.push('/courses')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FiPlus className="w-5 h-5 mr-2" />
            Browse All Courses
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <FiBook className="w-8 h-8 text-blue-600 mr-4" />
              <div>
                <div className="text-2xl font-bold text-blue-600">{enrolledCourses.length}</div>
                <div className="text-sm text-gray-500">Enrolled Courses</div>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <FiClock className="w-8 h-8 text-green-600 mr-4" />
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {enrolledCourses.reduce((total, course) => total + (course.progress || 0), 0)}%
                </div>
                <div className="text-sm text-gray-500">Avg Progress</div>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <FiPlay className="w-8 h-8 text-purple-600 mr-4" />
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {enrolledCourses.filter(c => (c.progress || 0) === 100).length}
                </div>
                <div className="text-sm text-gray-500">Completed</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('enrolled')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'enrolled'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Courses ({enrolledCourses.length})
            </button>
            <button
              onClick={() => setActiveTab('available')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'available'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Available Courses ({availableCourses.length})
            </button>
          </nav>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Course Content */}
        {activeTab === 'enrolled' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEnrolledCourses.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="text-gray-500 mb-4">
                  {searchTerm ? 'No courses found matching your search.' : "You haven't enrolled in any courses yet."}
                </div>
                <button
                  onClick={() => setActiveTab('available')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  Browse Available Courses
                </button>
              </div>
            ) : (
              filteredEnrolledCourses.map((course) => (
                <div key={course.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative h-48">
                    <Image
                      src="/images/course-placeholder.jpg"
                      alt={course.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(course.difficulty)}`}>
                        {course.difficulty}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.name}</h3>
                    <p className="text-gray-600 mb-4 text-sm line-clamp-2">{course.descriptions}</p>
                    
                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{course.progress || 0}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${course.progress || 0}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        Last accessed: {course.lastAccessed ? formatDate(course.lastAccessed) : 'Never'}
                      </span>
                      <button
                        onClick={() => handleContinueLearning(course.id)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                      >
                        <FiPlay className="w-4 h-4 mr-1" />
                        Continue
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'available' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAvailableCourses.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="text-gray-500">
                  {searchTerm ? 'No courses found matching your search.' : 'No available courses at the moment.'}
                </div>
              </div>
            ) : (
              filteredAvailableCourses.map((course) => (
                <div key={course.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative h-48">
                    <Image
                      src="/images/course-placeholder.jpg"
                      alt={course.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(course.difficulty)}`}>
                        {course.difficulty}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.name}</h3>
                    <p className="text-gray-600 mb-4 text-sm line-clamp-2">{course.descriptions}</p>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-blue-600">
                        {course.price ? `$${course.price}` : 'Free'}
                      </span>
                      <button
                        onClick={() => handleCourseClick(course.id)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                      >
                        View Course
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserCoursesPage; 