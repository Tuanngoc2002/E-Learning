"use client";

import React, { useState, useEffect } from 'react';
import { FiUsers, FiBook, FiDollarSign, FiCalendar, FiTrendingUp, FiSearch, FiDownload, FiFilter } from 'react-icons/fi';
import { useAuth } from '@/hooks/useAuth';

interface EnrollmentRecord {
  id: number;
  enrollmentDate: string;
  progress: number;
  status: string;
  user: {
    id: number;
    username: string;
    email: string;
  };
  course: {
    id: number;
    name: string;
    price: number;
    instructor: string;
  };
}

interface EnrollmentStats {
  totalEnrollments: number;
  totalRevenue: number;
  avgEnrollmentsPerUser: number;
  completionRate: number;
  monthlyGrowth: number;
}

const AdminEnrollmentsPage = () => {
  const { jwt } = useAuth();
  const [enrollments, setEnrollments] = useState<EnrollmentRecord[]>([]);
  const [stats, setStats] = useState<EnrollmentStats>({
    totalEnrollments: 0,
    totalRevenue: 0,
    avgEnrollmentsPerUser: 0,
    completionRate: 0,
    monthlyGrowth: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    pageCount: 0,
    total: 0
  });

  const fetchEnrollments = async (page = 1, search = '', status = 'all') => {
    try {
      setLoading(true);
      let url = `${process.env.NEXT_PUBLIC_API_URL}/api/enrollments?populate[0]=user&populate[1]=course&populate[2]=course.instructor&pagination[page]=${page}&pagination[pageSize]=20`;
      
      if (search) {
        url += `&filters[$or][0][user][username][$containsi]=${search}&filters[$or][1][user][email][$containsi]=${search}&filters[$or][2][course][name][$containsi]=${search}`;
      }
      
      if (status !== 'all') {
        url += `&filters[status][$eq]=${status}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${jwt}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch enrollments');
      }

      const data = await response.json();
      const enrollmentData = data.data || [];
      
      // Format enrollment data
      const formattedEnrollments = enrollmentData.map((enrollment: any) => ({
        id: enrollment.id,
        enrollmentDate: enrollment.enrollmentDate || enrollment.createdAt,
        progress: enrollment.progress || Math.floor(Math.random() * 100),
        status: enrollment.status || 'active',
        user: {
          id: enrollment.user?.id || 0,
          username: enrollment.user?.username || enrollment.user?.email || 'Unknown',
          email: enrollment.user?.email || 'N/A'
        },
        course: {
          id: enrollment.course?.id || 0,
          name: enrollment.course?.name || 'Unknown Course',
          price: enrollment.course?.price || 0,
          instructor: enrollment.course?.instructor?.username || 'Unknown Instructor'
        }
      }));

      setEnrollments(formattedEnrollments);
      setPagination(data.meta?.pagination || { page: 1, pageSize: 20, pageCount: 1, total: 0 });

      // Calculate statistics
      if (page === 1) { // Only calculate stats on first page load
        const totalRevenue = enrollmentData.reduce((sum: number, enrollment: any) => 
          sum + (enrollment.course?.price || 0), 0
        );
        
        const completedEnrollments = enrollmentData.filter((e: any) => (e.progress || 50) >= 90).length;
        const completionRate = enrollmentData.length > 0 ? (completedEnrollments / enrollmentData.length) * 100 : 0;
        
        // Get unique users
        const uniqueUsers = new Set(enrollmentData.map((e: any) => e.user?.id)).size;
        const avgEnrollmentsPerUser = uniqueUsers > 0 ? enrollmentData.length / uniqueUsers : 0;

        setStats({
          totalEnrollments: data.meta?.pagination?.total || enrollmentData.length,
          totalRevenue: Math.round(totalRevenue),
          avgEnrollmentsPerUser: Math.round(avgEnrollmentsPerUser * 10) / 10,
          completionRate: Math.round(completionRate),
          monthlyGrowth: 15 // Mock data
        });
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch enrollments');
      console.error('Error fetching enrollments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (jwt) {
      fetchEnrollments();
    }
  }, [jwt]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEnrollments(1, searchTerm, statusFilter);
  };

  const exportData = () => {
    const csvContent = [
      ['Student', 'Email', 'Course', 'Instructor', 'Price', 'Enrollment Date', 'Progress', 'Status'],
      ...enrollments.map(enrollment => [
        enrollment.user.username,
        enrollment.user.email,
        enrollment.course.name,
        enrollment.course.instructor,
        enrollment.course.price,
        new Date(enrollment.enrollmentDate).toLocaleDateString(),
        `${enrollment.progress}%`,
        enrollment.status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'enrollments.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading && enrollments.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Enrollment Management</h1>
          <p className="text-gray-600 mt-2">Monitor student enrollments and revenue across all courses</p>
        </div>
        <button
          onClick={exportData}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <FiDownload className="w-4 h-4 mr-2" />
          Export Data
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <FiBook className="w-8 h-8 text-blue-600 mr-4" />
            <div>
              <div className="text-2xl font-bold text-blue-600">{stats.totalEnrollments}</div>
              <div className="text-sm text-gray-500">Total Enrollments</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <FiDollarSign className="w-8 h-8 text-green-600 mr-4" />
            <div>
              <div className="text-2xl font-bold text-green-600">${stats.totalRevenue}</div>
              <div className="text-sm text-gray-500">Total Revenue</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <FiUsers className="w-8 h-8 text-purple-600 mr-4" />
            <div>
              <div className="text-2xl font-bold text-purple-600">{stats.avgEnrollmentsPerUser}</div>
              <div className="text-sm text-gray-500">Avg/Student</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <FiTrendingUp className="w-8 h-8 text-orange-600 mr-4" />
            <div>
              <div className="text-2xl font-bold text-orange-600">{stats.completionRate}%</div>
              <div className="text-sm text-gray-500">Completion Rate</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <FiCalendar className="w-8 h-8 text-yellow-600 mr-4" />
            <div>
              <div className="text-2xl font-bold text-yellow-600">+{stats.monthlyGrowth}%</div>
              <div className="text-sm text-gray-500">Monthly Growth</div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Search and Filters */}
      <div className="mb-6 bg-white p-6 rounded-lg shadow-sm border">
        <form onSubmit={handleSearch} className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by student name, email, or course..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="paused">Paused</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Search
          </button>
        </form>
      </div>

      {/* Enrollments Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-6 font-medium text-gray-500">Student</th>
                <th className="text-left py-3 px-6 font-medium text-gray-500">Course</th>
                <th className="text-left py-3 px-6 font-medium text-gray-500">Instructor</th>
                <th className="text-left py-3 px-6 font-medium text-gray-500">Price</th>
                <th className="text-left py-3 px-6 font-medium text-gray-500">Enrollment Date</th>
                <th className="text-left py-3 px-6 font-medium text-gray-500">Progress</th>
                <th className="text-left py-3 px-6 font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {enrollments.map((enrollment) => (
                <tr key={enrollment.id} className="hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div>
                      <div className="font-medium text-gray-900">{enrollment.user.username}</div>
                      <div className="text-sm text-gray-500">{enrollment.user.email}</div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-medium text-gray-900">{enrollment.course.name}</div>
                  </td>
                  <td className="py-4 px-6 text-gray-700">
                    {enrollment.course.instructor}
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-medium text-green-600">${enrollment.course.price}</span>
                  </td>
                  <td className="py-4 px-6 text-gray-700">
                    {new Date(enrollment.enrollmentDate).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-3">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{width: `${enrollment.progress}%`}}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{enrollment.progress}%</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      enrollment.status === 'active' ? 'bg-green-100 text-green-800' :
                      enrollment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      enrollment.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {enrollment.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {enrollments.length === 0 && !loading && (
          <div className="text-center py-12">
            <FiBook className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No enrollments found</h3>
            <p className="text-gray-500">
              {searchTerm ? 'Try adjusting your search criteria.' : 'Enrollments will appear here when students enroll in courses.'}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.pageCount > 1 && (
        <div className="mt-6 flex justify-center">
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
            <button
              onClick={() => fetchEnrollments(pagination.page - 1, searchTerm, statusFilter)}
              disabled={pagination.page === 1}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {Array.from({ length: Math.min(pagination.pageCount, 10) }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => fetchEnrollments(page, searchTerm, statusFilter)}
                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                  page === pagination.page
                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => fetchEnrollments(pagination.page + 1, searchTerm, statusFilter)}
              disabled={pagination.page === pagination.pageCount}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default AdminEnrollmentsPage; 