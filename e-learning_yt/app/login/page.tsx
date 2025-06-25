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

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const loginRes = await loginUser(formData.email, formData.password);
      const jwt = loginRes.jwt;

      // Log the login response
      console.log("Login response:", loginRes);

      // Get user details with role
      const user = await getCurrentUser(jwt);

      // Log the user data
      console.log("User data:", user);

      // Ensure we have the role information
      if (!user) {
        throw new Error("User data is missing");
      }

      // Ensure user has role object
      if (!user.role) {
        console.log("No role found, creating role object based on user info...");
        const determinedRoleType = determineUserRole(user);
        user.role = createRoleObject(determinedRoleType);
        console.log("Created role:", user.role);
      }

      // Extract role name safely
      const roleName = determineUserRole(user);
      const mappedRole = mapRoleForRouting(roleName);

      console.log("Determined role name:", roleName);
      console.log("Mapped role for routing:", mappedRole);

      // Use the login function from useAuth hook
      login(jwt, {
        id: user.id,
        username: user.username || user.email || '',
        email: user.email || '',
        role: mappedRole,
        organizationID: user.organizationID || ''
      });

      // Redirect based on mapped role
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
      console.error("Login error:", err);
      setError(err?.message || 'Login failed');
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
          <h1 className="text-4xl font-bold text-white mb-6">Welcome to E-Learning Platform</h1>
          <p className="text-blue-100 text-lg mb-8">Expand your knowledge with our comprehensive online courses.</p>
          
          <div className="space-y-4">
            <div className="flex items-center text-white">
              <div className="w-10 h-10 rounded-full bg-blue-500/30 flex items-center justify-center mr-4">
                <FiBook className="w-5 h-5" />
              </div>
              <span className="text-lg">Access to premium courses</span>
            </div>
            <div className="flex items-center text-white">
              <div className="w-10 h-10 rounded-full bg-blue-500/30 flex items-center justify-center mr-4">
                <FiVideo className="w-5 h-5" />
              </div>
              <span className="text-lg">HD video content</span>
            </div>
            <div className="flex items-center text-white">
              <div className="w-10 h-10 rounded-full bg-blue-500/30 flex items-center justify-center mr-4">
                <FiAward className="w-5 h-5" />
              </div>
              <span className="text-lg">Certificates of completion</span>
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
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back!</h2>
            <p className="text-gray-600">Continue your learning journey</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
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
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
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
                  Remember me
                </label>
              </div>
              <Link href="/forgot-password" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                Forgot password?
              </Link>
            </div>

            {error && (
              <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-150 ease-in-out shadow-lg hover:shadow-xl"
              >
                Sign in
              </button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{' '}
              <Link 
                href="/register" 
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                Sign up for free
              </Link>
            </p>
          </div>

          <div className="mt-6">
            <h3 className="text-center text-sm font-medium text-gray-500">Demo Accounts:</h3>
            <div className="mt-2 text-sm text-gray-500">
              <p>Admin: admin@example.com / admin123</p>
              <p>Instructor: instructor@example.com / instructor123</p>
              <p>User: user@example.com / user123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 