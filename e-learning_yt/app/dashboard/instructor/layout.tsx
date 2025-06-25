"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { useAuth } from '@/hooks/useAuth';
import { 
  FiHome, 
  FiBook, 
  FiSettings, 
  FiBarChart2, 
  FiMessageCircle,
  FiLogOut,
  FiUser,
  FiEdit3,
  FiVideo,
  FiUsers,
  FiStar,
  FiCalendar
} from 'react-icons/fi';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  href: string;
}

const instructorNavigation: NavItem[] = [
  { label: 'Dashboard', icon: <FiHome className="w-5 h-5" />, href: '/dashboard/instructor' },
  { label: 'Khóa học của tôi', icon: <FiBook className="w-5 h-5" />, href: '/dashboard/instructor/courses' },
  { label: 'Tạo khóa học', icon: <FiEdit3 className="w-5 h-5" />, href: '/dashboard/instructor/courses/new' },
  { label: 'Học viên', icon: <FiUsers className="w-5 h-5" />, href: '/dashboard/instructor/students' },
  { label: 'Thống kê', icon: <FiBarChart2 className="w-5 h-5" />, href: '/dashboard/instructor/analytics' },
  { label: 'Đánh giá & Nhận xét', icon: <FiStar className="w-5 h-5" />, href: '/dashboard/instructor/reviews' },
  { label: 'Tin nhắn', icon: <FiMessageCircle className="w-5 h-5" />, href: '/dashboard/instructor/messages' },
];

const InstructorLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userRole = Cookies.get('userRole');
    
    console.log('Instructor Layout - User role:', userRole);
    
    if (!userRole) {
      console.log('No user role found, redirecting to login');
      router.push('/login');
      return;
    }
    
    if (userRole !== 'instructor') {
      console.log('User role is not instructor:', userRole, 'redirecting to login');
      router.push('/login');
      return;
    }
    
    console.log('User role is instructor, setting loading to false');
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-[66px] bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 min-h-screen bg-white shadow-lg border-r">
          {/* User Profile Section */}
          <div className="px-6 flex items-center justify-start max-h-[90px] h-[90px] border-b bg-gradient-to-r from-green-600 to-teal-600">
            <div className="flex items-center space-x-3">
              <div className="relative w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <FiEdit3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-white">{user?.username || 'Instructor'}</p>
                <p className="text-sm text-green-100">Course Instructor</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-4">
            <div className="space-y-1">
              {instructorNavigation.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    pathname === item.href
                      ? 'bg-green-50 text-green-600 border-r-2 border-green-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </div>
          </nav>

          {/* Quick Stats */}
          <div className="p-4 border-t border-gray-200 mt-4">
            <div className="bg-gradient-to-r from-green-50 to-teal-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Quick Stats</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Courses</span>
                  <span className="font-medium text-green-600">12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Students</span>
                  <span className="font-medium text-green-600">324</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Rating</span>
                  <span className="font-medium text-green-600">4.8 ⭐</span>
                </div>
              </div>
            </div>
          </div>

          {/* Logout Section */}
          <div className="absolute bottom-0 w-64 p-4 border-t bg-gray-50">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg w-full transition-colors"
            >
              <FiLogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <header className="bg-white shadow-sm border-b px-6 py-4 max-h-[90px]">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Instructor Dashboard</h1>
                <p className="text-gray-600 mt-1">Create and manage your courses</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  Instructor
                </div>
                <Link
                  href="/dashboard/instructor/courses/new"
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  + New Course
                </Link>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default InstructorLayout; 