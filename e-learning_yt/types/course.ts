export interface Course {
  id: number;
  name: string;
  descriptions: string;
  difficulty: 'easy' | 'medium' | 'hard';
  price: number;
  isPublished: boolean;
  organizationID: string;
  instructor: {
    id: number;
    username: string;
    email: string;
    // Add other instructor fields as needed
  };
  lessons?: Lesson[];
  user_courses?: {
    id: number;
    enrolledAt: string;
  }[];
  exam?: {
    id: number;
    title: string;
    questions: {
      id: number;
      questionText: string;
      options: {
        [key: string]: string;
      };
      correctAnswer: string;
    }[];
  };
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  attributes?: {
    studentCount: number;
    rating?: number;
  };
}

export interface CourseResponse {
  data: Course[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface Lesson {
  id: number;
  documentId?: string;
  title: string;
  content?: string | null;
  videoUrl?: string | null;
  order: number;
  isFree: boolean;
  course?: {
    id: number;
    name: string;
  };
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
}

export interface CourseProgress {
  courseId: string;
  userId: string;
  completedLessons: string[];
  lastAccessedLesson: string;
  progress: number; // percentage
  createdAt: Date;
  updatedAt: Date;
}

export interface CourseReview {
  id: string;
  courseId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
} 