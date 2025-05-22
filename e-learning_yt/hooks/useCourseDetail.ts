import { useState, useEffect } from 'react';
import { Course, Lesson } from '@/types/course';
import { courseService } from '@/services/courseService';

export const useCourseDetail = (courseId: number) => {
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourseDetail = async () => {
      try {
        setLoading(true);
        const data = await courseService.getCourseById(courseId);
        setCourse(data);
        // Set lessons from the course data if they exist
        if (data.lessons) {
          setLessons(data.lessons);
        }
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch course details');
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourseDetail();
    }
  }, [courseId]);

  return { course, lessons, loading, error };
}; 