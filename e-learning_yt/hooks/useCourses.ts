import { useState, useEffect } from 'react';
import { Course } from '@/types/course';
import { courseService } from '@/services/courseService';

interface UseCoursesOptions {
  page?: number;
  pageSize?: number;
  publishedOnly?: boolean;
  search?: string;
  difficulty?: string;
  minPrice?: number;
  maxPrice?: number;
}

export const useCourses = (options: UseCoursesOptions = {}) => {
  const { 
    page = 1, 
    pageSize = 10, 
    publishedOnly = true, 
    search = '',
    difficulty,
    minPrice,
    maxPrice
  } = options;
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page,
    pageSize,
    pageCount: 0,
    total: 0
  });

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await (publishedOnly 
          ? courseService.getPublishedCourses(page, pageSize, search, difficulty, minPrice, maxPrice)
          : courseService.getAllCourses(page, pageSize, search)
        );
        setCourses(response.data);
        setPagination(response.meta.pagination);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [page, pageSize, publishedOnly, search, difficulty, minPrice, maxPrice]);

  return { 
    courses, 
    loading, 
    error,
    pagination,
    hasNextPage: pagination.page < pagination.pageCount,
    hasPreviousPage: pagination.page > 1
  };
}; 