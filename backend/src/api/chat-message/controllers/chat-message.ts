// path: src/api/chat-message/controllers/chat-message.js

'use strict';

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::chat-message.chat-message', ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;
    
    if (!user) {
      return ctx.unauthorized('Authentication required');
    }

    const { content, senderId, receiverId, courseId, sender, receiver, course } = ctx.request.body.data;

    if (!content) {
      return ctx.badRequest('Content is required');
    }

    // Hỗ trợ cả 2 format: senderId/receiverId/courseId và sender/receiver/course
    const finalSenderId = senderId || sender?.id || sender;
    const finalReceiverId = receiverId || receiver?.id || receiver;
    const finalCourseId = courseId || course?.id || course;

    if (!finalSenderId || !finalReceiverId || !finalCourseId) {
      return ctx.badRequest('Sender, receiver and course are required');
    }

    // Kiểm tra quyền: user chỉ có thể gửi message với senderId là chính mình
    if (finalSenderId.toString() !== user.id.toString()) {
      return ctx.forbidden('You can only send messages as yourself');
    }

    try {
      const entry = await strapi.entityService.create('api::chat-message.chat-message', {
        data: {
          content,
          senderId: finalSenderId.toString(),
          receiverId: finalReceiverId.toString(),
          courseId: finalCourseId.toString(),
          sender: finalSenderId,
          receiver: finalReceiverId,
          course: finalCourseId,
        },
      });

      // Populate sender info để trả về
      const populatedEntry = await strapi.entityService.findOne('api::chat-message.chat-message', entry.id, {
        populate: ['sender', 'receiver', 'course']
      });

      return { data: populatedEntry };
    } catch (error) {
      console.error('Error creating chat message:', error);
      return ctx.internalServerError('Failed to create message');
    }
  },

  async find(ctx) {
    const user = ctx.state.user;
    
    if (!user) {
      return ctx.unauthorized('Authentication required');
    }

    // Cho phép query với filters như course[id]
    const { data, meta } = await super.find(ctx);
    
    return { data, meta };
  }
}));
