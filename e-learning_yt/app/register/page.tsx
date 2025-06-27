"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiMail, FiLock, FiUser, FiBook, FiVideo, FiAward } from 'react-icons/fi';
import { toastSuccess, toastError, getVietnameseErrorMessage, getVietnameseSuccessMessage } from '@/lib/toast';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Validate form
    if (!formData.username) {
      toastError('Vui lòng nhập tên người dùng');
      setIsLoading(false);
      return;
    }

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

    if (formData.password.length < 6) {
      toastError('Mật khẩu phải có ít nhất 6 ký tự');
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toastError('Mật khẩu xác nhận không khớp');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/local/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Registration failed');
      }

      localStorage.setItem('token', data.jwt);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userRole', data.user.role?.name || 'user');
      localStorage.setItem('userName', data.user.username || data.user.email);
      toastSuccess(getVietnameseSuccessMessage('Registration successful'));
      
      router.push('/');
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
          <h1 className="text-4xl font-bold text-white mb-6">Tham gia Nền tảng E-Learning</h1>
          <p className="text-blue-100 text-lg mb-8">Bắt đầu hành trình học tập của bạn ngay hôm nay với các khóa học trực tuyến toàn diện.</p>
          
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

      {/* Right Panel - Registration Form */}
      <div className="md:w-1/2 px-8 py-12 flex items-center justify-center">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Tạo tài khoản của bạn</h2>
            <p className="text-gray-600">Tham gia cùng hàng nghìn học viên trên toàn thế giới</p>
          </div>
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Tên người dùng
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Tên người dùng"
                  value={formData.username}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Địa chỉ email
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
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Xác nhận mật khẩu
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
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
                    Đang tạo tài khoản...
                  </div>
                ) : (
                  'Tạo tài khoản'
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Đã có tài khoản?{' '}
              <Link 
                href="/login" 
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                Đăng nhập tại đây
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}