"use client";

import React, { useEffect, useState, useCallback } from 'react';
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

  const fetchInstructorData = useCallback(async () => {
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
            `${process.env.NEXT_PUBLIC_API_URL}/api/user-courses/findAll?filters[course][id][$eq]=${course.id}`,
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
  }, [jwt, user]);

  useEffect(() => {
    fetchInstructorData();
  }, [jwt, user, fetchInstructorData]);

  const getStatCardGradient = (color: string) => {
    const gradients = {
      green: 'from-green-500 to-green-600',
      blue: 'from-blue-500 to-blue-600',
      yellow: 'from-yellow-500 to-yellow-600',
      purple: 'from-purple-500 to-purple-600'
    };
    return gradients[color as keyof typeof gradients] || 'from-gray-500 to-gray-600';
  };

  const getActionCardGradient = (color: string) => {
    const gradients = {
      green: 'from-green-50 to-green-100 hover:from-green-100 hover:to-green-200',
      blue: 'from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200',
      purple: 'from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200',
      orange: 'from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200'
    };
    return gradients[color as keyof typeof gradients] || 'from-gray-50 to-gray-100';
  };

  const getIconGradient = (color: string) => {
    const gradients = {
      green: 'from-green-500 to-green-600',
      blue: 'from-blue-500 to-blue-600',
      purple: 'from-purple-500 to-purple-600',
      orange: 'from-orange-500 to-orange-600'
    };
    return gradients[color as keyof typeof gradients] || 'from-gray-500 to-gray-600';
  };

  const quickActions = [
    { label: 'Tạo khóa học mới', href: '/dashboard/instructor/courses/new', icon: <FiPlus className="w-8 h-8" />, color: 'green' },
    { label: 'Quản lý khóa học', href: '/dashboard/instructor/courses', icon: <FiEdit3 className="w-8 h-8" />, color: 'blue' },
    { label: 'Xem thống kê', href: '/dashboard/instructor/analytics', icon: <FiBarChart2 className="w-8 h-8" />, color: 'purple' },
    { label: 'Học viên', href: '/dashboard/instructor/students', icon: <FiUsers className="w-8 h-8" />, color: 'orange' },
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
        <h1 className="text-3xl font-bold text-gray-900">Chào mừng bạn trở lại, {user?.username}!</h1>
        <p className="text-gray-600 mt-2">Đây là cách khóa học của bạn đang hoạt động hôm nay.</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="relative bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 overflow-hidden group">
          {/* Background gradient overlay */}
          <div className={`absolute inset-0 bg-gradient-to-br ${getStatCardGradient('green')} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
          
          <div className="relative p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Khóa học của tôi</p>
                <p className="text-3xl font-bold text-gray-900 mb-2">{stats.totalCourses}</p>
                <div className="flex items-center">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {stats.publishedCourses} đã xuất bản
                  </span>
                </div>
              </div>
              <div className={`p-4 rounded-xl bg-gradient-to-br ${getStatCardGradient('green')} shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                <div className="text-white">
                  <FiBook className="w-6 h-6" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Bottom accent line */}
          <div className={`h-1 bg-gradient-to-r ${getStatCardGradient('green')}`}></div>
        </div>

        <div className="relative bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 overflow-hidden group">
          {/* Background gradient overlay */}
          <div className={`absolute inset-0 bg-gradient-to-br ${getStatCardGradient('blue')} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
          
          <div className="relative p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Tổng số học viên</p>
                <p className="text-3xl font-bold text-gray-900 mb-2">{stats.totalStudents}</p>
                <div className="flex items-center">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Tham gia khóa
                  </span>
                </div>
              </div>
              <div className={`p-4 rounded-xl bg-gradient-to-br ${getStatCardGradient('blue')} shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                <div className="text-white">
                  <FiUsers className="w-6 h-6" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Bottom accent line */}
          <div className={`h-1 bg-gradient-to-r ${getStatCardGradient('blue')}`}></div>
        </div>

        <div className="relative bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 overflow-hidden group">
          {/* Background gradient overlay */}
          <div className={`absolute inset-0 bg-gradient-to-br ${getStatCardGradient('yellow')} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
          
          <div className="relative p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Trung bình đánh giá</p>
                <p className="text-3xl font-bold text-gray-900 mb-2">{stats.avgRating}</p>
                <div className="flex items-center">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Đánh giá
                  </span>
                </div>
              </div>
              <div className={`p-4 rounded-xl bg-gradient-to-br ${getStatCardGradient('yellow')} shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                <div className="text-white">
                  <FiStar className="w-6 h-6" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Bottom accent line */}
          <div className={`h-1 bg-gradient-to-r ${getStatCardGradient('yellow')}`}></div>
        </div>

        <div className="relative bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 overflow-hidden group">
          {/* Background gradient overlay */}
          <div className={`absolute inset-0 bg-gradient-to-br ${getStatCardGradient('purple')} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
          
          <div className="relative p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Tổng doanh thu</p>
                <p className="text-3xl font-bold text-gray-900 mb-2">${stats.totalRevenue}</p>
                <div className="flex items-center">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Giá khóa học
                  </span>
                </div>
              </div>
              <div className={`p-4 rounded-xl bg-gradient-to-br ${getStatCardGradient('purple')} shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                <div className="text-white">
                  <FiDollarSign className="w-6 h-6" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Bottom accent line */}
          <div className={`h-1 bg-gradient-to-r ${getStatCardGradient('purple')}`}></div>
        </div>
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

      {/* Recent Courses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Khóa học gần đây</h3>
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
                <p>Không có khóa học nào. Tạo khóa học đầu tiên của bạn!</p>
                <Link 
                  href="/dashboard/instructor/courses/new"
                  className="inline-flex items-center mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <FiPlus className="w-4 h-4 mr-2" />
                  Tạo khóa học
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Performance Overview */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tổng quan hiệu suất</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Hoàn thành khóa học</span>
                <span>85%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{width: '85%'}}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Sự hài lòng của học viên</span>
                <span>92%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{width: '92%'}}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Sự tương tác của học viên</span>
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
            Xem chi tiết thống kê →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard; 