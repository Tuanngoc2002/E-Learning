"use client";

import React, { useState, useEffect } from 'react';
import { FiUsers, FiBook, FiDollarSign, FiTrendingUp, FiUserPlus, FiBookOpen, FiAlertCircle, FiSettings, FiBarChart2, FiShield, FiDatabase, FiActivity } from 'react-icons/fi';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

interface User {
  id: number;
  name: string;
  role: string;
  joined: string;
  status: 'Active' | 'Pending' | 'Suspended';
}

interface Course {
  id: number;
  name: string;
  descriptions: string;
  difficulty: string;
  price: number | null;
  isPublished: boolean;
  attributes: {
    studentCount: number;
  };
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

interface EnrollmentStats {
  userId: number;
  username: string;
  email: string;
  enrolledCourses: number;
  totalSpent: number;
  lastEnrollment: string;
}

const AdminDashboard = () => {
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollmentStats, setEnrollmentStats] = useState<EnrollmentStats[]>([]);
  const [globalStats, setGlobalStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    totalRevenue: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { jwt } = useAuth();

  const stats = [
    { label: 'Total Users', value: globalStats.totalUsers.toString(), icon: <FiUsers className="w-6 h-6" />, color: 'blue', change: '+12%' },
    { label: 'Total Courses', value: globalStats.totalCourses.toString(), icon: <FiBook className="w-6 h-6" />, color: 'green', change: '+8%' },
    { label: 'Total Enrollments', value: globalStats.totalEnrollments.toString(), icon: <FiBookOpen className="w-6 h-6" />, color: 'purple', change: '+15%' },
    { label: 'Total Revenue', value: `$${globalStats.totalRevenue}`, icon: <FiDollarSign className="w-6 h-6" />, color: 'orange', change: '+23%' },
  ];

  const quickActions = [
    { label: 'Quản lý người dùng', href: '/dashboard/admin/users', icon: <FiUsers className="w-8 h-8" />, color: 'blue' },
    { label: 'Quản lý khóa học', href: '/dashboard/admin/courses', icon: <FiBook className="w-8 h-8" />, color: 'green' },
    { label: 'Phân tích đăng ký', href: '/dashboard/admin/enrollments', icon: <FiBarChart2 className="w-8 h-8" />, color: 'purple' },
    { label: 'Cài đặt hệ thống', href: '/dashboard/admin/settings', icon: <FiShield className="w-8 h-8" />, color: 'orange' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch users
        const usersResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwt}`
          }
        });

        if (!usersResponse.ok) {
          throw new Error('Failed to fetch users');
        }

        const usersData = await usersResponse.json();
        const formattedUsers = usersData.map((user: any) => ({
          id: user.id,
          name: user.username || user.email,
          role: user.provider === 'local' ? 'User' : user.provider,
          joined: new Date(user.createdAt).toISOString().split('T')[0],
          status: user.blocked ? 'Suspended' : user.confirmed ? 'Active' : 'Pending'
        }));

        setRecentUsers(formattedUsers);

        // Fetch courses
        const coursesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/courses`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwt}`
          }
        });

        if (!coursesResponse.ok) {
          throw new Error('Failed to fetch courses');
        }

        const { data: coursesData } = await coursesResponse.json();
        setCourses(coursesData);

        // Fetch enrollments for each user
        const enrollmentsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user-courses/findAll?populate[0]=user&populate[1]=course`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwt}`
          }
        });

        if (enrollmentsResponse.ok) {
          const enrollmentsData = await enrollmentsResponse.json();
          const enrollments = enrollmentsData.data || [];

          // Group enrollments by user
          const enrollmentMap = new Map<number, EnrollmentStats>();
          let totalRevenue = 0;

          enrollments.forEach((enrollment: any) => {
            if (!enrollment.user) return;

            const userId = enrollment.user.id;
            const coursePrice = enrollment.course?.price || 0;
            totalRevenue += coursePrice;

            if (!enrollmentMap.has(userId)) {
              enrollmentMap.set(userId, {
                userId,
                username: enrollment.user.username || enrollment.user.email,
                email: enrollment.user.email,
                enrolledCourses: 0,
                totalSpent: 0,
                lastEnrollment: enrollment.enrollmentDate || enrollment.createdAt
              });
            }

            const userStats = enrollmentMap.get(userId)!;
            userStats.enrolledCourses += 1;
            userStats.totalSpent += coursePrice;

            // Update last enrollment date if this is more recent
            const currentDate = new Date(enrollment.enrollmentDate || enrollment.createdAt);
            const lastDate = new Date(userStats.lastEnrollment);
            if (currentDate > lastDate) {
              userStats.lastEnrollment = enrollment.enrollmentDate || enrollment.createdAt;
            }
          });

          const enrollmentStatsArray = Array.from(enrollmentMap.values())
            .sort((a, b) => b.totalSpent - a.totalSpent) // Sort by total spent
            .slice(0, 10); // Top 10 users

          setEnrollmentStats(enrollmentStatsArray);

          setGlobalStats({
            totalUsers: usersData.length,
            totalCourses: coursesData.length,
            totalEnrollments: enrollments.length,
            totalRevenue: Math.round(totalRevenue)
          });
        }

        setError(null);
      } catch (err) {
        setError('Failed to load data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    if (jwt) {
      fetchData();
    }
  }, [jwt]);

  const handleStatusChange = async (userId: number, newStatus: User['status']) => {
    try {
      const blocked = newStatus === 'Suspended';
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`
        },
        body: JSON.stringify({ blocked })
      });

      if (!response.ok) {
        throw new Error('Failed to update user status');
      }

      setRecentUsers(users =>
        users.map(user =>
          user.id === userId ? { ...user, status: newStatus } : user
        )
      );
    } catch (err) {
      console.error('Error updating user status:', err);
    }
  };

  const handleCourseVisibility = async (courseId: number, isPublished: boolean) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/courses/${courseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`
        },
        body: JSON.stringify({
          data: { isPublished }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update course visibility');
      }

      setCourses(courses =>
        courses.map(course =>
          course.id === courseId ? { ...course, isPublished } : course
        )
      );
    } catch (err) {
      console.error('Error updating course visibility:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="relative w-12 h-12 rounded-full overflow-hidden mr-4">
                <Image
                  src="/admin-avatar.jpg"
                  alt="Admin Avatar"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Bảng điều khiển quản trị viên</h1>
                <h2 className="text-gray-600 font-bold">Chào mừng trở lại, Admin</h2>
                <p className="text-gray-600 mt-2">Đây là những gì đang xảy ra với nền tảng học tập kĩ thuật số của bạn hôm nay.</p>
              </div>
            </div>
            <button className="p-2 text-gray-600 hover:text-gray-900">
              <FiSettings className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className={`text-sm mt-1 ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change} từ tháng trước
                  </p>
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
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Hành động nhanh</h2>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Users */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Người dùng gần đây</h2>
              <Link href="/dashboard/admin/users" className="text-blue-600 hover:text-blue-800">
                Xem tất cả
              </Link>
            </div>
            {isLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : error ? (
              <div className="text-red-600 text-center p-4">
                {error}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3">Tên</th>
                      <th className="text-left py-3">Vai trò</th>
                      <th className="text-left py-3">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentUsers.slice(0, 5).map((user) => (
                      <tr key={user.id} className="border-b">
                        <td className="py-3 text-sm">{user.name}</td>
                        <td className="py-3 text-sm">{user.role}</td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${user.status === "Active" ? "bg-green-100 text-green-800" :
                              user.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                                "bg-red-100 text-red-800"
                            }`}>
                            {user.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Top Student Enrollments */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Đăng ký học viên</h2>
              <Link href="/dashboard/admin/enrollments" className="text-blue-600 hover:text-blue-800">
                Xem tất cả
              </Link>
            </div>
            <div className="space-y-4">
              {enrollmentStats.slice(0, 5).map((student) => (
                <div key={student.userId} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{student.username}</div>
                    <div className="text-sm text-gray-500">{student.enrolledCourses} khóa học</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-green-600">${student.totalSpent}</div>
                    <div className="text-xs text-gray-500">Tổng thanh toán</div>
                  </div>
                </div>
              ))}
              {enrollmentStats.length === 0 && !isLoading && (
                <div className="text-center text-gray-500 py-4">
                  Không có dữ liệu đăng ký
                </div>
              )}
            </div>
          </div>

          {/* Recent Courses */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Khóa học gần đây</h2>
              <Link href="/dashboard/admin/courses" className="text-blue-600 hover:text-blue-800">
                Xem tất cả
              </Link>
            </div>
            <div className="space-y-4">
              {courses.slice(0, 5).map((course) => (
                <div key={course.id} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900 text-sm">{course.name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${course.isPublished
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                      }`}>
                      {course.isPublished ? 'Xuất bản' : 'Nháp'}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>${course.price || 0}</span>
                    <span>{course.difficulty}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity & System Health */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Hoạt động gần đây</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Người dùng mới đã đăng ký</p>
                  <p className="text-xs text-gray-500">john.doe@example.com - 5 phút trước</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Khóa học &quot;React Basics&quot; đã được xuất bản</p>
                  <p className="text-xs text-gray-500">bởi Sarah Wilson - 1 giờ trước</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Thanh toán đã nhận</p>
                  <p className="text-xs text-gray-500">${Math.floor(Math.random() * 200) + 50} phí đăng ký - 2 giờ trước</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Đơn đăng ký giáo viên</p>
                  <p className="text-xs text-gray-500">Mike Johnson đã đăng ký - 3 giờ trước</p>
                </div>
              </div>
            </div>
            <Link
              href="/dashboard/admin/audit"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-4 inline-block"
            >
              Xem tất cả hoạt động →
            </Link>
          </div>

          {/* System Health */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tình trạng hệ thống</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Trạng thái máy chủ</span>
                <span className="flex items-center text-green-600 text-sm font-medium">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Online
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Cơ sở dữ liệu</span>
                <span className="flex items-center text-green-600 text-sm font-medium">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Healthy
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Tổng đăng ký</span>
                <span className="text-sm font-medium text-gray-900">{globalStats.totalEnrollments}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Doanh thu tạo ra</span>
                <span className="text-sm font-medium text-gray-900">${globalStats.totalRevenue}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Người dùng hoạt động</span>
                <span className="text-sm font-medium text-gray-900">{globalStats.totalUsers} total</span>
              </div>
            </div>
            <Link
              href="/dashboard/admin/performance"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-4 inline-block"
            >
              Xem chi tiết hiệu suất →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard; 