// import { useQuery } from '@apollo/client';
// import { COURSE_QUERIES } from '@/services/course.service';
// import { Course } from '@/types';

// export const useCourses = () => {
//   const { loading, error, data } = useQuery(COURSE_QUERIES.GET_ALL);
//   return { 
//     loading, 
//     error, 
//     courses: (data?.courses?.data || []) as Course[] 
//   };
// };

// export const useCourseById = (id: string) => {
//   const { loading, error, data } = useQuery(COURSE_QUERIES.GET_BY_ID, {
//     variables: { id },
//     skip: !id
//   });
//   return { 
//     loading, 
//     error, 
//     course: data?.course?.data as Course | null 
//   };
// }; 