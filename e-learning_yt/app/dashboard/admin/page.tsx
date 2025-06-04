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

const AdminDashboard = () => {
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const {jwt} = useAuth();

  const stats = [
    { label: 'Total Users', value: '2,547', icon: <FiUsers className="w-6 h-6" />, color: 'blue', change: '+12%' },
    { label: 'Total Courses', value: '156', icon: <FiBook className="w-6 h-6" />, color: 'green', change: '+8%' },
    { label: 'Revenue', value: '$45,231', icon: <FiDollarSign className="w-6 h-6" />, color: 'purple', change: '+23%' },
    { label: 'Active Sessions', value: '1,234', icon: <FiActivity className="w-6 h-6" />, color: 'orange', change: '+5%' },
  ];

  const quickActions = [
    { label: 'Manage Users', href: '/dashboard/admin/users', icon: <FiUsers className="w-8 h-8" />, color: 'blue' },
    { label: 'Course Management', href: '/dashboard/admin/courses', icon: <FiBook className="w-8 h-8" />, color: 'green' },
    { label: 'View Analytics', href: '/dashboard/admin/analytics', icon: <FiBarChart2 className="w-8 h-8" />, color: 'purple' },
    { label: 'System Settings', href: '/dashboard/admin/settings', icon: <FiShield className="w-8 h-8" />, color: 'orange' },
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
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome, Administrator</h1>
          <p className="text-gray-600 mt-2">Here's what's happening with your e-learning platform today.</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className={`text-sm mt-1 ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change} from last month
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
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
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

        {/* Recent Activity & System Health */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">New user registered</p>
                  <p className="text-xs text-gray-500">john.doe@example.com - 5 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Course "React Basics" published</p>
                  <p className="text-xs text-gray-500">by Sarah Wilson - 1 hour ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Payment received</p>
                  <p className="text-xs text-gray-500">$299 for Pro subscription - 2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Instructor application</p>
                  <p className="text-xs text-gray-500">Mike Johnson applied - 3 hours ago</p>
                </div>
              </div>
            </div>
            <Link 
              href="/dashboard/admin/audit"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-4 inline-block"
            >
              View all activity →
            </Link>
          </div>

          {/* System Health */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Server Status</span>
                <span className="flex items-center text-green-600 text-sm font-medium">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Online
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Database</span>
                <span className="flex items-center text-green-600 text-sm font-medium">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Healthy
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Storage Usage</span>
                <span className="text-sm font-medium text-gray-900">68% (340GB/500GB)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Memory Usage</span>
                <span className="text-sm font-medium text-gray-900">45% (3.6GB/8GB)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active Users</span>
                <span className="text-sm font-medium text-gray-900">1,234 online</span>
              </div>
            </div>
            <Link 
              href="/dashboard/admin/performance"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-4 inline-block"
            >
              View performance details →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard; 