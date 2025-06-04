export default async (ctx, config, { strapi }) => {
  const user = ctx.state.user;
  const lessonId = ctx.params.id;

  if (!user || user.role?.name.toLowerCase() !== 'instructor') {
    console.log('❌ User is not instructor');
    return false;
  }

  if (!lessonId) {
    console.log('❌ Missing lesson ID');
    return false;
  }

  try {
    // Lấy thông tin lesson và course
    const lesson = await strapi.entityService.findOne("api::lesson.lesson", lessonId, {
      populate: ['course']
    });

    if (!lesson) {
      console.log(`❌ Lesson ${lessonId} not found`);
      return false;
    }

    // Lấy thông tin course để kiểm tra organizationID
    const course = await strapi.entityService.findOne("api::course.course", lesson.course.id, {
      fields: ['organizationID']
    });

    if (!course) {
      console.log(`❌ Course not found for lesson ${lessonId}`);
      return false;
    }

    if (course.organizationID !== user.organizationID) {
      console.log(`❌ User organizationID ${user.organizationID} != course organizationID ${course.organizationID}`);
      return false;
    }

    console.log(`✅ User can delete lesson ${lessonId}`);
    return true;
  } catch (error) {
    console.error('Error in can-delete-lesson policy:', error);
    return false;
  }
}; 