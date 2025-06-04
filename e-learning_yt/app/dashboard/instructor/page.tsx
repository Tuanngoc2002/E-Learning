"use client";

import React, { useEffect, useState } from 'react';
import { FiBook, FiUsers, FiDollarSign, FiStar, FiPlusCircle, FiEdit, FiBarChart2, FiMessageCircle, FiTrash2, FiEye, FiEyeOff } from 'react-icons/fi';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

interface Course {
  id: number;
  name: string;
  descriptions: string;
  difficulty: string;
  price: number | null;
  isPublished: boolean;
  attributes: {
    studentCount: number;
    rating?: number;
  };
  lessons?: any[];
  createdAt: string;
  updatedAt: string;
}

const InstructorDashboard = () => {
  const { jwt, user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPublishedOnly, setShowPublishedOnly] = useState(false);

  const fetchCourses = async () => {
    if (!jwt) return;
    
    try {
      let url = `${process.env.NEXT_PUBLIC_API_URL}/api/courses?populate=lessons&pagination[pageSize]=5`;
      
      if (showPublishedOnly) {
        url += '&filters[isPublished][$eq]=true';
      }
      
      // TODO: Add instructor filter when instructor field is available
      // url += `&filters[instructor][id][$eq]=${user?.id}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${jwt}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }

      const data = await response.json();
      const coursesWithStats = data.data.map((course: any) => ({
        ...course,
        attributes: {
          ...course.attributes,
          studentCount: course.attributes?.studentCount || Math.floor(Math.random() * 50),
          rating: course.attributes?.rating || (4 + Math.random()).toFixed(1)
        }
      }));
      
      setCourses(coursesWithStats);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePublishToggle = async (courseId: number, currentStatus: boolean) => {
    if (!jwt) return;
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/courses/${courseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          data: {
            isPublished: !currentStatus
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${currentStatus ? 'unpublish' : 'publish'} course`);
      }

      fetchCourses(); // Refresh the course list
    } catch (error) {
      console.error('Error updating course status:', error);
    }
  };

  const togglePublishedFilter = () => {
    setShowPublishedOnly(!showPublishedOnly);
  };

  useEffect(() => {
    fetchCourses();
  }, [showPublishedOnly, jwt]);

  // Mock data for reviews (you can replace this with real data later)
  const recentReviews = [
    {
      id: 1,
      student: "John Doe",
      course: "React Masterclass",
      rating: 5,
      comment: "Excellent course! Very well explained concepts.",
      date: "2024-03-20"
    },
    {
      id: 2,
      student: "Sarah Smith",
      course: "Web Development Bootcamp",
      rating: 4,
      comment: "Great content but could use more examples.",
      date: "2024-03-19"
    },
    {
      id: 3,
      student: "Mike Wilson",
      course: "React Masterclass",
      rating: 5,
      comment: "Best React course I've taken so far!",
      date: "2024-03-18"
    }
  ];

  const stats = [
    { label: 'My Courses', value: '12', icon: <FiBook className="w-6 h-6" />, color: 'green', change: '+2 this month' },
    { label: 'Total Students', value: '2,348', icon: <FiUsers className="w-6 h-6" />, color: 'blue', change: '+156 this month' },
    { label: 'Average Rating', value: '4.8', icon: <FiStar className="w-6 h-6" />, color: 'yellow', change: '+0.2 improvement' },
    { label: 'Total Earnings', value: '$12,450', icon: <FiDollarSign className="w-6 h-6" />, color: 'purple', change: '+$2,100 this month' },
  ];

  const quickActions = [
    { label: 'Create New Course', href: '/dashboard/instructor/courses/new', icon: <FiPlusCircle className="w-8 h-8" />, color: 'green' },
    { label: 'Manage Courses', href: '/dashboard/instructor/courses', icon: <FiEdit className="w-8 h-8" />, color: 'blue' },
    { label: 'View Analytics', href: '/dashboard/instructor/analytics', icon: <FiBarChart2 className="w-8 h-8" />, color: 'purple' },
    { label: 'Student Messages', href: '/dashboard/instructor/messages', icon: <FiMessageCircle className="w-8 h-8" />, color: 'orange' },
  ];

  const recentCourses = [
    { title: 'React Fundamentals', students: 234, rating: 4.9, status: 'Published', lastUpdated: '2 days ago' },
    { title: 'Advanced JavaScript', students: 189, rating: 4.7, status: 'Published', lastUpdated: '1 week ago' },
    { title: 'Node.js Backend', students: 156, rating: 4.8, status: 'Draft', lastUpdated: '3 days ago' },
    { title: 'TypeScript Basics', students: 98, rating: 4.6, status: 'Published', lastUpdated: '1 day ago' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Instructor Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="relative w-12 h-12 rounded-full overflow-hidden mr-4 bg-blue-500 flex items-center justify-center">
                <span className="text-white font-semibold">
                  {user?.username?.charAt(0).toUpperCase() || 'I'}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Instructor Dashboard</h1>
                <p className="text-gray-600">Welcome back, {user?.username || 'Instructor'}</p>
              </div>
            </div>
            <Link
              href="/dashboard/instructor/profile"
              className="text-blue-600 hover:text-blue-800"
            >
              Edit Profile
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, Instructor!</h1>
          <p className="text-gray-600 mt-2">Here's how your courses are performing today.</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className="text-sm mt-1 text-green-600">{stat.change}</p>
                </div>
                <div className={`p-3 rounded-lg bg-${stat.color}-100 text-${stat.color}-600`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* My Courses */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">My Courses</h2>
              <div className="flex items-center space-x-4">
                <button 
                  onClick={togglePublishedFilter}
                  className={`px-3 py-1 rounded-full text-xs ${
                    showPublishedOnly 
                      ? "bg-green-100 text-green-800" 
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {showPublishedOnly ? "Published Only" : "All Courses"}
                </button>
                <Link href="/dashboard/instructor/courses" className="text-blue-600 hover:text-blue-800">
                  View All
                </Link>
              </div>
            </div>
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3">Course</th>
                      <th className="text-left py-3">Students</th>
                      <th className="text-left py-3">Lessons</th>
                      <th className="text-left py-3">Price</th>
                      <th className="text-left py-3">Status</th>
                      <th className="text-left py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.slice(0, 5).map((course) => (
                      <tr key={course.id} className="border-b">
                        <td className="py-3">
                          <div className="font-medium">{course.name}</div>
                          <div className="text-sm text-gray-500 truncate max-w-32">{course.descriptions}</div>
                        </td>
                        <td className="py-3">{course.attributes?.studentCount || 0}</td>
                        <td className="py-3">{course.lessons?.length || 0}</td>
                        <td className="py-3">${course.price || 0}</td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            course.isPublished ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                          }`}>
                            {course.isPublished ? "Published" : "Draft"}
                          </span>
                        </td>
                        <td className="py-3">
                          <div className="flex space-x-2">
                            <Link
                              href={`/dashboard/instructor/courses/${course.id}/edit`}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <FiEdit className="w-5 h-5" />
                            </Link>
                            <button
                              onClick={() => handlePublishToggle(course.id, course.isPublished)}
                              className={`${
                                course.isPublished ? "text-yellow-600 hover:text-yellow-800" : "text-green-600 hover:text-green-800"
                              }`}
                              title={course.isPublished ? "Unpublish Course" : "Publish Course"}
                            >
                              {course.isPublished ? (
                                <FiEyeOff className="w-5 h-5" />
                              ) : (
                                <FiEye className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {courses.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No courses found. <Link href="/dashboard/instructor/courses/new" className="text-blue-600 hover:text-blue-800">Create your first course</Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Recent Reviews */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Recent Reviews</h2>
              <Link href="/dashboard/instructor/reviews" className="text-blue-600 hover:text-blue-800">
                View All
              </Link>
            </div>
            <div className="space-y-6">
              {recentReviews.map((review) => (
                <div key={review.id} className="border-b pb-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold">{review.student}</h3>
                      <p className="text-sm text-gray-600">{review.course}</p>
                    </div>
                    <div className="flex items-center">
                      <span className="text-yellow-400 mr-1">★</span>
                      <span>{review.rating}</span>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-2">{review.comment}</p>
                  <p className="text-sm text-gray-500">{review.date}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Courses & Student Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Courses */}
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
              {recentCourses.map((course, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h4 className="font-medium text-gray-900">{course.title}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        course.status === 'Published' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {course.status}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                      <span>{course.students} students</span>
                      <span className="flex items-center">
                        <FiStar className="w-4 h-4 text-yellow-400 mr-1" />
                        {course.rating}
                      </span>
                      <span>Updated {course.lastUpdated}</span>
                    </div>
                  </div>
                  <Link 
                    href={`/dashboard/instructor/courses/${index + 1}/edit`}
                    className="text-green-600 hover:text-green-700 p-2"
                  >
                    <FiEdit className="w-5 h-5" />
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Student Activity */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Student Activity</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Sarah completed "React Fundamentals"</p>
                  <p className="text-xs text-gray-500">5 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">John enrolled in "Advanced JavaScript"</p>
                  <p className="text-xs text-gray-500">1 hour ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">New review for "TypeScript Basics"</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Mike asked a question in course forum</p>
                  <p className="text-xs text-gray-500">3 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Emma completed quiz in "Node.js Backend"</p>
                  <p className="text-xs text-gray-500">4 hours ago</p>
                </div>
              </div>
            </div>
            <Link 
              href="/dashboard/instructor/students"
              className="text-green-600 hover:text-green-700 text-sm font-medium mt-4 inline-block"
            >
              View all activity →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default InstructorDashboard; 