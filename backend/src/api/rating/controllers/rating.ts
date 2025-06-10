/**
 * rating controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::rating.rating', ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('Bạn cần đăng nhập.');

    const { stars, comments, course } = ctx.request.body.data;
    if (!stars || !course) return ctx.badRequest('Thiếu thông tin đánh giá hoặc khóa học.');

    try {
      // Kiểm tra xem người dùng đã đăng ký khóa học chưa
      const userCourse = await strapi.db.query('api::user-course.user-course').findOne({
        where: {
          user: user.id,
          course: course
        }
      });

      if (!userCourse) {
        return ctx.badRequest('Bạn cần đăng ký khóa học trước khi đánh giá.');
      }

      // Kiểm tra xem người dùng đã đánh giá khóa học này chưa
      const existingRating = await strapi.db.query('api::rating.rating').findOne({
        where: {
          user: user.id,
          course: course
        }
      });

      if (existingRating) {
        return ctx.badRequest('Bạn đã đánh giá khóa học này rồi.');
      }

      // Tạo đánh giá mới
      const createdRating = await strapi.entityService.create('api::rating.rating', {
        data: {
          stars,
          comments,
          user: user.id,
          course,
        },
        populate: ['user'],
      });

      return this.transformResponse(createdRating);
    } catch (err) {
      console.error('❌ Lỗi tạo đánh giá:', err);
      return ctx.internalServerError('Không thể tạo đánh giá.');
    }
  }
}));
