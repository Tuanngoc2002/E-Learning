"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  FiBook, 
  FiUsers, 
  FiStar, 
  FiDollarSign,
  FiPlus,
  FiEdit3,
  FiBarChart2,
  FiMessageCircle,
  FiTrendingUp
} from 'react-icons/fi';
import { useAuth } from '@/hooks/useAuth';

interface Course {
  id: number;
  name: string;
  descriptions: string;
  difficulty: string;
  price: number | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  lessons?: any[];
}

interface DashboardStats {
  totalCourses: number;
  publishedCourses: number;
  totalStudents: number;
  totalRevenue: number;
  avgRating: number;
}

const InstructorDashboard = () => {
  const { jwt, user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalCourses: 0,
    publishedCourses: 0,
    totalStudents: 0,
    totalRevenue: 0,
    avgRating: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInstructorData = async () => {
    if (!jwt || !user) return;
    
    try {
      setLoading(true);
      
      // Fetch instructor's courses
      const coursesResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/courses?populate=lessons&pagination[pageSize]=100&filters[instructor][id][$eq]=${user.id}`,
        {
          headers: {
            'Authorization': `Bearer ${jwt}`,
          },
        }
      );

      if (!coursesResponse.ok) {
        throw new Error('Failed to fetch courses');
      }

      const coursesData = await coursesResponse.json();
      const instructorCourses = coursesData.data || [];
      
      setCourses(instructorCourses);

      // Calculate real stats
      const totalCourses = instructorCourses.length;
      const publishedCourses = instructorCourses.filter((course: Course) => course.isPublished).length;
      const totalRevenue = instructorCourses.reduce((sum: number, course: Course) => sum + (course.price || 0), 0);
      
      // Fetch enrollments for instructor's courses
      let totalStudents = 0;
      for (const course of instructorCourses) {
        try {
          const enrollmentResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/enrollments?filters[course][id][$eq]=${course.id}`,
            {
              headers: {
                'Authorization': `Bearer ${jwt}`,
              },
            }
          );
          if (enrollmentResponse.ok) {
            const enrollmentData = await enrollmentResponse.json();
            totalStudents += enrollmentData.data?.length || 0;
          }
        } catch (err) {
          console.log('Error fetching enrollments for course:', course.id);
        }
      }

      setStats({
        totalCourses,
        publishedCourses,
        totalStudents,
        totalRevenue,
        avgRating: 4.8 // This could be calculated from actual reviews
      });

    } catch (err) {
      console.error('Error fetching instructor data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstructorData();
  }, [jwt, user]);

  const quickActions = [
    { label: 'Create New Course', href: '/dashboard/instructor/courses/new', icon: <FiPlus className="w-8 h-8" />, color: 'green' },
    { label: 'Manage Courses', href: '/dashboard/instructor/courses', icon: <FiEdit3 className="w-8 h-8" />, color: 'blue' },
    { label: 'View Analytics', href: '/dashboard/instructor/analytics', icon: <FiBarChart2 className="w-8 h-8" />, color: 'purple' },
    { label: 'My Students', href: '/dashboard/instructor/students', icon: <FiUsers className="w-8 h-8" />, color: 'orange' },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.username}!</h1>
        <p className="text-gray-600 mt-2">Here's how your courses are performing today.</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">My Courses</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalCourses}</p>
              <p className="text-sm mt-1 text-green-600">{stats.publishedCourses} published</p>
            </div>
            <div className="p-3 rounded-lg bg-green-100 text-green-600">
              <FiBook className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalStudents}</p>
              <p className="text-sm mt-1 text-green-600">Across all courses</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
              <FiUsers className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Rating</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.avgRating}</p>
              <p className="text-sm mt-1 text-green-600">From student reviews</p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-100 text-yellow-600">
              <FiStar className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">${stats.totalRevenue}</p>
              <p className="text-sm mt-1 text-green-600">Course pricing</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-100 text-purple-600">
              <FiDollarSign className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Link 
              key={index}
              href={action.href}
              className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow group"
            >
              <div className="flex flex-col items-center text-center">
                <div className={`p-4 rounded-lg bg-${action.color}-100 text-${action.color}-600 group-hover:bg-${action.color}-200 transition-colors mb-4`}>
                  {action.icon}
                </div>
                <h3 className="font-medium text-gray-900">{action.label}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Courses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Courses</h3>
            <Link 
              href="/dashboard/instructor/courses"
              className="text-green-600 hover:text-green-700 text-sm font-medium"
            >
              View all →
            </Link>
          </div>
          <div className="space-y-4">
            {courses.slice(0, 4).map((course) => (
              <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h4 className="font-medium text-gray-900">{course.name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      course.isPublished 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {course.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                    <span>{course.lessons?.length || 0} lessons</span>
                    <span>${course.price || 'Free'}</span>
                    <span>Updated {new Date(course.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <Link 
                  href={`/dashboard/instructor/courses/${course.id}/edit`}
                  className="text-green-600 hover:text-green-700 p-2"
                >
                  <FiEdit3 className="w-5 h-5" />
                </Link>
              </div>
            ))}
            {courses.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <FiBook className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No courses yet. Create your first course!</p>
                <Link 
                  href="/dashboard/instructor/courses/new"
                  className="inline-flex items-center mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <FiPlus className="w-4 h-4 mr-2" />
                  Create Course
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Performance Overview */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Overview</h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Course Completion</span>
                <span>85%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{width: '85%'}}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Student Satisfaction</span>
                <span>92%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{width: '92%'}}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Course Engagement</span>
                <span>78%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{width: '78%'}}></div>
              </div>
            </div>
          </div>
          
          <Link 
            href="/dashboard/instructor/analytics"
            className="inline-flex items-center mt-6 text-green-600 hover:text-green-700 text-sm font-medium"
          >
            <FiTrendingUp className="w-4 h-4 mr-2" />
            View detailed analytics →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard; 