import { Course } from '@/types/course';
import Cookies from 'js-cookie';

export interface EnrollmentData {
  course: number;
  user?: number;
}

export interface UserCourse {
  id: number;
  progress: number;
  enrolledAt: string;
  lastAccessed?: string;
  course: {
    id: number;
    name: string;
    descriptions: string;
    difficulty: string;
    price: number | null;
    isPublished: boolean;
  };
  user: {
    id: number;
    username: string;
    email: string;
  };
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';

export const enrollmentService = {
  async enrollInCourse(courseId: number, jwt: string): Promise<UserCourse> {
    try {
      const response = await fetch(`${API_URL}/api/user-courses/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          data: {
            course: courseId
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || errorData.message || 'Failed to enroll in course');
      }

      return await response.json();
    } catch (error) {
      console.error('Error enrolling in course:', error);
      throw error;
    }
  },

  async getUserEnrollments(userId: number, jwt: string): Promise<UserCourse[]> {
    try {
      const response = await fetch(
        `${API_URL}/api/user-courses?populate=course,user&filters[user][id][$eq]=${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${jwt}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch user enrollments');
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching user enrollments:', error);
      throw error;
    }
  },

  async updateProgress(enrollmentId: number, progress: number, jwt: string): Promise<UserCourse> {
    try {
      const response = await fetch(`${API_URL}/api/user-courses/${enrollmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          data: {
            progress,
            lastAccessed: new Date().toISOString()
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to update progress');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating progress:', error);
      throw error;
    }
  },

  async unenrollFromCourse(enrollmentId: number, jwt: string): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/api/user-courses/${enrollmentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${jwt}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to unenroll from course');
      }
    } catch (error) {
      console.error('Error unenrolling from course:', error);
      throw error;
    }
  },

  async checkEnrollmentStatus(courseId: number, userId: number, jwt: string): Promise<UserCourse | null> {
    try {
      const response = await fetch(
        `${API_URL}/api/user-courses?populate=course,user&filters[course][id][$eq]=${courseId}&filters[user][id][$eq]=${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${jwt}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to check enrollment status');
      }

      const data = await response.json();
      return data.data && data.data.length > 0 ? data.data[0] : null;
    } catch (error) {
      console.error('Error checking enrollment status:', error);
      throw error;
    }
  },

  async getCourseEnrollments(courseId: number, jwt: string): Promise<UserCourse[]> {
    try {
      const response = await fetch(
        `${API_URL}/api/user-courses?populate=course,user&filters[course][id][$eq]=${courseId}`,
        {
          headers: {
            'Authorization': `Bearer ${jwt}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch course enrollments');
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching course enrollments:', error);
      throw error;
    }
  },

  async getEnrollmentStats(jwt: string): Promise<{
    totalEnrollments: number;
    completedCourses: number;
    inProgressCourses: number;
    averageProgress: number;
  }> {
    try {
      const response = await fetch(
        `${API_URL}/api/user-courses?populate=course`,
        {
          headers: {
            'Authorization': `Bearer ${jwt}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch enrollment stats');
      }

      const data = await response.json();
      const enrollments = data.data || [];

      const totalEnrollments = enrollments.length;
      const completedCourses = enrollments.filter((e: any) => e.progress === 100).length;
      const inProgressCourses = enrollments.filter((e: any) => e.progress > 0 && e.progress < 100).length;
      const averageProgress = totalEnrollments > 0 
        ? enrollments.reduce((sum: number, e: any) => sum + (e.progress || 0), 0) / totalEnrollments 
        : 0;

      return {
        totalEnrollments,
        completedCourses,
        inProgressCourses,
        averageProgress: Math.round(averageProgress)
      };
    } catch (error) {
      console.error('Error fetching enrollment stats:', error);
      return {
        totalEnrollments: 0,
        completedCourses: 0,
        inProgressCourses: 0,
        averageProgress: 0
      };
    }
  }
}; 