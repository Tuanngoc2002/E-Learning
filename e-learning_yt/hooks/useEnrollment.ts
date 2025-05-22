import { useState, useEffect } from 'react';
import { enrollmentService } from '@/services/enrollmentService';
import { useAuth } from './useAuth';
import { Course } from '@/types/course';

export const useEnrollment = (courseId?: number) => {
  const { isAuthenticated, user, jwt } = useAuth();
  const [isEnrolled, setIsEnrolled] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);

  // Check if user is enrolled in a specific course
  useEffect(() => {
    const checkEnrollmentStatus = async () => {
      if (!isAuthenticated || !user || !courseId || !jwt) {
        setIsEnrolled(false);
        return;
      }

      try {
        const enrolled = await enrollmentService.checkEnrollment(courseId, user.id);
        setIsEnrolled(enrolled);
      } catch (err) {
        console.error('Error checking enrollment status:', err);
        setIsEnrolled(false);
      }
    };

    checkEnrollmentStatus();
  }, [isAuthenticated, user, courseId, jwt]);

  // Fetch all enrolled courses for the user
  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      if (!isAuthenticated || !user || !jwt) {
        setEnrolledCourses([]);
        return;
      }

      try {
        const courses = await enrollmentService.getUserEnrollments(user.id);
        setEnrolledCourses(courses);
      } catch (err) {
        console.error('Error fetching enrolled courses:', err);
        setEnrolledCourses([]);
      }
    };

    fetchEnrolledCourses();
  }, [isAuthenticated, user, jwt]);

  // Enroll in a course
  const enrollInCourse = async (courseId: number): Promise<boolean> => {
    if (!isAuthenticated || !user || !jwt) {
      setError('You must be logged in to enroll in a course');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await enrollmentService.enrollInCourse(courseId, user.id);
      
      if (result.success) {
        setIsEnrolled(true);
        // Refresh enrolled courses
        const courses = await enrollmentService.getUserEnrollments(user.id);
        setEnrolledCourses(courses);
        return true;
      } else {
        setError(result.message);
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to enroll in course');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isEnrolled,
    isLoading,
    error,
    enrolledCourses,
    enrollInCourse,
  };
}; 