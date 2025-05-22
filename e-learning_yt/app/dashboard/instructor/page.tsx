"use client";

import React, { useEffect, useState } from 'react';
import { FiBook, FiUsers, FiDollarSign, FiStar, FiPlusCircle, FiEdit, FiBarChart2, FiMessageCircle, FiTrash2, FiEye, FiEyeOff } from 'react-icons/fi';
import Image from 'next/image';
import Link from 'next/link';
import { courseService } from '@/services/courseService';
import { Course } from '@/types/course';

const InstructorDashboard = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPublishedOnly, setShowPublishedOnly] = useState(false);
  const instructorId = 1; // This should come from your auth context/session

  const fetchCourses = async () => {
    try {
      const response = await courseService.getInstructorCourses(instructorId, 1, 10, showPublishedOnly);
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
      // toast.error('Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  const handlePublishToggle = async (courseId: number, currentStatus: boolean) => {
    try {
      // If currentStatus is true, we want to unpublish (delete)
      // If currentStatus is false, we want to publish
      await courseService.updateCoursePublishStatus(courseId, !currentStatus);
      // toast.success(`Course ${currentStatus ? 'unpublished' : 'published'} successfully`);
      fetchCourses(); // Refresh the course list
    } catch (error) {
      console.error('Error updating course status:', error);
      // toast.error('Failed to update course status');
    }
  };

  const togglePublishedFilter = () => {
    setShowPublishedOnly(!showPublishedOnly);
  };

  useEffect(() => {
    fetchCourses();
  }, [showPublishedOnly]);

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Instructor Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="relative w-12 h-12 rounded-full overflow-hidden mr-4">
                <Image
                  src="/instructor-avatar.jpg"
                  alt="Instructor Avatar"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Instructor Dashboard</h1>
                <p className="text-gray-600">Welcome back, Professor Smith</p>
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
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <FiBook className="w-8 h-8 text-blue-600 mr-4" />
              <div>
                <p className="text-gray-600">Total Courses</p>
                <h3 className="text-2xl font-bold">{courses.length}</h3>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <FiUsers className="w-8 h-8 text-green-600 mr-4" />
              <div>
                <p className="text-gray-600">Total Students</p>
                <h3 className="text-2xl font-bold">
                  {courses.reduce((total, course) => total + (course.attributes?.studentCount || 0), 0)}
                </h3>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <FiDollarSign className="w-8 h-8 text-yellow-600 mr-4" />
              <div>
                <p className="text-gray-600">Total Revenue</p>
                <h3 className="text-2xl font-bold">
                  ${courses.reduce((total, course) => total + (course.price || 0), 0).toFixed(2)}
                </h3>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <FiStar className="w-8 h-8 text-purple-600 mr-4" />
              <div>
                <p className="text-gray-600">Average Rating</p>
                <h3 className="text-2xl font-bold">
                  {courses.length > 0
                    ? (courses.reduce((total, course) => total + (course.attributes?.rating || 0), 0) / courses.length).toFixed(1)
                    : "N/A"}
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Link href="/dashboard/instructor/courses/new" className="bg-blue-600 text-white p-6 rounded-lg shadow-md hover:bg-blue-700 transition">
            <FiPlusCircle className="w-8 h-8 mb-4" />
            <h3 className="font-semibold">Create New Course</h3>
          </Link>
          <Link href="/dashboard/instructor/courses" className="bg-green-600 text-white p-6 rounded-lg shadow-md hover:bg-green-700 transition">
            <FiEdit className="w-8 h-8 mb-4" />
            <h3 className="font-semibold">Manage Courses</h3>
          </Link>
          <Link href="/dashboard/instructor/analytics" className="bg-yellow-600 text-white p-6 rounded-lg shadow-md hover:bg-yellow-700 transition">
            <FiBarChart2 className="w-8 h-8 mb-4" />
            <h3 className="font-semibold">View Analytics</h3>
          </Link>
          <Link href="/dashboard/instructor/messages" className="bg-purple-600 text-white p-6 rounded-lg shadow-md hover:bg-purple-700 transition">
            <FiMessageCircle className="w-8 h-8 mb-4" />
            <h3 className="font-semibold">Student Messages</h3>
          </Link>
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
                    {courses.map((course) => (
                      <tr key={course.id} className="border-b">
                        <td className="py-3">{course.name}</td>
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
      </main>
    </div>
  );
};

export default InstructorDashboard; 