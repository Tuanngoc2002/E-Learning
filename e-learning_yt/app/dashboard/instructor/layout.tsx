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
import Image from 'next/image';
import { toastSuccess, getVietnameseSuccessMessage } from '@/lib/toast';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  href: string;
}

const instructorNavigation: NavItem[] = [
  { label: 'Bảng điều khiển', icon: <FiHome className="w-5 h-5" />, href: '/dashboard/instructor' },
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
    if (!userRole) {
      router.push('/login');
      return;
    }

    if (userRole !== 'instructor') {
      router.push('/login');
      return;
    }
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    logout();
    toastSuccess(getVietnameseSuccessMessage('Logout successful'));
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
    <>
      <style jsx>
        {`
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #fff;
            border-radius: 0;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
           background: rgba(255, 255, 255, 0.1);
            border-radius: 0;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.1);
          }
        `}
      </style>
      <div className="min-h-screen pt-[66px] bg-gray-50">
        <div className="flex">
          {/* Sidebar */}
          <div
            className="w-64 bg-white shadow-lg border-r sticky top-[66px] flex flex-col"
            style={{ height: 'calc(100vh - 66px)' }}
          >
            {/* User Profile Section */}
            <div className="px-6 h-[90px] max-h-[90px] flex items-center justify-start border-b bg-gradient-to-r from-green-600 to-teal-600 flex-shrink-0">
              <div className="flex items-center space-x-3">
                <div className="relative w-14 h-14 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                  <Image src={'/images/instructor.webp'} alt="avatar" width={100} height={100} className='rounded-full h-full w-full object-cover' />
                </div>
                <div>
                  <p className="font-semibold text-white">{user?.username || 'Giảng viên'}</p>
                  <p className="text-sm text-green-100">Giảng viên khóa học</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="p-4 flex-1 overflow-y-auto custom-scrollbar">
              <div className="space-y-1">
                {instructorNavigation.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${pathname === item.href
                        ? 'bg-green-50 text-green-600 border-r-2 border-green-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                  >
                    {item.icon}
                    <span className="font-medium">{item.label}</span>
                  </Link>
                ))}
              </div>

              {/* Quick Stats */}
              <div className="border-t border-gray-200 mt-4 pt-4">
                <div className="bg-gradient-to-r from-green-50 to-teal-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Thống kê nhanh</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tổng khóa học</span>
                      <span className="font-medium text-green-600">12</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Học viên</span>
                      <span className="font-medium text-green-600">324</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Đánh giá</span>
                      <span className="font-medium text-green-600">4.8 ⭐</span>
                    </div>
                  </div>
                </div>
              </div>
            </nav>

            {/* Logout Section */}
            <div className="p-4 border-t bg-gray-50 flex-shrink-0">
              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg w-full transition-colors"
              >
                <FiLogOut className="w-5 h-5" />
                <span className="font-medium">Đăng xuất</span>
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Header */}
            <header className="bg-white shadow-sm border-b px-6 py-4 h-[90px] max-h-[90px]">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Bảng điều khiển Giảng viên</h1>
                  <p className="text-gray-600 mt-1">Tạo và quản lý các khóa học của bạn</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    Giảng viên
                  </div>
                  <Link
                    href="/dashboard/instructor/courses/new"
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    + Khóa học mới
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
    </>
  );
};

export default InstructorLayout; 