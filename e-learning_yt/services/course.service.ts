// hooks/useCoursesWithSWR.ts
import useSWR from 'swr';
import { gql, ApolloClient, InMemoryCache } from '@apollo/client';

const GET_COURSES = gql`
  query Courses {
  courses {
    documentId
    name
    price
    difficulty
    ratings {
      stars
    }
    lessons {
      title
    }
    instructor {
      username
    }
    image {
      url
    }
  }
}
`;

const GET_COURSE_DETAIL = gql`
  query Course($documentId: ID!) {
  course(documentId: $documentId) {
    price
    name
    exam {
      questions {
        questionText
        options
        id
        correctAnswer
      }
    }
    difficulty
    ratings {
      comments
      stars
      user {
        username
      }
      documentId
    }
    lessons {
      content
      documentId
      title
      videoUrl
    }
  }
}
`
;
const ENROLL_COURSE = gql`
mutation Mutation($data: UserCourseInput!) {
  createUserCourse(data: $data) {
    enrolledAt
    documentId    
  }
}
`;


const apolloClient = new ApolloClient({
  uri: `${process.env.NEXT_PUBLIC_API_URL}/graphql`,
  cache: new InMemoryCache(),
});

const fetcher = async () => {
  const { data } = await apolloClient.query({
    query: GET_COURSES,
    fetchPolicy: 'network-only', // Không dùng cache mặc định
  });
  return data;
};

const fetcherCourseDetail = async (documentId: string) => {
  const { data } = await apolloClient.query({
    query: GET_COURSE_DETAIL,
    variables: { documentId },
    fetchPolicy: 'network-only', // Không dùng cache mặc định
  });
  return data;
};

const fetcherEnrollCourse = async (courseId: string) => {
  const { data } = await apolloClient.mutate({
    mutation: ENROLL_COURSE,
    variables: { course: courseId },
  });
  return data;
};  

export const useCourses = () => {
  const { data, error, isLoading, mutate } = useSWR('courses', fetcher);

  return {
    courses: data?.courses || [],
    isLoading,
    isError: !!error,
    mutate,
  };
};

export const useCourse = (documentId: string) => {
  const { data, error, isLoading, mutate } = useSWR(`course-${documentId}`, () => fetcherCourseDetail(documentId));

  return {
    course: data?.course || null,
    isLoading,
    isError: !!error,
    mutate,
  };
};

export const useEnrollCourse = (courseId: string) => {
  const { data, error, isLoading, mutate } = useSWR(`enroll-course-${courseId}`, () => fetcherEnrollCourse(courseId));

  return {
    enrollCourse: data?.enrollCourse || null,
    isLoading,
    isError: !!error,
    mutate,
  };
};