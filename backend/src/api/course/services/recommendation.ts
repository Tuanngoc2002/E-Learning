'use strict';

interface Course {
  id: number;
  createdAt: string;
  rating?: number;
  students_count?: number;
  completion_rate?: number;
  category?: { id: number };
  difficulty_level?: { id: number };
  tags?: Array<{ id: number }>;
}

interface Filter {
  $and: Array<any>;
}

const getRecommendedCourses = async (courseId: number) => {
  try {
    const course = await strapi.db.query('api::course.course').findOne({
      where: { id: courseId },
      populate: ['category', 'tags', 'difficulty_level']
    }) as Course;

    if (!course) {
      throw new Error('Course not found');
    }

    const baseFilters: Filter = {
      $and: [
        { id: { $ne: Number(courseId) } }
      ]
    };

    if (course.category) {
      baseFilters.$and.push({ category: { id: course.category.id } });
    }

    if (course.difficulty_level) {
      baseFilters.$and.push({ difficulty_level: { id: course.difficulty_level.id } });
    }

    if (course.tags && course.tags.length > 0) {
      baseFilters.$and.push({ tags: { id: { $in: course.tags.map(tag => tag.id) } } });
    }

    const recommendations = await strapi.db.query('api::course.course').findMany({
      where: baseFilters,
      populate: ['category', 'tags', 'difficulty_level', 'thumbnail', 'instructor', 'user_courses'],
      limit: 4
    }) as Course[];

    return recommendations.map(course => ({
      ...course,
      relevance: 1
    }));
  } catch (error) {
    console.error('Error getting recommended courses:', error);
    return [];
  }
};

module.exports = {
  getRecommendedCourses
};
