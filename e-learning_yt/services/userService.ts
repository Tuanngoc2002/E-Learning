export interface User {
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

export interface Role {
  id: number;
  name: string;
  description: string;
  type: string;
}

export interface CreateUserData {
  username: string;
  email: string;
  password: string;
  role: number;
  confirmed: boolean;
  blocked: boolean;
  organizationID: string;
}

export interface UpdateUserData {
  username?: string;
  email?: string;
  role?: number;
  confirmed?: boolean;
  blocked?: boolean;
  organizationID?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';

export const userService = {
  async getAllUsers(jwt: string, search?: string): Promise<User[]> {
    try {
      const searchFilter = search ? `&filters[username][$containsi]=${search}` : '';
      const response = await fetch(
        `${API_URL}/api/users?populate=role${searchFilter}`,
        {
          headers: {
            'Authorization': `Bearer ${jwt}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  async getUserById(id: number, jwt: string): Promise<User> {
    try {
      const response = await fetch(
        `${API_URL}/api/users/${id}?populate=role`,
        {
          headers: {
            'Authorization': `Bearer ${jwt}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },

  async createUser(userData: CreateUserData, jwt: string): Promise<User> {
    try {
      const response = await fetch(`${API_URL}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`,
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || errorData.message || 'Failed to create user');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  async updateUser(id: number, userData: UpdateUserData, jwt: string): Promise<User> {
    try {
      const response = await fetch(`${API_URL}/api/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`,
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || errorData.message || 'Failed to update user');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  async deleteUser(id: number, jwt: string): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/api/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${jwt}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  async blockUser(id: number, blocked: boolean, jwt: string): Promise<User> {
    return this.updateUser(id, { blocked }, jwt);
  },

  async getRoles(): Promise<Role[]> {
    try {
      const response = await fetch(`${API_URL}/api/users-permissions/roles`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch roles');
      }

      const data = await response.json();
      return data.roles || [];
    } catch (error) {
      console.error('Error fetching roles:', error);
      throw error;
    }
  },

  async getUserStats(jwt: string): Promise<{
    total: number;
    confirmed: number;
    blocked: number;
    instructors: number;
  }> {
    try {
      const users = await this.getAllUsers(jwt);
      return {
        total: users.length,
        confirmed: users.filter(u => u.confirmed).length,
        blocked: users.filter(u => u.blocked).length,
        instructors: users.filter(u => u.role?.name === 'instructor').length,
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return { total: 0, confirmed: 0, blocked: 0, instructors: 0 };
    }
  }
}; 