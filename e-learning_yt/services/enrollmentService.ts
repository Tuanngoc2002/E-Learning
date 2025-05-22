import { Course } from '@/types/course';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';

export const enrollmentService = {
  async enrollInCourse(courseId: number, userId: string): Promise<{ success: boolean; message: string }> {
    try {
      // Get the user's JWT token from cookies
      const token = Cookies.get('jwt');
      
      if (!token) {
        return { 
          success: false, 
          message: 'Authentication token not found. Please log in again.' 
        };
      }

      const response = await fetch(`${API_URL}/api/user-courses/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          data: {
            course: courseId
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to enroll in course');
      }

      return { success: true, message: 'Successfully enrolled in course' };
    } catch (error) {
      console.error('Error enrolling in course:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to enroll in course' 
      };
    }
  },

  async checkEnrollment(courseId: number, userId: string): Promise<boolean> {
    try {
      // Get the user's JWT token from cookies
      const token = Cookies.get('jwt');
      
      if (!token) {
        return false;
      }

      const response = await fetch(
        `${API_URL}/api/user-courses?filters[course][id][$eq]=${courseId}&filters[user][id][$eq]=${userId}`,
        { 
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to check enrollment status');
      }

      const data = await response.json();
      return data.data && data.data.length > 0;
    } catch (error) {
      console.error('Error checking enrollment:', error);
      return false;
    }
  },

  async getUserEnrollments(userId: string): Promise<Course[]> {
    try {
      // Get the user's JWT token from cookies
      const token = Cookies.get('jwt');
      
      if (!token) {
        return [];
      }

      const response = await fetch(
        `${API_URL}/api/user-courses?filters[user][id][$eq]=${userId}&populate[course][populate]=*`,
        { 
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch user enrollments');
      }

      const data = await response.json();
      return data.data.map((enrollment: any) => enrollment.course);
    } catch (error) {
      console.error('Error fetching user enrollments:', error);
      return [];
    }
  }
}; 