"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FiSave, FiArrowLeft } from 'react-icons/fi';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Role {
  id: number;
  name: string;
  description: string;
  type: string;
}

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
}

interface UserFormData {
  username: string;
  email: string;
  role: number;
  confirmed: boolean;
  blocked: boolean;
  organizationID: string;
}

const EditUserPage = () => {
  const { jwt } = useAuth();
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [roles, setRoles] = useState<Role[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    email: '',
    role: 0,
    confirmed: true,
    blocked: false,
    organizationID: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user data and roles
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsFetching(true);

        // Fetch roles
        const rolesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users-permissions/roles`, {
          headers: {
            'Authorization': `Bearer ${jwt}`,
          },
        });
        if (rolesResponse.ok) {
          const rolesData = await rolesResponse.json();
          setRoles(rolesData.roles);
        }

        // Fetch user
        const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}?populate=role`, {
          headers: {
            'Authorization': `Bearer ${jwt}`,
          },
        });

        if (!userResponse.ok) {
          throw new Error('Failed to fetch user');
        }

        const userData: User = await userResponse.json();
        setUser(userData);
        setFormData({
          username: userData.username,
          email: userData.email,
          role: userData.role?.id || 0,
          confirmed: userData.confirmed,
          blocked: userData.blocked,
          organizationID: userData.organizationID || '',
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
        console.error('Error fetching data:', err);
      } finally {
        setIsFetching(false);
      }
    };

    if (jwt && userId) {
      fetchData();
    }
  }, [jwt, userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      console.log('Updating user data:', formData);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.error?.message || errorData.message || 'Failed to update user');
      }

      const data = await response.json();
      console.log('User updated successfully:', data);
      router.push('/dashboard/admin/users');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error updating user:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            User not found
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
          >
            <FiArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Edit User</h1>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username *
              </label>
              <Input
                type="text"
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="mt-1"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email *
              </label>
              <Input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Role *
              </label>
              <Select
                value={formData.role.toString()}
                onValueChange={(value) => setFormData({ ...formData, role: Number(value) })}
                disabled={isLoading}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      {role.name} {role.description && `- ${role.description}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label htmlFor="organizationID" className="block text-sm font-medium text-gray-700">
                Organization ID
              </label>
              <Input
                type="text"
                id="organizationID"
                value={formData.organizationID}
                onChange={(e) => setFormData({ ...formData, organizationID: e.target.value })}
                className="mt-1"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="confirmed"
                  checked={formData.confirmed}
                  onChange={(e) => setFormData({ ...formData, confirmed: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={isLoading}
                />
                <label htmlFor="confirmed" className="ml-2 block text-sm text-gray-700">
                  Email confirmed (user can login)
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="blocked"
                  checked={formData.blocked}
                  onChange={(e) => setFormData({ ...formData, blocked: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={isLoading}
                />
                <label htmlFor="blocked" className="ml-2 block text-sm text-gray-700">
                  Block user (prevent login)
                </label>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Current User Info</h3>
              <div className="text-sm text-gray-600">
                <p><strong>ID:</strong> {user.id}</p>
                <p><strong>Current Role:</strong> {user.role?.name || 'No Role'}</p>
                <p><strong>Status:</strong> {user.confirmed ? 'Confirmed' : 'Unconfirmed'} {user.blocked ? '(Blocked)' : ''}</p>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <FiSave className="w-5 h-5 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserPage; 