"use client";

import React, { useState, useEffect } from 'react';
import { FiUsers, FiBook, FiDollarSign, FiTrendingUp, FiUserPlus, FiBookOpen, FiAlertCircle, FiSettings } from 'react-icons/fi';
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

const AdminDashboard = () => {
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const {jwt} = useAuth();

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
        setError(null);
      } catch (err) {
        setError('Failed to load data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
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
        body: JSON.stringify({ isPublished })
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
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600">Welcome back, Admin</p>
              </div>
            </div>
            <button className="p-2 text-gray-600 hover:text-gray-900">
              <FiSettings className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <FiUsers className="w-8 h-8 text-blue-600 mr-4" />
              <div>
                <p className="text-gray-600">Total Users</p>
                <h3 className="text-2xl font-bold">1,234</h3>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <FiBook className="w-8 h-8 text-green-600 mr-4" />
              <div>
                <p className="text-gray-600">Total Courses</p>
                <h3 className="text-2xl font-bold">85</h3>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <FiDollarSign className="w-8 h-8 text-yellow-600 mr-4" />
              <div>
                <p className="text-gray-600">Total Revenue</p>
                <h3 className="text-2xl font-bold">$52,489</h3>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <FiTrendingUp className="w-8 h-8 text-purple-600 mr-4" />
              <div>
                <p className="text-gray-600">Monthly Growth</p>
                <h3 className="text-2xl font-bold">+12.5%</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Link href="/dashboard/admin/users/new" className="bg-blue-600 text-white p-6 rounded-lg shadow-md hover:bg-blue-700 transition">
            <FiUserPlus className="w-8 h-8 mb-4" />
            <h3 className="font-semibold">Add New User</h3>
          </Link>
          <Link href="/dashboard/admin/courses/new" className="bg-green-600 text-white p-6 rounded-lg shadow-md hover:bg-green-700 transition">
            <FiBookOpen className="w-8 h-8 mb-4" />
            <h3 className="font-semibold">Create Course</h3>
          </Link>
          <Link href="/dashboard/admin/reports" className="bg-yellow-600 text-white p-6 rounded-lg shadow-md hover:bg-yellow-700 transition">
            <FiTrendingUp className="w-8 h-8 mb-4" />
            <h3 className="font-semibold">View Reports</h3>
          </Link>
          <Link href="/dashboard/admin/issues" className="bg-red-600 text-white p-6 rounded-lg shadow-md hover:bg-red-700 transition">
            <FiAlertCircle className="w-8 h-8 mb-4" />
            <h3 className="font-semibold">Pending Issues</h3>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Users */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Recent Users</h2>
              <Link href="/dashboard/admin/users" className="text-blue-600 hover:text-blue-800">
                View All
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
                      <th className="text-left py-3">Name</th>
                      <th className="text-left py-3">Role</th>
                      <th className="text-left py-3">Joined</th>
                      <th className="text-left py-3">Status</th>
                      <th className="text-left py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentUsers.map((user) => (
                      <tr key={user.id} className="border-b">
                        <td className="py-3">{user.name}</td>
                        <td className="py-3">{user.role}</td>
                        <td className="py-3">{user.joined}</td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            user.status === "Active" ? "bg-green-100 text-green-800" : 
                            user.status === "Pending" ? "bg-yellow-100 text-yellow-800" : 
                            "bg-red-100 text-red-800"
                          }`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="py-3">
                          <select
                            value={user.status}
                            onChange={(e) => handleStatusChange(user.id, e.target.value as User['status'])}
                            className="text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          >
                            <option value="Active">Active</option>
                            <option value="Pending">Pending</option>
                            <option value="Suspended">Suspended</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Recent Courses */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Recent Courses</h2>
              <Link href="/dashboard/admin/courses" className="text-blue-600 hover:text-blue-800">
                View All
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3">Course</th>
                    <th className="text-left py-3">Difficulty</th>
                    <th className="text-left py-3">Students</th>
                    <th className="text-left py-3">Price</th>
                    <th className="text-left py-3">Visibility</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course) => (
                    <tr key={course.id} className="border-b">
                      <td className="py-3">{course.name}</td>
                      <td className="py-3">{course.difficulty}</td>
                      <td className="py-3">{course.attributes.studentCount}</td>
                      <td className="py-3">${course.price || 0}</td>
                      <td className="py-3">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={course.isPublished}
                            onChange={(e) => handleCourseVisibility(course.id, e.target.checked)}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          <span className="ml-3 text-sm font-medium text-gray-900">
                            {course.isPublished ? 'Published' : 'Unpublished'}
                          </span>
                        </label>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard; 