/**
 * course controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::course.course', ({ strapi }) => ({
  async find(ctx) {
    // Override the default find method to include prestige data
    const { data, meta } = await super.find(ctx);
    
    // Get the populated data with prestige
    const populatedData = await Promise.all(
      data.map(async (course) => {
        const courseId = course.id;

        // Get the full course data with prestige
        const fullCourse = await strapi.entityService.findOne('api::course.course', courseId, {
          populate: ['prestige', 'instructor', 'lessons']
        }) as any;

        const studentCount = await strapi.db.query('api::user-course.user-course').count({
          where: { course: courseId },
        });

        // Return the course data with student count
        const courseData = {
          id: fullCourse.id,
          name: fullCourse.name,
          descriptions: fullCourse.descriptions,
          difficulty: fullCourse.difficulty,
          price: fullCourse.price,
          isPublished: fullCourse.isPublished,
          createdAt: fullCourse.createdAt,
          updatedAt: fullCourse.updatedAt,
          studentCount,
          lessons: fullCourse.lessons,
          instructor: fullCourse.instructor ? {
            id: fullCourse.instructor.id,
            username: fullCourse.instructor.username,
            email: fullCourse.instructor.email
          } : null
        };

        // Add prestige data if it exists
        if (fullCourse.prestige) {
          Object.assign(courseData, {
            prestige: {
              data: fullCourse.prestige.map((p: any) => ({
                id: p.id,
                name: p.name
              }))
            }
          });
        }

        return courseData;
      })
    );

    return { data: populatedData, meta };
  },
  async findOne(ctx) {
    const { id } = ctx.params;

    const entity = await strapi.entityService.findOne('api::course.course', id, {
      populate: [
        'lessons',
        'instructor',
        'user_progresses',
        'user_activity_logs',
        'user_course_statuses',
        'recommendation_results',
        'user_courses',
        'user_courses.user',
        'exam',
        'prestige',
        'exam.questions',
        'ratings',
      ],
    }) as any;

    if (!entity) {
      return ctx.notFound();
    }

    const studentCount = await strapi.db.query('api::user-course.user-course').count({
      where: { course: id },
    });

    // Transform user_courses to include user IDs
    const userCourses = entity.user_courses ? entity.user_courses.map((uc: any) => ({
      id: uc.id,
      userId: uc.user?.id,
      status: uc.status,
      createdAt: uc.createdAt,
      updatedAt: uc.updatedAt
    })) : [];

    // Transform ratings to include user information
    const ratings = entity.ratings ? entity.ratings.map((rating: any) => ({
      id: rating.id,
      stars: rating.stars,
      comments: rating.comments,
      createdAt: rating.createdAt,
      updatedAt: rating.updatedAt,
      user: rating.user ? {
        id: rating.user.id,
        username: rating.user.username,
        email: rating.user.email
      } : null
    })) : [];

    return {
      data: {
        ...entity,
        studentCount,
        user_courses: userCourses,
        ratings: ratings
      },
    };
  },
  async delete(ctx) {
    const { id } = ctx.params;

    const existing = await strapi.entityService.findOne('api::course.course', id);

    if (!existing) {
      return ctx.notFound('Course not found');
    }

    // Set isPublished to false and remove publishedAt
    const updated = await strapi.entityService.update('api::course.course', id, {
      data: {
        isPublished: false,
        publishedAt: null, // Nếu bạn dùng draft & publish
      },
    });

    return { data: updated };
  },
  async update(ctx) {
    const { id } = ctx.params;

    const existing = await strapi.entityService.findOne('api::course.course', id);
    if (!existing) return ctx.notFound();
  
    const updated = await strapi.entityService.update('api::course.course', id, {
      data: ctx.request.body.data,
    });

    // Populate lại course với lessons sau khi update
    const courseWithLessons = await strapi.entityService.findOne('api::course.course', id, {
      populate: [
        'lessons',
        'instructor',
        'user_progresses', 
        'user_activity_logs',
        'user_course_statuses',
        'recommendation_results',
        'user_courses',
        'exam',
        'exam.questions'
      ],
    });

    // Tính lại student count
    const studentCount = await strapi.db.query('api::user-course.user-course').count({
      where: { course: id },
    });
  
    return { 
      data: {
        ...courseWithLessons,
        studentCount
      }
    };
  },
  async create(ctx) {
    try {
      const { lessons, instructor, ...courseData } = ctx.request.body.data;
  
      // 1. Tạo course trước
      const newCourse = await strapi.entityService.create('api::course.course', {
        data: {
          ...courseData,
          instructor: instructor?.id || instructor,
        },
      });
  
      // 2. Tạo các lessons và gán course
      if (lessons && Array.isArray(lessons)) {
        await Promise.all(
          lessons.map(async (lesson) => {
            await strapi.entityService.create('api::lesson.lesson', {
              data: {
                ...lesson,
                course: newCourse.id,  // Sửa: Gán trực tiếp ID thay vì object
              },
            });
          })
        );
      }
  
      // 3. TỰ FETCH lại tất cả lessons của course này (không rely vào populate nữa)
      const courseLessons = await strapi.entityService.findMany('api::lesson.lesson', {
        filters: {
          course: {
            id: {
              $eq: newCourse.id,
            },
          },
        },
        populate: {
          course: true, // 👈 populate luôn course trong lesson
        },
      });
  
      // 4. Lấy lại Course, populate instructor
      const courseInfo = await strapi.entityService.findOne('api::course.course', newCourse.id, {
        populate: {
          instructor: true,
        },
      });
  
      // 5. Trả response custom gồm course + lessons
      return {
        data: {
          ...courseInfo,
          lessons: courseLessons,
        },
      };
  
    } catch (error) {
      console.error('❌ Error creating course with lessons:', error);
      return ctx.badRequest(error.message || 'Error creating course with lessons.');
    }
  }
  
  
}));