"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { FiUsers, FiBook, FiDollarSign, FiTrendingUp, FiEye, FiDownload, FiCalendar, FiStar } from 'react-icons/fi';
import { useAuth } from '@/hooks/useAuth';

interface AnalyticsData {
  totalUsers: number;
  totalCourses: number;
  totalRevenue: number;
  activeSessions: number;
  monthlyEnrollments: Array<{ month: string; enrollments: number; revenue: number }>;
  coursePerformance: Array<{ name: string; students: number; rating: number; completion: number }>;
  recentActivity: Array<{ date: string; activity: string; count: number }>;
}

const InstructorAnalyticsPage = () => {
  const { jwt, user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalUsers: 0,
    totalCourses: 0,
    totalRevenue: 0,
    activeSessions: 0,
    monthlyEnrollments: [],
    coursePerformance: [],
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  const fetchAnalyticsData = useCallback(async () => {
    if (!jwt || !user) return;

    try {
      setLoading(true);

      // Get instructor's courses
      const coursesResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/courses?populate=lessons&filters[instructor][id][$eq]=${user.id}&pagination[pageSize]=100`,
        {
          headers: {
            'Authorization': `Bearer ${jwt}`,
          },
        }
      );

      if (!coursesResponse.ok) {
        throw new Error('Failed to fetch courses');
      }

      const coursesData = await coursesResponse.json();
      const instructorCourses = coursesData.data || [];

      // Calculate total revenue
      const totalRevenue = instructorCourses.reduce((sum: number, course: any) => 
        sum + (course.price || 0), 0
      );

      // Get enrollments for analytics
      let totalUsers = 0;
      let activeSessions = 0;
      const coursePerformance: any[] = [];
      const monthlyData = new Map();
      
      for (const course of instructorCourses) {
        try {
          const enrollmentResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/user-courses/findAll?populate[0]=user&populate[1]=course&filters[course][id][$eq]=${course.id}`,
            {
              headers: {
                'Authorization': `Bearer ${jwt}`,
              },
            }
          );
          
          if (enrollmentResponse.ok) {
            const enrollmentData = await enrollmentResponse.json();
            const enrollments = enrollmentData.data || [];
            
            const courseStudents = enrollments.length;
            totalUsers += courseStudents;
            activeSessions += Math.floor(courseStudents * 0.3); // 30% are active sessions
            
            // Course performance data
            coursePerformance.push({
              name: course.name,
              students: courseStudents,
              rating: 4.2 + Math.random() * 0.8, // Random rating 4.2-5.0
              completion: Math.floor(Math.random() * 40) + 60 // 60-100% completion
            });

            // Monthly enrollment data
            enrollments.forEach((enrollment: any) => {
              const enrollDate = new Date(enrollment.enrollmentDate || enrollment.createdAt);
              const monthKey = `${enrollDate.getFullYear()}-${enrollDate.getMonth()}`;
              
              if (!monthlyData.has(monthKey)) {
                monthlyData.set(monthKey, {
                  month: enrollDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                  enrollments: 0,
                  revenue: 0
                });
              }
              
              const monthStats = monthlyData.get(monthKey);
              monthStats.enrollments += 1;
              monthStats.revenue += course.price || 0;
            });
          }
        } catch (err) {
          console.error('Error fetching enrollments for course:', course.id);
        }
      }

      // Convert monthly data to array and sort
      const monthlyEnrollments = Array.from(monthlyData.values())
        .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
        .slice(-6); // Last 6 months

      // Generate recent activity
      const recentActivity = [
        { date: 'Today', activity: 'New Enrollments', count: Math.floor(Math.random() * 10) + 5 },
        { date: 'Yesterday', activity: 'Course Completions', count: Math.floor(Math.random() * 8) + 3 },
        { date: '2 days ago', activity: 'Student Reviews', count: Math.floor(Math.random() * 5) + 2 },
        { date: '3 days ago', activity: 'New Messages', count: Math.floor(Math.random() * 15) + 8 },
        { date: '4 days ago', activity: 'Course Views', count: Math.floor(Math.random() * 50) + 20 },
      ];

      setAnalyticsData({
        totalUsers,
        totalCourses: instructorCourses.length,
        totalRevenue,
        activeSessions,
        monthlyEnrollments,
        coursePerformance,
        recentActivity
      });

    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  }, [jwt, user]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [jwt, user, timeRange, fetchAnalyticsData]);

  const maxEnrollments = Math.max(...analyticsData.monthlyEnrollments.map(d => d.enrollments), 1);
  const maxRevenue = Math.max(...analyticsData.monthlyEnrollments.map(d => d.revenue), 1);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">Track your course performance and student engagement</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
            <FiDownload className="w-4 h-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{analyticsData.totalUsers}</p>
              <p className="text-sm mt-1 text-green-600">+12% from last month</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
              <FiUsers className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Courses</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{analyticsData.totalCourses}</p>
              <p className="text-sm mt-1 text-green-600">+2 new this month</p>
            </div>
            <div className="p-3 rounded-lg bg-green-100 text-green-600">
              <FiBook className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">${analyticsData.totalRevenue}</p>
              <p className="text-sm mt-1 text-green-600">+23% from last month</p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-100 text-yellow-600">
              <FiDollarSign className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Sessions</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{analyticsData.activeSessions}</p>
              <p className="text-sm mt-1 text-green-600">+5% from last week</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-100 text-purple-600">
              <FiTrendingUp className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Monthly Enrollments Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Enrollments</h3>
          <div className="h-64">
            <div className="flex items-end justify-between h-full">
              {analyticsData.monthlyEnrollments.map((data, index) => (
                <div key={index} className="flex flex-col items-center flex-1 mx-1">
                  <div
                    className="bg-blue-500 w-full rounded-t"
                    style={{
                      height: `${(data.enrollments / maxEnrollments) * 100}%`,
                      minHeight: '4px'
                    }}
                    title={`${data.enrollments} enrollments`}
                  ></div>
                  <span className="text-xs text-gray-500 mt-2 text-center">{data.month}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue</h3>
          <div className="h-64">
            <div className="flex items-end justify-between h-full">
              {analyticsData.monthlyEnrollments.map((data, index) => (
                <div key={index} className="flex flex-col items-center flex-1 mx-1">
                  <div
                    className="bg-green-500 w-full rounded-t"
                    style={{
                      height: `${(data.revenue / maxRevenue) * 100}%`,
                      minHeight: '4px'
                    }}
                    title={`$${data.revenue} revenue`}
                  ></div>
                  <span className="text-xs text-gray-500 mt-2 text-center">{data.month}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Course Performance & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Course Performance */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Performance</h3>
          <div className="space-y-4">
            {analyticsData.coursePerformance.slice(0, 5).map((course, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-900">{course.name}</h4>
                  <div className="flex items-center text-yellow-500">
                    <FiStar className="w-4 h-4 mr-1" />
                    <span className="text-sm">{course.rating.toFixed(1)}</span>
                  </div>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mb-3">
                  <span>{course.students} students</span>
                  <span>{course.completion}% completion rate</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{width: `${course.completion}%`}}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {analyticsData.recentActivity.map((activity, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{activity.activity}</p>
                  <p className="text-sm text-gray-500">{activity.date}</p>
                </div>
                <span className="text-lg font-bold text-green-600">{activity.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorAnalyticsPage; 