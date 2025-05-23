'use strict';

interface Course {
  id: number;
  documentId: string;
  name: string;
  createdAt: string;
  rating?: number;
  students_count?: number;
  completion_rate?: number;
  category?: { id: number; name: string };
  difficulty_level?: { id: number; name: string };
  tags?: Array<{ id: number; name: string }>;
  price?: number;
}

interface Filter {
  $and: Array<any>;
}

interface ScoredCourse extends Course {
  score: number;
}

const calculateSimilarityScore = (course1: Course, course2: Course): number => {
  let score = 0;

  // Category similarity (highest weight)
  if (course1.category?.id === course2.category?.id) {
    score += 5;
  }

  // Difficulty level similarity
  if (course1.difficulty_level?.id === course2.difficulty_level?.id) {
    score += 3;
  }

  // Tags similarity
  const course1Tags = new Set(course1.tags?.map(tag => tag.id) || []);
  const course2Tags = new Set(course2.tags?.map(tag => tag.id) || []);
  const commonTags = new Set([...course1Tags].filter(x => course2Tags.has(x)));
  score += commonTags.size * 2;

  // Price range similarity (smaller difference = higher score)
  if (course1.price && course2.price) {
    const priceDiff = Math.abs(course1.price - course2.price);
    score += Math.max(0, 2 - (priceDiff / 100)); // Max 2 points for price similarity
  }

  // Popularity factors
  if (course2.rating) score += course2.rating;
  if (course2.students_count) score += Math.min(3, Math.log10(course2.students_count));
  if (course2.completion_rate) score += (course2.completion_rate / 100) * 2;

  return score;
};

const getRecommendedCourses = async (courseId: number) => {
  try {
    // Get the current course with all necessary details
    const currentCourse = await strapi.db.query('api::course.course').findOne({
      where: { id: courseId },
      populate: ['category', 'tags', 'difficulty_level']
    }) as Course;

    if (!currentCourse) {
      throw new Error('Course not found');
    }

    // Get all potential courses for recommendation
    const allCourses = await strapi.db.query('api::course.course').findMany({
      where: {
        $and: [
          { id: { $ne: courseId } },
          { name: { $ne: currentCourse.name } } // Exclude courses with same name
        ]
      },
      populate: ['category', 'tags', 'difficulty_level', 'thumbnail', 'instructor', 'user_courses']
    }) as Course[];

    // Remove duplicate courses based on documentId and name
    const uniqueCourses = allCourses.reduce((acc: Course[], current) => {
      const isDuplicate = acc.some(course => 
        course.documentId === current.documentId || 
        course.name.toLowerCase() === current.name.toLowerCase()
      );
      if (!isDuplicate) {
        acc.push(current);
      }
      return acc;
    }, []);

    // Calculate similarity scores for each course
    const scoredCourses: ScoredCourse[] = uniqueCourses
      .map(course => ({
        ...course,
        score: calculateSimilarityScore(currentCourse, course)
      }))
      .sort((a, b) => b.score - a.score) // Sort by score in descending order
      .slice(0, 4); // Get top 4 recommendations

    // Normalize scores to a 0-1 range for relevance
    const maxScore = Math.max(...scoredCourses.map(c => c.score));
    const minScore = Math.min(...scoredCourses.map(c => c.score));
    const scoreRange = maxScore - minScore;

    return scoredCourses.map(course => ({
      ...course,
      relevance: scoreRange > 0 
        ? (course.score - minScore) / scoreRange
        : 1
    }));
  } catch (error) {
    console.error('Error getting recommended courses:', error);
    return [];
  }
};

module.exports = {
  getRecommendedCourses
};
