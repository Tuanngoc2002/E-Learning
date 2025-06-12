'use strict';

interface Course {
  id: number;
  documentId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  locale: string | null;
  descriptions: string | null;
  difficulty: string;
  price: number;
  isPublished: boolean;
  organizationID: string | null;
  rating?: number;
  students_count?: number;
  completion_rate?: number;
  category?: {
    id: number;
    documentId: string;
    type: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string | null;
    locale: string | null;
  };
  difficulty_level?: { id: number; name: string };
  tags?: Array<{ id: number; name: string }>;
  user_courses?: Array<{
    id: number;
    documentId: string;
    enrolledAt: string;
  }>;
  ratings?: Array<{
    id: number;
    stars: number;
    comments: string;
    user: {
      id: number;
      username: string;
    };
  }>;
}

interface Filter {
  $and: Array<any>;
}

interface ScoredCourse extends Course {
  score: number;
  relevance?: number;
}

const calculateSimilarityScore = (course1: Course, course2: Course): number => {
  let score = 0;

  // Category similarity (highest weight - 5 points)
  if (course1.category?.id === course2.category?.id) {
    score += 5;
  }

  // Difficulty level similarity (3 points)
  if (course1.difficulty_level?.id === course2.difficulty_level?.id) {
    score += 3;
  }

  // Tags similarity (2 points per matching tag)
  const course1Tags = course1.tags?.map(tag => tag.id) || [];
  const course2Tags = course2.tags?.map(tag => tag.id) || [];
  const commonTags = course1Tags.filter(tagId => course2Tags.includes(tagId));
  score += commonTags.length * 2;

  // Price range similarity (up to 2 points)
  if (course1.price && course2.price) {
    const priceDiff = Math.abs(course1.price - course2.price);
    const maxPrice = Math.max(course1.price, course2.price);
    const priceScore = 2 * (1 - priceDiff / maxPrice);
    score += priceScore;
  }

  // Popularity factors
  if (course2.ratings && course2.ratings.length > 0) {
    const avgRating = course2.ratings.reduce((acc, rating) => acc + rating.stars, 0) / course2.ratings.length;
    score += avgRating;
  }
  if (course2.students_count) score += Math.min(3, Math.log10(course2.students_count));
  if (course2.completion_rate) score += (course2.completion_rate / 100) * 2;

  return score;
};

const getRecommendedCourses = async (courseId: number, userId?: number) => {
  try {
    // Get the current course
    const currentCourse = await strapi.db.query('api::course.course').findOne({
      where: { id: courseId },
      populate: ['category', 'tags', 'difficulty_level']
    }) as Course;

    if (!currentCourse) {
      throw new Error('Course not found');
    }

    // Get user's enrolled courses if userId is provided
    let enrolledCourseIds: number[] = [];
    if (userId) {
      const userCourses = await strapi.db.query('api::user-course.user-course').findMany({
        where: { user: userId },
        populate: ['course']
      });
      enrolledCourseIds = userCourses
        .map(uc => uc.course?.id)
        .filter((id): id is number => typeof id === 'number');
    }

    // Get all potential courses
    const allCourses = await strapi.db.query('api::course.course').findMany({
      populate: [
        'category', 
        'tags', 
        'difficulty_level', 
        'thumbnail', 
        'instructor', 
        'user_courses',
        'ratings'
      ]
    }) as Course[];

    // Filter out enrolled and duplicate courses
    const filteredCourses = allCourses.filter(course => {
      // Exclude current course and courses with same name
      if (course.id === courseId || course.name === currentCourse.name) return false;
      
      // Exclude enrolled courses (from user_courses table)
      if (enrolledCourseIds.includes(course.id)) return false;
      
      // Exclude courses that have user_courses (already enrolled)
      if (course.user_courses && course.user_courses.length > 0) return false;
      
      // Only include courses with the same category
      if (currentCourse.category?.id !== course.category?.id) return false;
      
      return true;
    });

    // Remove duplicate courses based on documentId and name
    const uniqueCourses = filteredCourses.reduce((acc: Course[], current) => {
      const isDuplicate = acc.some(course => 
        course.documentId === current.documentId || 
        course.name.toLowerCase() === current.name.toLowerCase()
      );
      if (!isDuplicate) acc.push(current);
      return acc;
    }, []);

    // Calculate scores and get top 4
    const scoredCourses = uniqueCourses
      .map(course => ({
        ...course,
        score: calculateSimilarityScore(currentCourse, course)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);

    // Normalize scores
    const scores = scoredCourses.map(c => c.score);
    const maxScore = Math.max(...scores);
    const minScore = Math.min(...scores);
    const range = maxScore - minScore;

    return scoredCourses.map(course => ({
      ...course,
      category: course.category ? {
        id: course.category.id,
        documentId: course.category.documentId,
        type: course.category.type,
        createdAt: course.category.createdAt,
        updatedAt: course.category.updatedAt,
        publishedAt: course.category.publishedAt,
        locale: course.category.locale
      } : null,
      relevance: range > 0 ? (course.score - minScore) / range : 1
    }));
  } catch (error) {
    console.error('Error getting recommended courses:', error);
    return [];
  }
};

module.exports = {
  getRecommendedCourses
};
