"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiEye, FiEyeOff, FiUsers, FiBook, FiDollarSign, FiStar } from 'react-icons/fi';
import { useAuth } from '@/hooks/useAuth';

interface Course {
  id: number;
  name: string;
  descriptions: string;
  difficulty: string;
  price: number | null;
  isPublished: boolean;
  studentCount: number;
  attributes: {
    rating?: number | null;
    lessonCount?: number;
  };
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  lessons?: any[];
}

interface CoursesResponse {
  data: Course[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

const InstructorCoursesPage = () => {
  const { jwt, user } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    pageCount: 0,
    total: 0
  });

  const fetchCourses = useCallback(async (page = 1, search = '', difficulty = 'all', status = 'all') => {
    try {
      setLoading(true);
      let url = `${process.env.NEXT_PUBLIC_API_URL}/api/courses?populate=lessons&pagination[page]=${page}&pagination[pageSize]=10`;
      
      // Filter by instructor - only get courses created by the logged-in instructor
      if (user?.id) {
        url += `&filters[instructor][id][$eq]=${user.id}`;
      }
      
      if (search) {
        url += `&filters[name][$containsi]=${search}`;
      }
      if (difficulty !== 'all') {
        url += `&filters[difficulty][$eq]=${difficulty}`;
      }
      if (status !== 'all') {
        const isPublished = status === 'published';
        url += `&filters[isPublished][$eq]=${isPublished}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${jwt}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }

      const data: CoursesResponse = await response.json();
      
      // Add computed fields
      const coursesWithStats = data.data.map(course => ({
        ...course,
        attributes: {
          ...course.attributes,
          studentCount: course.studentCount || 0,
          rating: course.attributes?.rating || null,
          lessonCount: course.lessons?.length || 0
        }
      }));
      
      setCourses(coursesWithStats);
      setPagination(data.meta.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch courses');
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  }, [jwt, user?.id]);

  useEffect(() => {
    if (jwt && user?.id) {
      fetchCourses();
    }
  }, [jwt, user, fetchCourses]);


  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCourses(1, searchTerm, filterDifficulty, filterStatus);
  };



  const handleDeleteCourse = async (courseId: number) => {
    if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/courses/${courseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${jwt}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete course');
      }

      // Refresh courses list
      fetchCourses(pagination.page, searchTerm, filterDifficulty, filterStatus);
    } catch (err) {
      console.error('Error deleting course:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete course');
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading && courses.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
            <p className="text-gray-600 mt-2">Manage your course content and track student progress</p>
          </div>
          <button
            onClick={() => router.push('/dashboard/instructor/courses/new')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FiPlus className="w-5 h-5 mr-2" />
            Create New Course
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Search and Filters */}
        <div className="mb-6 bg-white p-6 rounded-lg shadow">
          <form onSubmit={handleSearch} className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search courses by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>

            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Search
            </button>
          </form>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <FiBook className="w-8 h-8 text-blue-600 mr-4" />
              <div>
                <div className="text-2xl font-bold text-blue-600">{pagination.total}</div>
                <div className="text-sm text-gray-500">Total Courses</div>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <FiEye className="w-8 h-8 text-green-600 mr-4" />
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {courses.filter(c => c.isPublished).length}
                </div>
                <div className="text-sm text-gray-500">Published</div>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <FiUsers className="w-8 h-8 text-purple-600 mr-4" />
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {courses.reduce((total, course) => total + (course.studentCount || 0), 0)}
                </div>
                <div className="text-sm text-gray-500">Total Students</div>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <FiDollarSign className="w-8 h-8 text-yellow-600 mr-4" />
              <div>
                <div className="text-2xl font-bold text-yellow-600">
                  ${courses.reduce((total, course) => total + (course.price || 0), 0).toFixed(0)}
                </div>
                <div className="text-sm text-gray-500">Total Revenue</div>
              </div>
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {courses.map((course) => (
            <div key={course.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600">
                <div className="absolute top-4 left-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(course.difficulty)}`}>
                    {course.difficulty}
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    course.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {course.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-lg font-semibold">{course.name}</h3>
                </div>
              </div>
              
              <div className="p-6">
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.descriptions}</p>
                
                <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-blue-600">{course.studentCount || 0}</div>
                    <div className="text-xs text-gray-500">Students</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-600">{course.attributes?.lessonCount || 0}</div>
                    <div className="text-xs text-gray-500">Lessons</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-yellow-600">
                      <div className="flex items-center justify-center">
                        <FiStar className="w-4 h-4 mr-1" />
                        {course.attributes?.rating ? course.attributes.rating.toFixed(1) : 'N/A'}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">Rating</div>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-bold text-blue-600">
                    {course.price ? `$${course.price}` : 'Free'}
                  </span>
                  <span className="text-sm text-gray-500">
                    Created: {formatDate(course.createdAt)}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/dashboard/instructor/courses/${course.id}/edit`)}
                    className="flex-1 bg-blue-600 text-white text-sm py-2 px-3 rounded hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    <FiEdit2 className="w-4 h-4 mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteCourse(course.id)}
                    className="px-3 py-2 bg-red-100 text-red-800 text-sm rounded hover:bg-red-200 transition-colors"
                    title="Delete course"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {courses.length === 0 && !loading && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <FiBook className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm ? 'Try adjusting your search criteria.' : 'Get started by creating your first course.'}
            </p>
            <button
              onClick={() => router.push('/dashboard/instructor/courses/new')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              <FiPlus className="w-5 h-5 mr-2" />
              Create Your First Course
            </button>
          </div>
        )}

        {/* Pagination */}
        {pagination.pageCount > 1 && (
          <div className="mt-6 flex justify-center">
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button
                onClick={() => fetchCourses(pagination.page - 1, searchTerm, filterDifficulty, filterStatus)}
                disabled={pagination.page === 1}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {Array.from({ length: pagination.pageCount }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => fetchCourses(page, searchTerm, filterDifficulty, filterStatus)}
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
                onClick={() => fetchCourses(pagination.page + 1, searchTerm, filterDifficulty, filterStatus)}
                disabled={pagination.page === pagination.pageCount}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstructorCoursesPage; 