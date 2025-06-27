"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { useAuth } from '@/hooks/useAuth';
import { 
  FiHome, 
  FiBook, 
  FiUsers, 
  FiSettings, 
  FiBarChart2, 
  FiMessageCircle,
  FiLogOut,
  FiUser,
  FiShield,
  FiDatabase,
  FiTrendingUp,
  FiActivity
} from 'react-icons/fi';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  href: string;
}

const adminNavigation: NavItem[] = [
  { label: 'Bảng điều khiển', icon: <FiHome className="w-5 h-5" />, href: '/dashboard/admin' },
  { label: 'Quản lý người dùng', icon: <FiUsers className="w-5 h-5" />, href: '/dashboard/admin/users' },
  { label: 'Quản lý khóa học', icon: <FiBook className="w-5 h-5" />, href: '/dashboard/admin/courses' },
  { label: 'Phân tích đăng ký', icon: <FiBarChart2 className="w-5 h-5" />, href: '/dashboard/admin/enrollments' },
  { label: 'Thống kê', icon: <FiBarChart2 className="w-5 h-5" />, href: '/dashboard/admin/analytics' },
];

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userRole = Cookies.get('userRole');
    
    if (!userRole || userRole !== 'admin') {
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  } 

  return (
    <div className="min-h-screen pt-[66px] bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div 
          className="w-64 shadow-lg border-r sticky top-[66px] flex flex-col" 
          style={{ height: 'calc(100vh - 66px)' }}
        >
          {/* User Profile Section */}
          <div className="px-6 h-[90px] max-h-[90px] flex items-center justify-start border-b bg-gradient-to-r from-blue-600 to-purple-600 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="relative w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <FiShield className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-white">{user?.username || 'Admin'}</p>
                <p className="text-sm text-blue-100">System Administrator</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-4 flex-1">
            <div className="space-y-1">
              {adminNavigation.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    pathname === item.href
                      ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </div>
          </nav>

          {/* Logout Section */}
          <div className="p-4 border-t bg-gray-50 flex-shrink-0">
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
          <header className="bg-white shadow-sm border-b px-6 py-4 h-[90px] max-h-[90px]">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600 mt-1">Manage your e-learning platform</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  Administrator
                </div>
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

export default AdminLayout; 