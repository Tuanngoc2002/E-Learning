"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Cookies from 'js-cookie';
import { 
  FiHome, 
  FiBook, 
  FiUsers, 
  FiSettings, 
  FiBarChart2, 
  FiMessageCircle,
  FiLogOut,
  FiUser
} from 'react-icons/fi';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  href: string;
  roles: string[];
}

const navigation: NavItem[] = [
  { label: 'Dashboard', icon: <FiHome className="w-6 h-6" />, href: '/dashboard', roles: ['admin', 'instructor', 'user'] },
  { label: 'Courses', icon: <FiBook className="w-6 h-6" />, href: '/dashboard/courses', roles: ['admin', 'instructor', 'user'] },
  { label: 'Users', icon: <FiUsers className="w-6 h-6" />, href: '/dashboard/users', roles: ['admin'] },
  { label: 'Analytics', icon: <FiBarChart2 className="w-6 h-6" />, href: '/dashboard/analytics', roles: ['admin', 'instructor'] },
  { label: 'Messages', icon: <FiMessageCircle className="w-6 h-6" />, href: '/dashboard/messages', roles: ['admin', 'instructor', 'user'] },
  { label: 'Settings', icon: <FiSettings className="w-6 h-6" />, href: '/dashboard/settings', roles: ['admin', 'instructor', 'user'] },
];

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<string>('');
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    const role = Cookies.get('userRole');
    if (!role) {
      router.push('/login');
      return;
    }
    setUserRole(role);

    // Set mock user name based on role
    switch (role) {
      case 'admin':
        setUserName('Admin User');
        break;
      case 'instructor':
        setUserName('Professor Smith');
        break;
      case 'user':
        setUserName('Alex Student');
        break;
    }
  }, [router]);

  const handleLogout = () => {
    Cookies.remove('userRole');
    Cookies.remove('isAuthenticated');
    router.push('/login');
  };

  const filteredNavigation = navigation.filter(item => item.roles.includes(userRole));

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="pt-[12vh]">
        <div className="flex">
          <div className="w-64 min-h-screen bg-white shadow-lg">
            <div className="p-4 border-b">
              <div className="flex items-center space-x-3">
                <div className="relative w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <FiUser className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{userName}</p>
                  <p className="text-sm text-gray-500 capitalize">{userRole}</p>
                </div>
              </div>
            </div>

            <nav className="p-4">
              {filteredNavigation.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-2 rounded-lg mb-1 transition-colors ${
                    pathname === item.href
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>

            <div className="p-4 border-t">
              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg w-full transition-colors"
              >
                <FiLogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>

          <div className="flex-1 p-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout; 