"use client";

import React from 'react';
import Link from 'next/link';
import { 
  FiBook, 
  FiPlay, 
  FiStar, 
  FiClock,
  FiAward,
  FiTrendingUp,
  FiBookmark,
  FiCalendar,
  FiTarget
} from 'react-icons/fi';

const UserDashboard = () => {
  const stats = [
    { label: 'Enrolled Courses', value: '8', icon: <FiBook className="w-6 h-6" />, color: 'purple', change: '+2 this month' },
    { label: 'Completed Courses', value: '6', icon: <FiAward className="w-6 h-6" />, color: 'green', change: '+1 this week' },
    { label: 'Study Hours', value: '142h', icon: <FiClock className="w-6 h-6" />, color: 'blue', change: '+12h this week' },
    { label: 'Certificates Earned', value: '5', icon: <FiStar className="w-6 h-6" />, color: 'yellow', change: '+1 this month' },
  ];

  const quickActions = [
    { label: 'Browse Courses', href: '/courses', icon: <FiTrendingUp className="w-8 h-8" />, color: 'purple' },
    { label: 'My Courses', href: '/dashboard/user/courses', icon: <FiBook className="w-8 h-8" />, color: 'blue' },
    { label: 'Study Progress', href: '/dashboard/user/progress', icon: <FiTarget className="w-8 h-8" />, color: 'green' },
    { label: 'Certificates', href: '/dashboard/user/certificates', icon: <FiAward className="w-8 h-8" />, color: 'yellow' },
  ];

  const currentCourses = [
    { title: 'React Fundamentals', progress: 75, nextLesson: 'State Management', timeLeft: '2h 30m', instructor: 'Sarah Wilson' },
    { title: 'JavaScript Advanced', progress: 45, nextLesson: 'Async/Await', timeLeft: '4h 15m', instructor: 'John Smith' },
    { title: 'CSS Grid & Flexbox', progress: 90, nextLesson: 'Final Project', timeLeft: '1h 20m', instructor: 'Emily Davis' },
  ];

  const recommendedCourses = [
    { title: 'Node.js Backend Development', rating: 4.8, students: '2.3k', price: '$49', instructor: 'Mike Johnson' },
    { title: 'TypeScript Fundamentals', rating: 4.7, students: '1.8k', price: '$39', instructor: 'Lisa Chen' },
    { title: 'Vue.js Complete Guide', rating: 4.9, students: '3.1k', price: '$59', instructor: 'David Brown' },
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, Student!</h1>
        <p className="text-gray-600 mt-2">Continue your learning journey and achieve your goals.</p>
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

      {/* Current Courses & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Continue Learning */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Continue Learning</h3>
            <Link 
              href="/dashboard/user/courses"
              className="text-purple-600 hover:text-purple-700 text-sm font-medium"
            >
              View all →
            </Link>
          </div>
          <div className="space-y-4">
            {currentCourses.map((course, index) => (
              <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900">{course.title}</h4>
                    <p className="text-sm text-gray-500">by {course.instructor}</p>
                  </div>
                  <span className="text-sm text-purple-600 font-medium">{course.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                  <div 
                    className="bg-purple-600 h-2 rounded-full" 
                    style={{width: `${course.progress}%`}}
                  ></div>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Next: {course.nextLesson}</span>
                  <span className="text-gray-500 flex items-center">
                    <FiClock className="w-4 h-4 mr-1" />
                    {course.timeLeft}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Courses */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recommended for You</h3>
            <Link 
              href="/courses"
              className="text-purple-600 hover:text-purple-700 text-sm font-medium"
            >
              Browse all →
            </Link>
          </div>
          <div className="space-y-4">
            {recommendedCourses.map((course, index) => (
              <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-900">{course.title}</h4>
                  <span className="text-lg font-bold text-purple-600">{course.price}</span>
                </div>
                <p className="text-sm text-gray-500 mb-3">by {course.instructor}</p>
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center text-yellow-500">
                      <FiStar className="w-4 h-4 mr-1" />
                      {course.rating}
                    </span>
                    <span className="text-gray-500">{course.students} students</span>
                  </div>
                  <Link
                    href={`/courses/${index + 1}`}
                    className="text-purple-600 hover:text-purple-700 font-medium"
                  >
                    View Course
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Learning Goal */}
      <div className="mt-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold mb-2">Keep up the great work!</h3>
            <p className="text-purple-100">You are 75% towards your monthly learning goal of 20 hours.</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">15h</p>
            <p className="text-purple-100">of 20h goal</p>
          </div>
        </div>
        <div className="w-full bg-purple-400 rounded-full h-3 mt-4">
          <div className="bg-white h-3 rounded-full" style={{width: '75%'}}></div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard; 