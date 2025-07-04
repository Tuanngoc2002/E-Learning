"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { loginUser } from '@/lib/api';
import { getCurrentUser } from '@/services/server/getCurrentUser';
import { useAuth } from '@/hooks/useAuth';
import { determineUserRole, createRoleObject, mapRoleForRouting } from '@/lib/auth-utils';
import { FiMail, FiLock, FiBook, FiVideo, FiAward } from 'react-icons/fi';
import { toastSuccess, toastError, getVietnameseErrorMessage, getVietnameseSuccessMessage } from '@/lib/toast';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate form
    if (!formData.email) {
      toastError('Vui lòng nhập email');
      setIsLoading(false);
      return;
    }

    if (!formData.password) {
      toastError('Vui lòng nhập mật khẩu');
      setIsLoading(false);
      return;
    }

    try {
      const loginRes = await loginUser(formData.email, formData.password);
      const jwt = loginRes.jwt;
      const user = await getCurrentUser(jwt);
      if (!user) {
        throw new Error("User data is missing");
      }

      // Ensure user has role object
      if (!user.role) {
        const determinedRoleType = determineUserRole(user);
        user.role = createRoleObject(determinedRoleType);
      }

      // Extract role name safely
      const roleName = determineUserRole(user);
      const mappedRole = mapRoleForRouting(roleName);
      login(jwt, {
        id: user.id,
        username: user.username || user.email || '',
        email: user.email || '',
        role: mappedRole,
        organizationID: user.organizationID || ''
      });

      toastSuccess(getVietnameseSuccessMessage('Login successful'));

      if (mappedRole === 'user') {
        router.push('/dashboard/user');
      } else if (mappedRole === 'admin') {
        router.push('/dashboard/admin');
      } else if (mappedRole === 'instructor') {
        router.push('/dashboard/instructor');
      } else {
        router.push('/');
      }
    } catch (err: any) {
      const errorMessage = getVietnameseErrorMessage(err);
      toastError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen flex md:flex-row flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Left Panel - Decorative */}
      <div className="md:w-1/2 bg-gradient-to-br from-blue-600 to-purple-600 p-12 flex flex-col justify-between relative overflow-hidden hidden md:flex">
        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-white mb-6">Chào mừng đến với Nền tảng E-Learning</h1>
          <p className="text-blue-100 text-lg mb-8">Mở rộng kiến thức của bạn với các khóa học trực tuyến toàn diện.</p>
          
          <div className="space-y-4">
            <div className="flex items-center text-white">
              <div className="w-10 h-10 rounded-full bg-blue-500/30 flex items-center justify-center mr-4">
                <FiBook className="w-5 h-5" />
              </div>
              <span className="text-lg">Truy cập các khóa học cao cấp</span>
            </div>
            <div className="flex items-center text-white">
              <div className="w-10 h-10 rounded-full bg-blue-500/30 flex items-center justify-center mr-4">
                <FiVideo className="w-5 h-5" />
              </div>
              <span className="text-lg">Nội dung video chất lượng HD</span>
            </div>
            <div className="flex items-center text-white">
              <div className="w-10 h-10 rounded-full bg-blue-500/30 flex items-center justify-center mr-4">
                <FiAward className="w-5 h-5" />
              </div>
              <span className="text-lg">Chứng chỉ hoàn thành khóa học</span>
            </div>
          </div>
        </div>

        {/* Decorative circles */}
        <div className="absolute -bottom-32 -left-32 w-64 h-64 rounded-full bg-blue-500 opacity-20"></div>
        <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full bg-purple-500 opacity-20"></div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="md:w-1/2 px-8 py-12 flex items-center justify-center">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Chào mừng trở lại!</h2>
            <p className="text-gray-600">Tiếp tục hành trình học tập của bạn</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="ban@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Mật khẩu
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Ghi nhớ đăng nhập
                </label>
              </div>
              <Link href="/forgot-password" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                Quên mật khẩu?
              </Link>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-150 ease-in-out shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Đang đăng nhập...
                  </div>
                ) : (
                  'Đăng nhập'
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Chưa có tài khoản?{' '}
              <Link 
                href="/register" 
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                Đăng ký miễn phí
              </Link>
            </p>
          </div>

          <div className="mt-6">
            <h3 className="text-center text-sm font-medium text-gray-500">Tài khoản Demo:</h3>
            <div className="mt-2 text-sm text-gray-500">
              <p>Quản trị viên: admin@gmail.com / 123456</p>
              <p>Giảng viên: instructor1@gmail.com / 123456</p>
              <p>Học viên: student1@gmail.com / 123456</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 