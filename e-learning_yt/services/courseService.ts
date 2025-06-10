import { Course, CourseResponse, Lesson } from '@/types/course';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';
const API_TOKEN = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;
const token = Cookies.get('jwt');

const headers = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
};

export const courseService = {
  async getAllCourses(page = 1, pageSize = 10, search = ''): Promise<CourseResponse> {
    try {
      const searchFilter = search ? `&filters[name][$containsi]=${search}` : '';
      const response = await fetch(
        `${API_URL}/api/courses?populate=*&pagination[page]=${page}&pagination[pageSize]=${pageSize}${searchFilter}`,
        { headers }
      );
      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }
  },

  async getCourseById(id: number): Promise<Course> {
    try {
      const response = await fetch(
        `${API_URL}/api/courses/${id}?populate[lessons][populate]=*&populate[lessons][sort]=order:asc&populate[user_courses][populate]=*`,
        { headers }
      );
      if (!response.ok) {
        throw new Error('Failed to fetch course');
      }
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching course:', error);
      throw error;
    }
  },

  async getPublishedCourses(page = 1, pageSize = 10, search = '', difficulty?: string, minPrice?: number, maxPrice?: number): Promise<CourseResponse> {
    try {
      const searchFilter = search ? `&filters[name][$containsi]=${search}` : '';
      const difficultyFilter = difficulty ? `&filters[difficulty][$eq]=${difficulty}` : '';
      const priceFilter = minPrice !== undefined && maxPrice !== undefined 
        ? `&filters[price][$gte]=${minPrice}&filters[price][$lte]=${maxPrice}`
        : '';
      
      const response = await fetch(
        `${API_URL}/api/courses?filters[isPublished][$eq]=true${searchFilter}${difficultyFilter}${priceFilter}&populate=*&pagination[page]=${page}&pagination[pageSize]=${pageSize}`,
        { headers }
      );
      if (!response.ok) {
        throw new Error('Failed to fetch published courses');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching published courses:', error);
      throw error;
    }
  },

  async getInstructorCourses(instructorId: number, page = 1, pageSize = 10, publishedOnly = false): Promise<CourseResponse> {
    try {
      const publishedFilter = publishedOnly ? '&filters[isPublished][$eq]=true' : '';
      const response = await fetch(
        `${API_URL}/api/courses?filters[instructor][id][$eq]=${instructorId}${publishedFilter}&populate=*&pagination[page]=${page}&pagination[pageSize]=${pageSize}`,
        { headers }
      );
      if (!response.ok) {
        throw new Error('Failed to fetch instructor courses');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching instructor courses:', error);
      throw error;
    }
  },

  async updateCoursePublishStatus(id: number, isPublished: boolean): Promise<Course> {
    try {
      // If we want to unpublish (delete), use DELETE method
      // If we want to publish, we need to implement a publish endpoint
      if (!isPublished) {
        const response = await fetch(`${API_URL}/api/courses/${id}`, {
          method: 'DELETE',
          headers,
        });
        
        if (!response.ok) {
          throw new Error('Failed to update course publish status');
        }
        
        const data = await response.json();
        return data.data;
      } else {
        // For publishing, we need to implement a publish endpoint
        // This is a placeholder - you'll need to implement the actual publish endpoint
        const response = await fetch(`${API_URL}/api/courses/${id}/publish`, {
          method: 'POST',
          headers,
        });
        
        if (!response.ok) {
          throw new Error('Failed to publish course');
        }
        
        const data = await response.json();
        return data.data;
      }
    } catch (error) {
      console.error('Error updating course publish status:', error);
      throw error;
    }
  },

  async updateCourse(id: number, courseData: Partial<Course>): Promise<Course> {
    try {
      const response = await fetch(`${API_URL}/api/courses/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          data: courseData,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update course');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error updating course:', error);
      throw error;
    }
  },

  async getCourseWithLessons(id: number): Promise<{ course: Course; lessons: Lesson[] }> {
    try {
      // Đầu tiên, lấy thông tin khóa học mà không populate lessons
      const courseResponse = await fetch(
        `${API_URL}/api/courses/${id}`,
        { headers }
      );
      
      if (!courseResponse.ok) {
        throw new Error('Failed to fetch course');
      }
      
      const courseData = await courseResponse.json();
      
      // Sau đó, thử lấy lessons nếu có
      let lessons: Lesson[] = [];
      try {
        const lessonsResponse = await fetch(
          `${API_URL}/api/courses/${id}?populate[lessons][populate]=*&populate[lessons][sort]=order:asc`,
          { headers }
        );
        
        if (lessonsResponse.ok) {
          const lessonsData = await lessonsResponse.json();
          lessons = lessonsData.data.lessons?.data || [];
        }
      } catch (lessonsError) {
        console.warn('Could not fetch lessons:', lessonsError);
        // Tiếp tục với lessons rỗng
      }
      
      return {
        course: courseData.data,
        lessons: lessons
      };
    } catch (error) {
      console.error('Error fetching course with lessons:', error);
      throw error;
    }
  }
}; 