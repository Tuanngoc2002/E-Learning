import { useState, useEffect } from 'react';
import { enrollmentService, UserCourse } from '@/services/enrollmentService';
import { useAuth } from './useAuth';

export const useEnrollment = (courseId?: number) => {
  const { isAuthenticated, user, jwt } = useAuth();
  const [isEnrolled, setIsEnrolled] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<UserCourse[]>([]);

  // Check if user is enrolled in a specific course
  useEffect(() => {
    const checkEnrollmentStatus = async () => {
      if (!isAuthenticated || !user || !courseId || !jwt) {
        setIsEnrolled(false);
        return;
      }

      try {
        const enrolled = await enrollmentService.checkEnrollmentStatus(courseId, Number(user.id), jwt);
        setIsEnrolled(!!enrolled);
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
        const courses = await enrollmentService.getUserEnrollments(Number(user.id), jwt);
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
      await enrollmentService.enrollInCourse(courseId, jwt);
      setIsEnrolled(true);
      // Refresh enrolled courses
      const courses = await enrollmentService.getUserEnrollments(Number(user.id), jwt);
      setEnrolledCourses(courses);
      return true;
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