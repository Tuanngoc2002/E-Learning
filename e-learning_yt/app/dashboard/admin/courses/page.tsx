"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiEye, FiEyeOff, FiUsers, FiDollarSign, FiBook } from 'react-icons/fi';
import { useAuth } from '@/hooks/useAuth';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import Link from 'next/link';

interface Course {
  id: number;
  name: string;
  descriptions: string;
  difficulty: string;
  price: number | null;
  isPublished: boolean;
  studentCount: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
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

const AdminCoursesPage = () => {
  const { jwt } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    courseId: number | null;
    courseName: string;
  }>({
    isOpen: false,
    courseId: null,
    courseName: ''
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    pageCount: 0,
    total: 0
  });

  const fetchCourses = useCallback(async (page = 1, search = '', difficulty = 'all', status = 'all') => {
    try {
      setLoading(true);
      let url = `${process.env.NEXT_PUBLIC_API_URL}/api/courses?populate=*&pagination[page]=${page}&pagination[pageSize]=10`;
      
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
      setCourses(data.data);
      setPagination(data.meta.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch courses');
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  }, [jwt]);

  useEffect(() => {
    if (jwt) {
      fetchCourses();
    }
  }, [fetchCourses, jwt]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCourses(1, searchTerm, filterDifficulty, filterStatus);
  };

  const handlePublishToggle = async (courseId: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/courses/${courseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          data: {
            isPublished: !currentStatus
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${currentStatus ? 'unpublish' : 'publish'} course`);
      }

      // Refresh courses list
      fetchCourses(pagination.page, searchTerm, filterDifficulty, filterStatus);
    } catch (err) {
      console.error(`Error ${currentStatus ? 'unpublishing' : 'publishing'} course:`, err);
      setError(err instanceof Error ? err.message : `Failed to ${currentStatus ? 'unpublish' : 'publish'} course`);
    }
  };

  const handleDeleteCourse = async (courseId: number) => {
    setIsDeleting(true);
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
      setDeleteDialog({ isOpen: false, courseId: null, courseName: '' });
    } catch (err) {
      console.error('Error deleting course:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete course');
    } finally {
      setIsDeleting(false);
    }
  };

  const openDeleteDialog = (courseId: number, courseName: string) => {
    setDeleteDialog({ isOpen: true, courseId, courseName });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({ isOpen: false, courseId: null, courseName: '' });
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Quản lý khóa học</h1>
          
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
                <Input
                  type="text"
                  placeholder="Tìm kiếm khóa học theo tên..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4"
                />
              </div>
            </div>
            
            <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Tất cả độ khó" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả độ khó</SelectItem>
                <SelectItem value="easy">Dễ</SelectItem>
                <SelectItem value="medium">Trung bình</SelectItem>
                <SelectItem value="hard">Khó</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Tất cả trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="published">Xuất bản</SelectItem>
                <SelectItem value="draft">Nháp</SelectItem>
              </SelectContent>
            </Select>

            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Tìm kiếm
            </button>
          </form>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <FiBook className="w-8 h-8 text-blue-600 mr-4" />
              <div>
                <div className="text-2xl font-bold text-blue-600">{pagination.total}</div>
                <div className="text-sm text-gray-500">Tổng số khóa học</div>
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
                <div className="text-sm text-gray-500">Đang hoạt động</div>
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
                <div className="text-sm text-gray-500">Tổng số học viên</div>
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
                <div className="text-sm text-gray-500">Tổng doanh thu</div>
              </div>
            </div>
          </div>
        </div>

        {/* Courses Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Khóa học
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Độ khó
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Giá
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Học viên
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {courses.map((course) => (
                <tr key={course.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{course.name}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {course.descriptions}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(course.difficulty)}`}>
                      {course.difficulty}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {course.price ? `$${course.price}` : 'Free'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {course.studentCount || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      course.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {course.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(course.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/dashboard/admin/courses/${course.id}/edit`}
                        className="text-blue-600 hover:text-blue-900"
                        title="Sửa khóa học"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handlePublishToggle(course.id, course.isPublished)}
                        className={`${course.isPublished ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'}`}
                        title={course.isPublished ? 'Bỏ xuất bản khóa học' : 'Xuất bản khóa học'}
                      >
                        {course.isPublished ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => openDeleteDialog(course.id, course.name)}
                        className="text-red-600 hover:text-red-900"
                        title="Xóa khóa học"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {courses.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-gray-500">Không tìm thấy khóa học.</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.pageCount > 1 && (
          <Pagination
            page={pagination.page}
            pageSize={pagination.pageSize}
            total={pagination.total}
            onPageChange={(page) => fetchCourses(page, searchTerm, filterDifficulty, filterStatus)}
          />
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialog.isOpen} onOpenChange={closeDeleteDialog}>
          <DialogContent size="small" className="bg-white max-h-[90vh] h-fit overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center text-red-600">
                Xác nhận xóa khóa học
              </DialogTitle>
              <DialogDescription className="text-gray-600 pt-2">
                Bạn có chắc chắn muốn xóa khóa học &ldquo;{deleteDialog.courseName}&rdquo;? Hành động này không thể hoàn tác.
              </DialogDescription>
            </DialogHeader>

            <div className="bg-red-50 p-4 my-4 rounded-sm border border-red-200">
              <p className="text-gray-800 text-sm">
                Khi xóa khóa học, tất cả dữ liệu liên quan bao gồm bài học, học viên đã đăng ký sẽ bị xóa vĩnh viễn khỏi hệ thống và không thể khôi phục.
              </p>
            </div>

            <DialogFooter className="flex flex-row justify-end gap-2 sm:gap-0">
              <DialogClose asChild>
                <Button type="button" disabled={isDeleting} className="border border-gray-300 bg-white text-gray-600 hover:bg-gray-50">
                  Hủy
                </Button>
              </DialogClose>

              <Button
                type="button"
                onClick={() => deleteDialog.courseId && handleDeleteCourse(deleteDialog.courseId)}
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin border-2 border-white border-t-transparent rounded-full" />
                    Đang xóa...
                  </>
                ) : (
                  <>
                    <FiTrash2 className="mr-2 h-4 w-4" />
                    Xóa
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminCoursesPage; 