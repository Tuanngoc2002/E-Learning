export default async (ctx, config, { strapi }) => {
    const user = ctx.state.user;
    const lessonData = ctx.request.body?.data;
  
    if (!user || user.role?.name.toLowerCase() !== 'instructor') {
      return ctx.unauthorized("Chỉ giảng viên mới có quyền tạo bài học");
    }
  
    const courseId = lessonData?.course;
    if (!courseId) {
      return ctx.badRequest("Thiếu khóa học");
    }
  
    // Lấy thông tin khóa học
    const course = await strapi.entityService.findOne("api::course.course", courseId, {
      fields: ['organizationID']
    });
  
    if (!course || course.organizationID !== user.organizationID) {
      return ctx.forbidden("Bạn không có quyền thêm bài học vào khóa học ngoài tổ chức của mình");
    }
  
    return true;
  };
  