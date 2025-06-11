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
  FiMessageCircle,
  FiLogOut,
  FiUser,
  FiPlay,
  FiBookmark,
  FiTrendingUp,
  FiCalendar,
  FiClock,
  FiAward
} from 'react-icons/fi';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  href: string;
}

const userNavigation: NavItem[] = [
  { label: 'Bảng điều khiển', icon: <FiHome className="w-5 h-5" />, href: '/dashboard/user' },
  { label: 'Khóa học của tôi', icon: <FiBook className="w-5 h-5" />, href: '/dashboard/user/courses' },
  { label: 'Khám phá khóa học', icon: <FiTrendingUp className="w-5 h-5" />, href: '/courses' },
  { label: 'Tiến trình học tập', icon: <FiPlay className="w-5 h-5" />, href: '/dashboard/user/progress' },
  { label: 'Chứng chỉ', icon: <FiAward className="w-5 h-5" />, href: '/dashboard/user/certificates' },
  { label: 'Tin nhắn', icon: <FiMessageCircle className="w-5 h-5" />, href: '/dashboard/user/messages' },
  { label: 'Hồ sơ cá nhân', icon: <FiUser className="w-5 h-5" />, href: '/dashboard/user/profile' },
];

const UserLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userRole = Cookies.get('userRole');
    
    if (!userRole || userRole !== 'user') {
      router.push('/login');
      return;
    }
    
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 min-h-screen bg-white shadow-lg border-r">
          {/* User Profile Section */}
          <div className="p-6 border-b bg-gradient-to-r from-purple-600 to-pink-600">
            <div className="flex items-center space-x-3">
              <div className="relative w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <FiUser className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-white">{user?.username || 'Student'}</p>
                <p className="text-sm text-purple-100">Learner</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-4">
            <div className="space-y-1">
              {userNavigation.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    pathname === item.href
                      ? 'bg-purple-50 text-purple-600 border-r-2 border-purple-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </div>
          </nav>

          {/* Learning Progress */}
          <div className="p-4 border-t border-gray-200 mt-4">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Learning Progress</h4>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-600">Courses Enrolled</span>
                    <span className="font-medium text-purple-600">8</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{width: '75%'}}></div>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Completed</span>
                  <span className="font-medium text-purple-600">6</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Study Hours</span>
                  <span className="font-medium text-purple-600">142h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Certificates</span>
                  <span className="font-medium text-purple-600">5</span>
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
          <header className="bg-white shadow-sm border-b px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Learning Dashboard</h1>
                <p className="text-gray-600 mt-1">Continue your learning journey</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                  Student
                </div>
                <Link
                  href="/courses"
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                >
                  Browse Courses
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

export default UserLayout; 