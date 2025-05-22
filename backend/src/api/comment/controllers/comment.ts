/**
 * comment controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::comment.comment', ({ strapi }) => ({
  // CREATE: Thêm comment hoặc reply
  async create(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('Bạn cần đăng nhập.');

    const { content, course, parent } = ctx.request.body.data;
    if (!content || !course) return ctx.badRequest('Thiếu nội dung hoặc thông tin khóa học.');

    try {
      const createdComment = await strapi.entityService.create('api::comment.comment', {
        data: {
          content,
          user: user.id,
          course,
          parent: parent || null,
        },
        populate: ['user', 'replies'],
      });

      return this.transformResponse(createdComment);
    } catch (err) {
      console.error('❌ Lỗi tạo comment:', err);
      return ctx.internalServerError('Không thể tạo comment.');
    }
  },

  // UPDATE: Chỉ được chỉnh sửa comment của chính mình
  async update(ctx) {
    const user = ctx.state.user;
    const commentId = ctx.params.id;

    const existing: any = await strapi.entityService.findOne('api::comment.comment', commentId, {
      populate: ['user'],
    });

    if (!existing) return ctx.notFound('Comment không tồn tại.');
    if (existing.user?.id !== user.id) return ctx.unauthorized('Bạn không có quyền chỉnh sửa.');

    const { content } = ctx.request.body.data;
    const updated = await strapi.entityService.update('api::comment.comment', commentId, {
      data: { content },
    });

    return this.transformResponse(updated);
  },


  // DELETE: Chỉ được xóa comment của chính mình
  async delete(ctx) {
    const user = ctx.state.user;
    const commentId = ctx.params.id;

    const existing: any = await strapi.entityService.findOne('api::comment.comment', commentId, {
      populate: ['user'],
    });

    if (!existing) return ctx.notFound('Comment không tồn tại.');
    if (existing.user?.id !== user.id) return ctx.unauthorized('Bạn không có quyền xóa.');

    await strapi.entityService.delete('api::comment.comment', commentId);
    return ctx.send({ message: 'Xóa thành công.' });
  },


  // FIND: Lấy danh sách comment theo courseId (chỉ comment gốc + replies)
  async find(ctx) {
    const courseId = ctx.query.courseId;

    const filters: any = {};
    if (courseId) filters.course = { id: Number(courseId) };
    filters.parent = { $null: true }; // chỉ lấy comment cha

    const data = await strapi.entityService.findMany('api::comment.comment', {
      filters,
      populate: {
        user: true,
        replies: {
          populate: ['user'],
        },
      },
      sort: { createdAt: 'desc' },
    });

    return this.transformResponse(data);
  }
}));
