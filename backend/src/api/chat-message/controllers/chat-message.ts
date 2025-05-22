// path: src/api/chat-message/controllers/chat-message.js

'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::chat-message.chat-message', ({ strapi }) => ({
  async create(ctx) {
    const { content, sender, receiver, course } = ctx.request.body.data;

    if (!content || !sender || !receiver || !course) {
      return ctx.badRequest('Missing required fields');
    }

    const entry = await strapi.entityService.create('api::chat-message.chat-message', {
      data: {
        content,
        sender: sender,    // Gán trực tiếp ID luôn
        receiver: receiver,
        course: course,
      },
    });

    return { data: entry };
  }
}));
