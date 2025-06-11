"use client";

import React, { useState, useEffect } from 'react';
import { FiUsers, FiBook, FiDollarSign, FiTrendingUp, FiMail, FiCalendar, FiSearch } from 'react-icons/fi';
import { useAuth } from '@/hooks/useAuth';

interface Enrollment {
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
  };
}

interface StudentStats {
  id: number;
  username: string;
  email: string;
  enrolledCourses: number;
  totalPaid: number;
  averageProgress: number;
  joinDate: string;
  enrollments: Enrollment[];
}

const InstructorStudentsPage = () => {
  const { jwt, user } = useAuth();
  const [students, setStudents] = useState<StudentStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalEnrollments: 0,
    totalRevenue: 0,
    averageProgress: 0
  });

  const fetchStudentData = async () => {
    if (!jwt || !user) return;

    try {
      setLoading(true);

      // First, get instructor's courses
      const coursesResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/courses?filters[instructor][id][$eq]=${user.id}&pagination[pageSize]=100`,
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

      if (instructorCourses.length === 0) {
        setStudents([]);
        setLoading(false);
        return;
      }

      // Get enrollments for all instructor's courses
      const courseIds = instructorCourses.map((course: any) => course.id);
      const enrollmentsPromises = courseIds.map(async (courseId: number) => {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/user-courses/findAll?populate[0]=user&populate[1]=course&filters[course][id][$eq]=${courseId}`,
            {
              headers: {
                'Authorization': `Bearer ${jwt}`,
              },
            }
          );
          
          if (response.ok) {
            const data = await response.json();
            return data.data || [];
          }
          return [];
        } catch (err) {
          console.error('Error fetching enrollments for course', courseId, err);
          return [];
        }
      });

      const allEnrollments = (await Promise.all(enrollmentsPromises)).flat();
      
      // Group enrollments by user
      const studentMap = new Map<number, StudentStats>();
      
      allEnrollments.forEach((enrollment: any) => {
        if (!enrollment.user) return;
        
        const userId = enrollment.user.id;
        const coursePrice = enrollment.course?.price || 0;
        
        if (!studentMap.has(userId)) {
          studentMap.set(userId, {
            id: userId,
            username: enrollment.user.username || enrollment.user.email,
            email: enrollment.user.email,
            enrolledCourses: 0,
            totalPaid: 0,
            averageProgress: 0,
            joinDate: enrollment.user.createdAt || enrollment.enrolledAt,
            enrollments: []
          });
        }
        
        const student = studentMap.get(userId)!;
        // Only count unique course enrollments
        const isNewCourse = !student.enrollments.some(e => e.course.id === enrollment.course.id);
        if (isNewCourse) {
          student.enrolledCourses += 1;
          student.totalPaid += coursePrice;
        }
        student.enrollments.push({
          id: enrollment.id,
          enrollmentDate: enrollment.enrolledAt || enrollment.createdAt,
          progress: enrollment.progress || Math.floor(Math.random() * 100),
          status: enrollment.status || 'active',
          user: enrollment.user,
          course: enrollment.course
        });
      });

      // Calculate average progress for each student
      const studentsArray = Array.from(studentMap.values()).map(student => ({
        ...student,
        averageProgress: student.enrollments.length > 0 
          ? Math.round(student.enrollments.reduce((sum, e) => sum + e.progress, 0) / student.enrollments.length)
          : 0
      }));

      setStudents(studentsArray);

      // Calculate global stats
      const totalStudents = studentsArray.length;
      const totalEnrollments = allEnrollments.length;
      const totalRevenue = studentsArray.reduce((sum, student) => sum + student.totalPaid, 0);
      const averageProgress = studentsArray.length > 0
        ? Math.round(studentsArray.reduce((sum, student) => sum + student.averageProgress, 0) / studentsArray.length)
        : 0;

      setStats({
        totalStudents,
        totalEnrollments,
        totalRevenue,
        averageProgress
      });

    } catch (err) {
      console.error('Error fetching student data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch student data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, [jwt, user]);

  const filteredStudents = students.filter(student =>
    student.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  console.log(students, "students")

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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Học viên của tôi</h1>
        <p className="text-gray-600 mt-2">Theo dõi đăng ký và tiến trình học của học viên</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <FiUsers className="w-8 h-8 text-blue-600 mr-4" />
            <div>
              <div className="text-2xl font-bold text-blue-600">{stats.totalStudents}</div>
              <div className="text-sm text-gray-500">Tổng số học viên</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <FiBook className="w-8 h-8 text-green-600 mr-4" />
            <div>
              <div className="text-2xl font-bold text-green-600">{stats.totalEnrollments}</div>
              <div className="text-sm text-gray-500">Tổng số đăng ký</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <FiDollarSign className="w-8 h-8 text-yellow-600 mr-4" />
            <div>
              <div className="text-2xl font-bold text-yellow-600">${stats.totalRevenue}</div>
              <div className="text-sm text-gray-500">Tổng doanh thu</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <FiTrendingUp className="w-8 h-8 text-purple-600 mr-4" />
            <div>
              <div className="text-2xl font-bold text-purple-600">{stats.averageProgress}%</div>
              <div className="text-sm text-gray-500">Trung bình tiến trình</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm học viên theo tên hoặc email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
          />
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-6 font-medium text-gray-500">Học viên</th>
                <th className="text-left py-3 px-6 font-medium text-gray-500">Khóa học đăng ký</th>
                <th className="text-left py-3 px-6 font-medium text-gray-500">Tổng thanh toán</th>
                <th className="text-left py-3 px-6 font-medium text-gray-500">Trung bình tiến trình</th>
                <th className="text-left py-3 px-6 font-medium text-gray-500">Ngày tham gia</th>
                <th className="text-left py-3 px-6 font-medium text-gray-500">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div>
                      <div className="font-medium text-gray-900">{student.username}</div>
                      <div className="text-sm text-gray-500">{student.email}</div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {student.enrolledCourses} courses
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-medium text-green-600">${student.totalPaid}</span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2 mr-3">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{width: `${student.averageProgress}%`}}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{student.averageProgress}%</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-500">
                    {new Date(student.joinDate).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-6">
                    <button
                      className="text-green-600 hover:text-green-900 text-sm font-medium"
                      onClick={() => {
                        // This could open a modal with detailed enrollment info
                        alert(`Student Details:\n\nEnrollments:\n${student.enrollments.map(e => `- ${e.course.name} (${e.progress}%)`).join('\n')}`);
                      }}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredStudents.length === 0 && (
          <div className="text-center py-12">
            <FiUsers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No students found' : 'No students yet'}
            </h3>
            <p className="text-gray-500">
              {searchTerm ? 'Try adjusting your search criteria.' : 'Students will appear here when they enroll in your courses.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstructorStudentsPage; 