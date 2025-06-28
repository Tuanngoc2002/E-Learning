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
import { useAuth } from '@/hooks/useAuth';

const UserDashboard = () => {
  const stats = [
    { label: 'Enrolled Courses', value: '8', icon: <FiBook className="w-6 h-6" />, color: 'purple', change: '+2 this month' },
    { label: 'Completed Courses', value: '6', icon: <FiAward className="w-6 h-6" />, color: 'green', change: '+1 this week' },
    { label: 'Study Hours', value: '142h', icon: <FiClock className="w-6 h-6" />, color: 'blue', change: '+12h this week' },
    { label: 'Certificates Earned', value: '5', icon: <FiStar className="w-6 h-6" />, color: 'yellow', change: '+1 this month' },
  ];

  const quickActions = [
    { label: 'Xem khóa học', href: '/courses', icon: <FiTrendingUp className="w-8 h-8" />, color: 'purple' },
    { label: 'Khóa học của tôi', href: '/dashboard/user/courses', icon: <FiBook className="w-8 h-8" />, color: 'blue' },
    { label: 'Tiến trình học', href: '/dashboard/user/progress', icon: <FiTarget className="w-8 h-8" />, color: 'green' },
    { label: 'Chứng chỉ', href: '/dashboard/user/certificates', icon: <FiAward className="w-8 h-8" />, color: 'yellow' },
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
  const { user } = useAuth();

  const getStatCardGradient = (color: string) => {
    const gradients = {
      purple: 'from-purple-500 to-purple-600',
      green: 'from-green-500 to-green-600', 
      blue: 'from-blue-500 to-blue-600',
      yellow: 'from-yellow-500 to-yellow-600'
    };
    return gradients[color as keyof typeof gradients] || 'from-gray-500 to-gray-600';
  };

  const getActionCardGradient = (color: string) => {
    const gradients = {
      purple: 'from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200',
      blue: 'from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200',
      green: 'from-green-50 to-green-100 hover:from-green-100 hover:to-green-200',
      yellow: 'from-yellow-50 to-yellow-100 hover:from-yellow-100 hover:to-yellow-200'
    };
    return gradients[color as keyof typeof gradients] || 'from-gray-50 to-gray-100';
  };

  const getIconGradient = (color: string) => {
    const gradients = {
      purple: 'from-purple-500 to-purple-600',
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-green-600',
      yellow: 'from-yellow-500 to-yellow-600'
    };
    return gradients[color as keyof typeof gradients] || 'from-gray-500 to-gray-600';
  };

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Chào mừng, Học viên {user?.username}!</h1>
        <p className="text-gray-600 mt-2">Tiếp tục hành trình học tập của bạn và đạt được mục tiêu của bạn.</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="relative bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 overflow-hidden group">
            {/* Background gradient overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br ${getStatCardGradient(stat.color)} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
            
            <div className="relative p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</p>
                  <div className="flex items-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className={`p-4 rounded-xl bg-gradient-to-br ${getStatCardGradient(stat.color)} shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                  <div className="text-white">
                    {stat.icon}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Bottom accent line */}
            <div className={`h-1 bg-gradient-to-r ${getStatCardGradient(stat.color)}`}></div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Hành động nhanh</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => (
            <Link 
              key={index}
              href={action.href}
              className={`relative bg-gradient-to-br ${getActionCardGradient(action.color)} rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-white/50 overflow-hidden group`}
            >
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              
              <div className="relative p-8">
                <div className="flex flex-col items-center text-center">
                  <div className={`relative p-5 rounded-2xl bg-gradient-to-br ${getIconGradient(action.color)} shadow-lg mb-4 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                    <div className="text-white">
                      {action.icon}
                    </div>
                    {/* Icon glow effect */}
                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${getIconGradient(action.color)} blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300`}></div>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-lg group-hover:text-gray-700 transition-colors duration-300">{action.label}</h3>
                  
                  {/* Arrow indicator */}
                  <div className="mt-3 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    <div className={`w-8 h-0.5 bg-gradient-to-r ${getIconGradient(action.color)} rounded-full`}></div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Current Courses & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Continue Learning */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Tiếp tục học</h3>
            <Link 
              href="/dashboard/user/courses"
              className="text-purple-600 hover:text-purple-700 text-sm font-medium"
            >
              Xem tất cả →
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
            <h3 className="text-lg font-semibold text-gray-900">Khuyến nghị cho bạn</h3>
            <Link 
              href="/courses"
              className="text-purple-600 hover:text-purple-700 text-sm font-medium"
            >
              Xem tất cả →
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
                    <span className="text-gray-500">{course.students} học viên</span>
                  </div>
                  <Link
                    href={`/courses/${index + 1}`}
                    className="text-purple-600 hover:text-purple-700 font-medium"
                  >
                    Xem khóa học
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
            <h3 className="text-xl font-semibold mb-2">Tiếp tục làm tốt!</h3>
            <p className="text-purple-100">Bạn đã hoàn thành 75% của mục tiêu học tập hàng tháng của bạn.</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">15h</p>
            <p className="text-purple-100">trên 20h mục tiêu hàng tháng</p>
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