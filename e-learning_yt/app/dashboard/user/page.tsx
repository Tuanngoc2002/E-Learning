"use client";

import React from 'react';
import { FiBook, FiClock, FiAward, FiBookmark, FiCalendar, FiPlay, FiDownload, FiMessageCircle } from 'react-icons/fi';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

const UserDashboard = () => {
  // Mock data
  const enrolledCourses = [
    {
      id: 1,
      title: "React Masterclass",
      instructor: "Sarah Wilson",
      progress: 75,
      nextLesson: "Advanced React Hooks",
      thumbnail: "/courses/react.jpg"
    },
    {
      id: 2,
      title: "Python for Beginners",
      instructor: "John Smith",
      progress: 45,
      nextLesson: "Working with Lists",
      thumbnail: "/courses/python.jpg"
    },
    {
      id: 3,
      title: "UI/UX Design Fundamentals",
      instructor: "Emily Brown",
      progress: 90,
      nextLesson: "Final Project",
      thumbnail: "/courses/uiux.jpg"
    }
  ];

  const upcomingLessons = [
    {
      id: 1,
      title: "Advanced React Hooks",
      course: "React Masterclass",
      date: "Today, 2:00 PM",
      duration: "1h 30m"
    },
    {
      id: 2,
      title: "Working with Lists",
      course: "Python for Beginners",
      date: "Tomorrow, 10:00 AM",
      duration: "1h"
    },
    {
      id: 3,
      title: "Final Project Review",
      course: "UI/UX Design Fundamentals",
      date: "Mar 25, 3:00 PM",
      duration: "2h"
    }
  ];

  const achievements = [
    { id: 1, title: "Quick Learner", description: "Completed first course", icon: "🚀" },
    { id: 2, title: "Dedicated Student", description: "7-day study streak", icon: "🔥" },
    { id: 3, title: "Top Performer", description: "Scored 95% in quiz", icon: "🏆" }
  ];
  const { user, jwt } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* User Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="relative w-12 h-12 rounded-full overflow-hidden mr-4">
                <Image
                  src="/user-avatar.jpg"
                  alt="User Avatar"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
                <p className="text-gray-600">Welcome back, {user?.username}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard/user/notifications"
                className="text-gray-600 hover:text-gray-900"
              >
                <span className="relative">
                  <FiMessageCircle className="w-6 h-6" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    3
                  </span>
                </span>
              </Link>
              <Link
                href="/dashboard/user/profile"
                className="text-blue-600 hover:text-blue-800"
              >
                Edit Profile
              </Link>
            </div>
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
                <p className="text-gray-600">Enrolled Courses</p>
                <h3 className="text-2xl font-bold">{enrolledCourses.length}</h3>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <FiClock className="w-8 h-8 text-green-600 mr-4" />
              <div>
                <p className="text-gray-600">Learning Hours</p>
                <h3 className="text-2xl font-bold">45</h3>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <FiAward className="w-8 h-8 text-yellow-600 mr-4" />
              <div>
                <p className="text-gray-600">Certificates</p>
                <h3 className="text-2xl font-bold">3</h3>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <FiBookmark className="w-8 h-8 text-purple-600 mr-4" />
              <div>
                <p className="text-gray-600">Saved Courses</p>
                <h3 className="text-2xl font-bold">12</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Link href="/courses" className="bg-blue-600 text-white p-6 rounded-lg shadow-md hover:bg-blue-700 transition">
            <FiBook className="w-8 h-8 mb-4" />
            <h3 className="font-semibold">Browse Courses</h3>
          </Link>
          <Link href="/dashboard/user/messages" className="bg-purple-600 text-white p-6 rounded-lg shadow-md hover:bg-purple-700 transition">
            <FiMessageCircle className="w-8 h-8 mb-4" />
            <h3 className="font-semibold">Student Messages</h3>
          </Link>
          <Link href="/dashboard/user/continue" className="bg-yellow-600 text-white p-6 rounded-lg shadow-md hover:bg-yellow-700 transition">
            <FiPlay className="w-8 h-8 mb-4" />
            <h3 className="font-semibold">Continue Learning</h3>
          </Link>
          <Link href="/dashboard/user/certificates" className="bg-purple-600 text-white p-6 rounded-lg shadow-md hover:bg-purple-700 transition">
            <FiDownload className="w-8 h-8 mb-4" />
            <h3 className="font-semibold">My Certificates</h3>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Current Courses */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">My Courses</h2>
              <Link href="/dashboard/user/courses" className="text-blue-600 hover:text-blue-800">
                View All
              </Link>
            </div>
            <div className="space-y-6">
              {enrolledCourses.map((course) => (
                <div key={course.id} className="flex space-x-4">
                  <div className="relative w-24 h-24 flex-shrink-0">
                    <Image
                      src={course.thumbnail}
                      alt={course.title}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-semibold mb-1">{course.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">Instructor: {course.instructor}</p>
                    <div className="mb-2">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{course.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">Next: {course.nextLesson}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Lessons */}
          <div className="space-y-8">
            {/* Schedule */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Upcoming Lessons</h2>
                <Link href="/dashboard/user/schedule" className="text-blue-600 hover:text-blue-800">
                  Full Schedule
                </Link>
              </div>
              <div className="space-y-4">
                {upcomingLessons.map((lesson) => (
                  <div key={lesson.id} className="flex items-center p-4 border rounded-lg">
                    <FiCalendar className="w-8 h-8 text-blue-600 mr-4" />
                    <div>
                      <h3 className="font-semibold">{lesson.title}</h3>
                      <p className="text-sm text-gray-600">{lesson.course}</p>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <span>{lesson.date}</span>
                        <span className="mx-2">•</span>
                        <span>{lesson.duration}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-6">Recent Achievements</h2>
              <div className="grid grid-cols-3 gap-4">
                {achievements.map((achievement) => (
                  <div key={achievement.id} className="text-center">
                    <div className="text-4xl mb-2">{achievement.icon}</div>
                    <h3 className="font-semibold text-sm mb-1">{achievement.title}</h3>
                    <p className="text-xs text-gray-600">{achievement.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserDashboard; 