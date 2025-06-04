/**
 * course controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::course.course', ({ strapi }) => ({
  async find(ctx) {

    const { data, meta } = await super.find(ctx);
    const enrichedData = await Promise.all(
      data.map(async (course) => {
        const courseId = course.id;

        const studentCount = await strapi.db.query('api::user-course.user-course').count({
          where: { course: courseId },
        });

        return {
          ...course,
          attributes: {
            ...course.attributes,
            studentCount, // 👈 Chèn số lượng student vào attributes
          },
        };
      })
    );
    return { data: enrichedData, meta };
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
        'exam',
        'exam.questions'
      ],
    });

    if (!entity) {
      return ctx.notFound();
    }

    const studentCount = await strapi.db.query('api::user-course.user-course').count({
      where: { course: id },
    });

    return {
      data: {
        ...entity,
        studentCount, // 👈 Trả về số lượng học viên
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