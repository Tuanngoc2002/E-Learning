import { useQuery } from '@apollo/client';
import { INSTRUCTOR_QUERIES } from '@/services/instructor.service';
import { Instructor } from '@/types';

export const useInstructors = () => {
  const { loading, error, data } = useQuery(INSTRUCTOR_QUERIES.GET_ALL);
  return { 
    loading, 
    error, 
    instructors: (data?.instructors?.data || []) as Instructor[] 
  };
};

export const useInstructorById = (id: string) => {
  const { loading, error, data } = useQuery(INSTRUCTOR_QUERIES.GET_BY_ID, {
    variables: { id },
    skip: !id
  });
  return { 
    loading, 
    error, 
    instructor: data?.instructor?.data as Instructor | null 
  };
}; 