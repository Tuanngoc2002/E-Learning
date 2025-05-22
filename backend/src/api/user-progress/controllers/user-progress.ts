import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::user-progress.user-progress', ({ strapi }) => ({
  async findOne(ctx) {
    const user = ctx.state.user;
    console.log("🔍 ctx.state.user (GET /:id):", user);

    // Gọi lại hàm mặc định
    const { id } = ctx.params;
    const entity = await strapi.entityService.findOne('api::user-progress.user-progress', id, ctx.query);
    return { data: entity };
  },

  async create(ctx) {
    const user = ctx.state.user;
    const data = ctx.request.body.data;
    
    console.log("🧠 ctx.state.user:", user);
    console.log("📦 BEFORE data:", data);

    
    // Gán user (kiểu relation)
    if (user?.id) {
      data.user = user.id;
    }
    if (data.course) {
      const course = await strapi.entityService.findOne('api::course.course', data.course, {
        fields: ['organizationID'],
      });

      if (course?.organizationID) {
        data.organizationID = course.organizationID;
      } else {
        return ctx.badRequest("Course không có organizationID.");
      }
    } else {
      return ctx.badRequest("Thiếu course ID trong dữ liệu gửi lên.");
    }

    // Gán accessedAt nếu chưa có
    if (!data.accessedAt) {
      data.accessedAt = new Date().toISOString();
    }

    // Gán timeOfDay nếu chưa có
    if (!data.timeOfDay) {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 11) data.timeOfDay = 'morning';
      else if (hour >= 11 && hour < 17) data.timeOfDay = 'afternoon';
      else if (hour >= 17 && hour < 21) data.timeOfDay = 'evening';
      else data.timeOfDay = 'night';
    }
    console.log("📦 AFTER data:", data);
    const entity = await strapi.entityService.create('api::user-progress.user-progress', {
        data: data,
      });
  
      return { data: entity };
  }
}));
