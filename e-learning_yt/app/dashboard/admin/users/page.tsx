"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FiUserPlus, FiEdit2, FiTrash2, FiSearch, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '@/hooks/useAuth';
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
import Link from 'next/link';

interface User {
  id: number;
  username: string;
  email: string;
  confirmed: boolean;
  blocked: boolean;
  organizationID?: string;
  role: {
    id: number;
    name: string;
    type: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface UsersResponse {
  data: User[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

const UsersPage = () => {
  const { jwt } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    userId: number | null;
    userName: string;
  }>({
    isOpen: false,
    userId: null,
    userName: ''
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    pageCount: 0,
    total: 0
  });

  const fetchUsers = useCallback(async (page = 1, search = '') => {
    try {
      setLoading(true);
      const searchFilter = search ? `&filters[username][$containsi]=${search}` : '';
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users?populate=role&pagination[page]=${page}&pagination[pageSize]=10${searchFilter}`,
        {
          headers: {
            'Authorization': `Bearer ${jwt}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data: User[] = await response.json();
      console.log('Users response:', data);
      
      // Strapi users endpoint returns array directly, not with data wrapper
      setUsers(Array.isArray(data) ? data : []);
      
      // For users endpoint, we don't get pagination meta, so we estimate
      setPagination(prev => ({
        ...prev,
        page,
        total: Array.isArray(data) ? data.length : 0
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  }, [jwt]);

  useEffect(() => {
    if (jwt) {
      fetchUsers();
    }
  }, [fetchUsers, jwt]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(1, searchTerm);
  };

  const handleBlockUser = async (userId: number, block: boolean) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`,
        },
        body: JSON.stringify({ blocked: block }),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${block ? 'block' : 'unblock'} user`);
      }

      // Refresh users list
      fetchUsers(pagination.page, searchTerm);
    } catch (err) {
      console.error(`Error ${block ? 'blocking' : 'unblocking'} user:`, err);
      setError(err instanceof Error ? err.message : `Failed to ${block ? 'block' : 'unblock'} user`);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    setIsDeleting(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${jwt}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      // Refresh users list
      fetchUsers(pagination.page, searchTerm);
      setDeleteDialog({ isOpen: false, userId: null, userName: '' });
    } catch (err) {
      console.error('Error deleting user:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    } finally {
      setIsDeleting(false);
    }
  };

  const openDeleteDialog = (userId: number, userName: string) => {
    setDeleteDialog({ isOpen: true, userId, userName });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({ isOpen: false, userId: null, userName: '' });
  };

  const getRoleColor = (roleName: string) => {
    switch (roleName.toLowerCase()) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'instructor':
        return 'bg-blue-100 text-blue-800';
      case 'authenticated':
        return 'bg-green-100 text-green-800';
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

  if (loading && users.length === 0) {
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
          <h1 className="text-3xl font-bold text-gray-900">Quản lý người dùng</h1>
          <button
            onClick={() => router.push('/dashboard/admin/users/new')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FiUserPlus className="w-5 h-5 mr-2" />
            Thêm người dùng mới
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Search */}
        <div className="mb-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm người dùng theo tên người dùng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Tìm kiếm
            </button>
          </form>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Người dùng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vai trò
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tổ chức
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
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{user.username}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role?.name || 'Unknown')}`}>
                      {user.role?.name || 'No Role'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.confirmed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {user.confirmed ? 'Đã xác thực' : 'Chưa xác thực'}
                      </span>
                      {user.blocked && (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          Đã khóa
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.organizationID || 'Không có'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/dashboard/admin/users/${user.id}/edit`}
                        className="h-9 w-9 border border-indigo-800 text-indigo-800 bg-indigo-50 flex items-center justify-center rounded-sm"
                        title="Sửa người dùng"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleBlockUser(user.id, !user.blocked)}
                        className={`${user.blocked ? 'h-9 w-9 border border-green-800 text-green-800 bg-green-50 flex items-center justify-center rounded-sm' : 'h-9 w-9 border border-amber-800 text-amber-800 bg-amber-50 flex items-center justify-center rounded-sm'}`}
                        title={user.blocked ? 'Mở khóa người dùng' : 'Khóa người dùng'}
                      >
                        {user.blocked ? <FiEye className="w-4 h-4" /> : <FiEyeOff className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => openDeleteDialog(user.id, user.username)}
                        className="h-9 w-9 border border-red-800 text-red-800 bg-red-50 flex items-center justify-center rounded-sm"
                        title="Xóa người dùng"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {users.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-gray-500">Không tìm thấy người dùng.</p>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-blue-600">{users.length}</div>
            <div className="text-sm text-gray-500">Tổng số người dùng</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-green-600">
              {users.filter(u => u.confirmed).length}
            </div>
            <div className="text-sm text-gray-500">Đã xác thực</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-red-600">
              {users.filter(u => u.blocked).length}
            </div>
            <div className="text-sm text-gray-500">Đã khóa</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-purple-600">
              {users.filter(u => u.role?.name === 'instructor').length}
            </div>
            <div className="text-sm text-gray-500">Giáo viên</div>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialog.isOpen} onOpenChange={closeDeleteDialog}>
          <DialogContent size="small" className="bg-white max-h-[90vh] h-fit overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center text-red-600">
                Xác nhận xóa người dùng
              </DialogTitle>
              <DialogDescription className="text-gray-600 pt-2">
                Bạn có chắc chắn muốn xóa người dùng &ldquo;{deleteDialog.userName}&rdquo;? Hành động này không thể hoàn tác.
              </DialogDescription>
            </DialogHeader>

            <div className="bg-red-50 p-4 my-4 rounded-sm border border-red-200">
              <p className="text-gray-800 text-sm">
                Khi xóa người dùng, tất cả dữ liệu liên quan sẽ bị xóa vĩnh viễn khỏi hệ thống và không thể khôi phục.
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
                onClick={() => deleteDialog.userId && handleDeleteUser(deleteDialog.userId)}
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

export default UsersPage; 