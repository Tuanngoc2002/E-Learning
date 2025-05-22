'use strict';

const { sanitize } = require('@strapi/utils');

module.exports = {

  async updateMe(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const data = ctx.request.body;

    try {
      const updated = await strapi.entityService.update('plugin::users-permissions.user', user.id, {
        data: {
          username: data.username,
          email: data.email,
          organizationID: data.organizationID || null,
        },
      });
  
      if (!updated) {
        return ctx.internalServerError('Failed to update user.');
      }
  
      const sanitized = await sanitize.contentAPI.output(updated, strapi.getModel('plugin::users-permissions.user'));
      return ctx.send({ data: sanitized });
    } catch (error) {
      return ctx.internalServerError('An error occurred while updating the user.');
    }
  },

  async me(ctx) {
    console.log("🧠 Custom /users/me controller is working");
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized();
    }

    const fullUser = await strapi.entityService.findOne('plugin::users-permissions.user', user.id, {
      populate: ['role'],
    });
    
    console.log("👤 Populated user:", fullUser);
    const sanitizedUser = await sanitize.contentAPI.output(fullUser, strapi.getModel('plugin::users-permissions.user'));

    return ctx.send(sanitizedUser);
  },
  
};
