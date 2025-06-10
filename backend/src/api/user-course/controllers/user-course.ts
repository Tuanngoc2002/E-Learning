import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::user-course.user-course', ({ strapi }) => ({
  async enroll(ctx) {
    console.log("🧠 Bắt đầu xử lý enroll");

    const user = ctx.state.user;
    console.log("👤 ctx.state.user:", user);

    if (!user) {
      console.error("❌ Không có user trong ctx.state");
      return ctx.unauthorized('User not found');
    }

    const { course } = ctx.request.body.data || {};
    console.log("📦 Course ID nhận từ client:", course);

    if (!course) {
      console.error("❌ Không có course trong request");
      return ctx.badRequest('Course is required');
    }

    const existing = await strapi.entityService.findMany('api::user-course.user-course', {
      filters: {
        user: user.id,
        course: course,
      },
    });
    console.log("🔍 Đã kiểm tra trùng:", existing.length);

    if (existing.length > 0) {
      console.warn("⚠️ User đã đăng ký khóa học này");
      return ctx.badRequest('Already enrolled');
    }

    const result = await strapi.entityService.create('api::user-course.user-course', {
      data: {
        user: user.id,
        course,
        enrolledAt: new Date(),
      },
    });

    console.log("✅ Đăng ký thành công:", result);

    return ctx.created({ data: result });

    const enrolledCourses = await strapi.entityService.findMany('api::user-course.user-course', {
      filters: {
        user: user.id
      },
      populate: ['course']
    });

    return ctx.send({ data: enrolledCourses });
  },

  async enrolled(ctx) {
    const user = ctx.state.user;
    
    if (!user) {
      return ctx.unauthorized('User not found');
    }

    const enrolledCourses = await strapi.entityService.findMany('api::user-course.user-course', {
      filters: {
        user: user.id
      },
      populate: ['course']
    });

    return ctx.send({ data: enrolledCourses });
  },

  async findAll(ctx) {
    try {
      const enrollments = await strapi.entityService.findMany('api::user-course.user-course', {
        populate: ['user', 'course']
      });

      return ctx.send({ data: enrollments });
    } catch (error) {
      console.error('Error fetching all enrollments:', error);
      return ctx.badRequest('Failed to fetch enrollments');
    }
  }
}));
